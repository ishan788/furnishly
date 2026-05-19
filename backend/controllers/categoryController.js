const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).populate('parent', 'name slug');
  res.json({ success: true, categories });
});

const getCategory = asyncHandler(async (req, res) => {
  const { slugOrId } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
  const query = isObjectId
    ? { _id: slugOrId, isActive: true }
    : { slug: slugOrId, isActive: true };

  const category = await Category.findOne(query);
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) { res.status(404); throw new Error('Category not found'); }
  res.json({ success: true, category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) { res.status(400); throw new Error(`Cannot delete: ${productCount} products in this category`); }
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
