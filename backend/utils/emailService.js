const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"Furnishly" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    text,
  };
  return transporter.sendMail(mailOptions);
};

const emailTemplates = {
  orderConfirmation: (order, user) => ({
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #fafaf8;">
        <div style="background: #1a1a18; padding: 32px; text-align: center;">
          <h1 style="color: #e8d5b7; margin: 0; font-size: 28px; letter-spacing: 2px;">FURNISHLY</h1>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #1a1a18; font-size: 22px;">Order Confirmed!</h2>
          <p style="color: #555; font-size: 16px;">Hi ${user.name}, your order has been placed successfully.</p>
          <div style="background: #f0ede8; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; color: #1a1a18;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 8px 0 0; color: #555;"><strong>Total:</strong> ₹${order.pricing.total.toLocaleString()}</p>
            <p style="margin: 8px 0 0; color: #555;"><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</p>
          </div>
          <h3 style="color: #1a1a18;">Items Ordered:</h3>
          ${order.items.map(item => `
            <div style="border-bottom: 1px solid #e0ddd8; padding: 12px 0;">
              <p style="margin: 0; color: #1a1a18;">${item.name} × ${item.quantity}</p>
              <p style="margin: 4px 0 0; color: #888;">₹${(item.price * item.quantity).toLocaleString()}</p>
            </div>
          `).join('')}
          <p style="color: #888; font-size: 14px; margin-top: 32px;">Estimated delivery: ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toDateString() : '7-10 business days'}</p>
        </div>
        <div style="background: #1a1a18; padding: 20px; text-align: center;">
          <p style="color: #888; margin: 0; font-size: 13px;">© 2024 Furnishly. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  welcomeEmail: (user) => ({
    subject: 'Welcome to Furnishly!',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a18; padding: 32px; text-align: center;">
          <h1 style="color: #e8d5b7; margin: 0; font-size: 28px; letter-spacing: 2px;">FURNISHLY</h1>
        </div>
        <div style="padding: 40px 32px; background: #fafaf8;">
          <h2 style="color: #1a1a18;">Welcome, ${user.name}!</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.7;">Thank you for joining Furnishly. Explore our curated collection of premium furniture designed to transform your living spaces.</p>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
