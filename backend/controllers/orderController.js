const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes, couponCode } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate products and calculate pricing
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price,
      quantity: item.quantity,
      variant: item.variant || {},
    });
  }

  const shippingCharge = subtotal >= 5000 ? 0 : 299;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shippingCharge + tax;

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    notes,
    pricing: { subtotal, shippingCharge, tax, total, couponCode },
    estimatedDelivery,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
  });

  // Reduce stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Populate and send confirmation email
  const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
  try {
    const { subject, html } = emailTemplates.orderConfirmation(populatedOrder, populatedOrder.user);
    await sendEmail({ to: populatedOrder.user.email, subject, html });
  } catch (err) {
    console.log('Order email failed:', err.message);
  }

  res.status(201).json({ success: true, order });
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .populate('items.product', 'name images slug');

  res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images slug');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // User can only see their own orders (admin can see all)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const cancellableStatuses = ['placed', 'confirmed', 'processing'];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    res.status(400);
    throw new Error('Order cannot be cancelled at this stage');
  }

  order.orderStatus = 'cancelled';
  order.cancelReason = reason;
  order.statusHistory.push({ status: 'cancelled', note: reason });
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  res.json({ success: true, message: 'Order cancelled successfully', order });
});

module.exports = { createOrder, getMyOrders, getOrder, cancelOrder };
