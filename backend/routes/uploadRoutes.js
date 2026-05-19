const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { upload, cloudinary } = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');

router.post('/image', protect, admin, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  res.json({ success: true, url: req.file.path, publicId: req.file.filename });
}));

router.post('/images', protect, admin, upload.array('images', 8), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) { res.status(400); throw new Error('No files uploaded'); }
  const urls = req.files.map(f => ({ url: f.path, publicId: f.filename }));
  res.json({ success: true, images: urls });
}));

router.delete('/image', protect, admin, asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) { res.status(400); throw new Error('Public ID required'); }
  await cloudinary.uploader.destroy(publicId);
  res.json({ success: true, message: 'Image deleted' });
}));

module.exports = router;
