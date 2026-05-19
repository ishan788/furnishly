const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 12, sort = '-createdAt',
    category, minPrice, maxPrice, search,
    brand, material, roomType, isFeatured,
    isNewArrival, isBestseller, inStock,
  } = req.query;

  const query = { isActive: true };

  // Category filter (supports slug or id)
  if (category) {
    const isValidId = category.match(/^[0-9a-fA-F]{24}$/);
    const queryCond = isValidId ? { $or: [{ slug: category }, { _id: category }] } : { slug: category };
    const cat = await Category.findOne(queryCond);
    if (cat) query.category = cat._id;
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Filters
  if (brand) query.brand = { $in: brand.split(',') };
  if (material) query.materials = { $in: material.split(',') };
  if (roomType) query.roomType = { $in: roomType.split(',') };
  if (isFeatured === 'true') query.isFeatured = true;
  if (isNewArrival === 'true') query.isNewArrival = true;
  if (isBestseller === 'true') query.isBestseller = true;
  if (inStock === 'true') query.stock = { $gt: 0 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// @desc    Get single product by slug or ID
// @route   GET /api/products/:slugOrId
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const { slugOrId } = req.params;
  const query = slugOrId.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: slugOrId }
    : { slug: slugOrId };

  const product = await Product.findOne({ ...query, isActive: true })
    .populate('category', 'name slug');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get related products
  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(4).select('name images price discountPrice ratings slug');

  res.json({ success: true, product, related });
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, message: 'Product removed' });
});

// @desc    Get filter options (brands, materials, price range)
// @route   GET /api/products/filters/options
// @access  Public
const getFilterOptions = asyncHandler(async (req, res) => {
  const [brands, materials, priceRange] = await Promise.all([
    Product.distinct('brand', { isActive: true, brand: { $ne: null } }),
    Product.distinct('materials', { isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
    ]),
  ]);

  res.json({
    success: true,
    filters: {
      brands: brands.filter(Boolean).sort(),
      materials: materials.filter(Boolean).sort(),
      priceRange: priceRange[0] || { min: 0, max: 100000 },
      roomTypes: ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Outdoor', 'Bathroom', 'Kitchen', 'Kids Room'],
    },
  });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFilterOptions };
