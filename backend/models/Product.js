const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  color: { type: String },
  colorHex: { type: String },
  material: { type: String },
  size: { type: String },
  stock: { type: Number, default: 0 },
  sku: { type: String },
  images: [{ type: String }],
  priceModifier: { type: Number, default: 0 }, // +/- from base price
});

const dimensionSchema = new mongoose.Schema({
  length: { type: Number },
  width: { type: Number },
  height: { type: Number },
  weight: { type: Number },
  unit: { type: String, default: 'cm' },
  weightUnit: { type: String, default: 'kg' },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  discountPrice: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String },
  variants: [variantSchema],
  dimensions: dimensionSchema,
  materials: [{ type: String }],
  features: [{ type: String }],
  tags: [{ type: String }],
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  roomType: [{
    type: String,
    enum: ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Outdoor', 'Bathroom', 'Kitchen', 'Kids Room'],
  }],
  assemblyRequired: { type: Boolean, default: false },
  warrantyYears: { type: Number, default: 1 },
  returnDays: { type: Number, default: 30 },
  deliveryDays: { type: Number, default: 7 },
  metaTitle: { type: String },
  metaDescription: { type: String },
}, { timestamps: true });

// Generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true }) + '-' + Date.now();
  }
  // Calculate discount percent
  if (this.discountPrice && this.discountPrice < this.price) {
    this.discountPercent = Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  next();
});

// Virtual for effective price
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice > 0 ? this.discountPrice : this.price;
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });

module.exports = mongoose.model('Product', productSchema);
