const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFilterOptions } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/filters/options', getFilterOptions);
router.get('/', getProducts);
router.get('/:slugOrId', getProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
