// categoryRoutes.js
const express = require('express');
const catRouter = express.Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

catRouter.get('/', getCategories);
catRouter.get('/:slugOrId', getCategory);
catRouter.post('/', protect, admin, createCategory);
catRouter.put('/:id', protect, admin, updateCategory);
catRouter.delete('/:id', protect, admin, deleteCategory);

module.exports = catRouter;
