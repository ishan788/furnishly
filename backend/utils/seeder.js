const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categories = [
  { name: 'Sofas & Couches', description: 'Comfortable seating for your living room' },
  { name: 'Beds & Bedroom', description: 'Premium beds and bedroom furniture' },
  { name: 'Dining Tables', description: 'Elegant dining sets for every home' },
  { name: 'Office Chairs', description: 'Ergonomic chairs for productivity' },
  { name: 'Wardrobes', description: 'Spacious storage solutions' },
  { name: 'Coffee Tables', description: 'Stylish centerpieces for living rooms' },
  { name: 'Bookshelves', description: 'Organize your library in style' },
  { name: 'Outdoor Furniture', description: 'Weather-resistant outdoor pieces' },
];

const generateProducts = (categoryMap) => [
  {
    name: 'Luxe Sectional Sofa',
    shortDescription: 'Premium L-shaped sectional in Italian leather',
    description: 'Transform your living room with this stunning sectional sofa. Crafted from full-grain Italian leather with solid walnut legs, this piece combines unparalleled comfort with timeless elegance. The modular design allows for flexible arrangement to suit any space.',
    price: 89999,
    discountPrice: 74999,
    category: categoryMap['Sofas & Couches'],
    brand: 'Woodcraft',
    stock: 15,
    materials: ['Italian Leather', 'Solid Walnut', 'High-Density Foam'],
    features: ['Modular design', 'Stain resistant', 'USB charging ports', '10-year warranty'],
    tags: ['sofa', 'sectional', 'leather', 'living room'],
    roomType: ['Living Room'],
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
    isFeatured: true, isBestseller: true,
    dimensions: { length: 280, width: 165, height: 85, weight: 120, unit: 'cm', weightUnit: 'kg' },
    warrantyYears: 10, deliveryDays: 14,
  },
  {
    name: 'Nordic Velvet Armchair',
    shortDescription: 'Scandinavian-inspired velvet accent chair',
    description: 'A statement piece for any room. The Nordic Velvet Armchair features premium velvet upholstery, tapered solid beech legs, and a carefully engineered ergonomic form. Perfect for reading nooks, bedrooms, or as a stylish accent in your living room.',
    price: 24999,
    discountPrice: 19999,
    category: categoryMap['Sofas & Couches'],
    brand: 'Scandia',
    stock: 28,
    materials: ['Velvet', 'Beech Wood', 'Sinuous Springs'],
    features: ['360° swivel', 'Ergonomic backrest', 'Anti-scratch legs'],
    tags: ['armchair', 'velvet', 'nordic', 'accent chair'],
    roomType: ['Living Room', 'Bedroom'],
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
    isFeatured: true, isNewArrival: true,
    dimensions: { length: 80, width: 82, height: 92, weight: 18 },
    warrantyYears: 5,
  },
  {
    name: 'Emperor King Bed Frame',
    shortDescription: 'Solid teak king-size bed with storage',
    description: 'Sleep like royalty on the Emperor King Bed Frame. Constructed from sustainably sourced solid teak wood with a hand-rubbed oil finish, this bed features four deep storage drawers, a padded leather headboard, and reinforced center support for lasting durability.',
    price: 64999,
    discountPrice: 54999,
    category: categoryMap['Beds & Bedroom'],
    brand: 'Woodcraft',
    stock: 10,
    materials: ['Solid Teak', 'Leather', 'Oak Veneer'],
    features: ['4 storage drawers', 'Padded headboard', 'USB ports in headboard', 'No box spring needed'],
    tags: ['bed', 'king', 'storage', 'teak'],
    roomType: ['Bedroom'],
    images: ['https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800'],
    isFeatured: true,
    dimensions: { length: 215, width: 195, height: 130, weight: 95 },
    warrantyYears: 10, deliveryDays: 10,
  },
  {
    name: 'Marble Top Dining Set',
    shortDescription: '6-seater marble and brass dining table with chairs',
    description: 'Entertain in style with this exquisite 6-seater dining set. The table features a genuine Carrara marble top with hand-finished brass legs, paired with six upholstered dining chairs in premium boucle fabric. A true statement for the modern dining room.',
    price: 149999,
    discountPrice: 124999,
    category: categoryMap['Dining Tables'],
    brand: 'Casa Luxe',
    stock: 5,
    materials: ['Carrara Marble', 'Brass', 'Boucle Fabric'],
    features: ['Genuine marble top', 'Scratch-resistant finish', '6 chairs included', 'Stackable chairs'],
    tags: ['dining', 'marble', 'brass', '6-seater'],
    roomType: ['Dining Room'],
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'],
    isFeatured: true,
    dimensions: { length: 200, width: 100, height: 76, weight: 180 },
    warrantyYears: 5, deliveryDays: 21, assemblyRequired: true,
  },
  {
    name: 'ErgoMaster Pro Chair',
    shortDescription: 'Full-mesh ergonomic office chair with lumbar support',
    description: 'Designed for professionals who spend long hours at their desk. The ErgoMaster Pro features a fully adjustable lumbar support system, breathable 4D mesh back, adjustable armrests, headrest, seat depth, and tilt tension. Certified for 8-hour daily use.',
    price: 34999,
    discountPrice: 27999,
    category: categoryMap['Office Chairs'],
    brand: 'ErgoTech',
    stock: 42,
    materials: ['4D Mesh', 'Aluminum', 'High-Density Foam'],
    features: ['Adjustable lumbar', '4D armrests', 'Headrest included', '150kg weight capacity', 'BIFMA certified'],
    tags: ['office chair', 'ergonomic', 'mesh', 'work from home'],
    roomType: ['Office'],
    images: ['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800'],
    isBestseller: true, isNewArrival: true,
    dimensions: { length: 68, width: 68, height: 120, weight: 22 },
    warrantyYears: 3,
  },
  {
    name: 'Grand Wardrobe with Mirror',
    shortDescription: '4-door sliding wardrobe with full-length mirror',
    description: 'Maximize your bedroom storage with this grand 4-door sliding wardrobe. Features include a full-length mirror panel, soft-close mechanisms, internal LED lighting, dedicated shoe rack, and premium finish options. Customizable internal layout available.',
    price: 54999,
    discountPrice: 44999,
    category: categoryMap['Wardrobes'],
    brand: 'StoreMaster',
    stock: 8,
    materials: ['E1 MDF', 'Tempered Glass', 'Aluminum Track'],
    features: ['Full-length mirror', 'Soft-close mechanism', 'Internal LED lighting', 'Anti-tip safety'],
    tags: ['wardrobe', 'sliding', 'mirror', 'storage'],
    roomType: ['Bedroom'],
    images: ['https://images.unsplash.com/photo-1558997519-83ea9252efc8?w=800'],
    assemblyRequired: true, deliveryDays: 14,
    dimensions: { length: 200, width: 60, height: 220, weight: 145 },
    warrantyYears: 5,
  },
  {
    name: 'Walnut Coffee Table',
    shortDescription: 'Solid walnut with hairpin legs and shelf',
    description: 'A minimalist masterpiece. This coffee table is handcrafted from solid American walnut with a natural oil finish that highlights the wood\'s unique grain. The hairpin legs in matte black steel provide industrial contrast, while the lower shelf adds practical storage.',
    price: 18999,
    discountPrice: 0,
    category: categoryMap['Coffee Tables'],
    brand: 'Woodcraft',
    stock: 22,
    materials: ['Solid Walnut', 'Steel'],
    features: ['Solid wood top', 'Lower shelf', 'Non-scratch feet'],
    tags: ['coffee table', 'walnut', 'hairpin', 'minimalist'],
    roomType: ['Living Room'],
    images: ['https://images.unsplash.com/photo-1611967164521-abae8fba4668?w=800'],
    isNewArrival: true,
    dimensions: { length: 120, width: 60, height: 45, weight: 18 },
    warrantyYears: 3,
  },
  {
    name: 'Industrial Bookshelf',
    shortDescription: '5-tier industrial bookshelf with metal frame',
    description: 'Combine function and style with this industrial-chic 5-tier bookshelf. The solid pine wood shelves contrast beautifully with the powder-coated steel frame. Water-resistant finish makes it suitable for both indoor and sheltered outdoor use.',
    price: 12999,
    discountPrice: 9999,
    category: categoryMap['Bookshelves'],
    brand: 'UrbanShelf',
    stock: 35,
    materials: ['Pine Wood', 'Steel'],
    features: ['5 tiers', 'Water-resistant finish', 'Adjustable leveling feet', '80kg capacity per shelf'],
    tags: ['bookshelf', 'industrial', 'storage', 'metal'],
    roomType: ['Living Room', 'Office', 'Bedroom'],
    images: ['https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800'],
    isBestseller: true,
    dimensions: { length: 80, width: 30, height: 180, weight: 28 },
    warrantyYears: 2,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({})]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@furnishly.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
    });
    console.log('👤 Admin user created');

    // Create categories
    const createdCategories = await Category.create(categories);
    const categoryMap = {};
    createdCategories.forEach(cat => { categoryMap[cat.name] = cat._id; });
    console.log(`📁 Created ${createdCategories.length} categories`);

    // Create products
    const products = generateProducts(categoryMap);
    await Product.create(products);
    console.log(`📦 Created ${products.length} products`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
