const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment, getRazorpayKey } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/razorpay/key', protect, getRazorpayKey);
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;
