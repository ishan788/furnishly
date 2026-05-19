const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, markHelpful, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.post('/:id/helpful', protect, markHelpful);
router.delete('/:id', protect, deleteReview);

module.exports = router;
