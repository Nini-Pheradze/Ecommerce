// კატალოგის შევსება: ბევრი კატეგორია + 1-3 პროდუქტი თითოეულზე, რეალური ფოტოებით (Unsplash CDN).
// გაშვება: node scripts/seedCatalog.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const img = (id) => `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

const CATEGORIES = [
  { name: 'Electronics', description: 'Laptops, headphones, gadgets and more' },
  { name: 'Shoes', description: 'Sneakers, boots and everyday footwear' },
  { name: 'Clothes', description: 'Apparel for every season' },
  { name: 'Bags & Luggage', description: 'Backpacks, totes and travel bags' },
  { name: 'Watches', description: 'Analog, chronograph and smart watches' },
  { name: 'Jewelry', description: 'Rings, necklaces and accessories' },
  { name: 'Beauty & Fragrance', description: 'Perfume and skincare essentials' },
  { name: 'Home & Furniture', description: 'Sofas, chairs and home decor' },
  { name: 'Kitchen & Dining', description: 'Cookware and dinnerware' },
  { name: 'Sports & Outdoors', description: 'Gear for an active lifestyle' },
  { name: 'Pet Supplies', description: 'Everything for your pets' },
  { name: 'Baby & Kids', description: 'Toys and baby essentials' },
  { name: 'Garden & Tools', description: 'Gardening and hand tools' },
  { name: 'Phone Accessories', description: 'Cases, chargers and more' },
];

// [categoryName]: [{ name, price, compareAtPrice?, sku, stock, imageId, images?: [ids] }]
const PRODUCTS = {
  Electronics: [
    { name: 'Apple MacBook Pro 16 M3 Max', price: 3499, sku: 'ELEC-MBP16', stock: 8, imageId: '1496181133206-80ce9b88a853' },
    { name: 'Wireless Headphones Pro', price: 179, compareAtPrice: 229, sku: 'ELEC-WHP01', stock: 40, imageId: '1505740420928-5e560c06d30e' },
    { name: 'Instant Polaroid Camera', price: 89, sku: 'ELEC-CAM01', stock: 18, imageId: '1526170375885-4d8ecf77b99f' },
  ],
  Shoes: [
    { name: 'Nike Air Max 270', price: 299, compareAtPrice: 399, sku: 'SHOE-NAM270', stock: 25, imageId: '1542291026-7eec264c27ff' },
    { name: 'Urban Canvas Sneakers', price: 64, sku: 'SHOE-UCS01', stock: 50, imageId: '1600185365483-26d7a4cc7519' },
  ],
  Clothes: [
    { name: 'Casual T-Shirt Pack', price: 35, sku: 'CLTH-TEE01', stock: 60, imageId: '1489987707025-afc232f7ea0f' },
    { name: 'Denim & Knitwear Set', price: 72, compareAtPrice: 89, sku: 'CLTH-DENIM01', stock: 30, imageId: '1556905055-8f358a7a47b2' },
  ],
  'Bags & Luggage': [
    { name: 'Travel Backpack 40L', price: 89, sku: 'BAG-TB40', stock: 35, imageId: '1553062407-98eeb64c6a62' },
    { name: 'Leather Tote Handbag', price: 129, compareAtPrice: 159, sku: 'BAG-LTH01', stock: 20, imageId: '1584917865442-de89df76afd3' },
    { name: 'Designer Crossbody Bag', price: 149, sku: 'BAG-CROSS01', stock: 14, imageId: '1587467512961-120760940315' },
  ],
  Watches: [
    { name: 'Classic Chronograph Watch', price: 249, sku: 'WATCH-CHR01', stock: 15, imageId: '1524805444758-089113d48a6d' },
    { name: 'Minimalist Smart Watch', price: 99, compareAtPrice: 129, sku: 'WATCH-MIN01', stock: 28, imageId: '1523275335684-37898b6baf30' },
  ],
  Jewelry: [
    { name: 'Diamond Tennis Bracelet', price: 149, sku: 'JEWL-BRC01', stock: 20, imageId: '1573408301185-9146fe634ad0' },
    { name: 'Rose Gold Bracelet', price: 79, compareAtPrice: 95, sku: 'JEWL-BRC02', stock: 25, imageId: '1611591437281-460bfbe1220a' },
  ],
  'Beauty & Fragrance': [
    { name: 'Eau de Parfum 100ml', price: 68, sku: 'BEAU-EDP01', stock: 22, imageId: '1541643600914-78b084683601' },
    { name: 'Skincare Gift Set', price: 42, compareAtPrice: 55, sku: 'BEAU-SKIN01', stock: 18, imageId: '1571781926291-c477ebfd024b' },
    { name: 'Luxury Perfume Noir', price: 88, sku: 'BEAU-EDP02', stock: 12, imageId: '1585386959984-a4155224a1ad' },
  ],
  'Home & Furniture': [
    { name: 'Modern 2-Seat Sofa', price: 599, sku: 'HOME-SOFA01', stock: 6, imageId: '1555041469-a586c61ea9bc' },
    { name: 'Accent Armchair', price: 189, sku: 'HOME-CHAIR01', stock: 24, imageId: '1567538096630-e0c55bd6374c' },
    { name: 'Handwoven Area Rug', price: 129, compareAtPrice: 159, sku: 'HOME-RUG01', stock: 17, imageId: '1600166898405-da9535204843' },
  ],
  'Kitchen & Dining': [
    { name: 'Kitchen Prep Essentials Set', price: 119, compareAtPrice: 149, sku: 'KTCH-PREP01', stock: 16, imageId: '1495521821757-a1efb6729352' },
    { name: 'Ceramic Mug Set', price: 36, sku: 'KTCH-MUG01', stock: 45, imageId: '1610701596007-11502861dcfa' },
  ],
  'Sports & Outdoors': [
    { name: 'Official Basketball', price: 29, sku: 'SPRT-BALL01', stock: 55, imageId: '1546519638-68e109498ffc' },
    { name: 'Yoga Mat Pro', price: 34, compareAtPrice: 42, sku: 'SPRT-YOGA01', stock: 40, imageId: '1544367567-0f2fcb009e0b' },
    { name: 'Hiking Trail Backpack', price: 74, sku: 'SPRT-HIKE01', stock: 21, imageId: '1571945153237-4929e783af4a' },
  ],
  'Pet Supplies': [
    { name: 'Premium Dog Food 5kg', price: 32, sku: 'PET-FOOD01', stock: 38, imageId: '1518717758536-85ae29035b6d' },
    { name: 'Cat Care & Grooming Kit', price: 27, sku: 'PET-CARE01', stock: 30, imageId: '1592194996308-7b43878e84a6' },
  ],
  'Baby & Kids': [
    { name: 'Baby Essentials Bundle', price: 58, compareAtPrice: 75, sku: 'BABY-BND01', stock: 12, imageId: '1522771930-78848d9293e8' },
    { name: 'Building Blocks Set', price: 26, sku: 'BABY-TOY01', stock: 33, imageId: '1587654780291-39c9404d746b' },
    { name: 'Wooden Train Set', price: 38, sku: 'BABY-TOY02', stock: 20, imageId: '1558877385-81a1c7e67d72' },
  ],
  'Garden & Tools': [
    { name: 'Garden Tool Set 8pc', price: 48, sku: 'GRDN-TOOL01', stock: 27, imageId: '1416879595882-3373a0480b5b' },
    { name: 'Cordless Drill Kit', price: 84, compareAtPrice: 99, sku: 'GRDN-DRILL01', stock: 19, imageId: '1572981779307-38b8cabb2407' },
  ],
  'Phone Accessories': [
    { name: 'Shockproof Phone Case', price: 19, sku: 'PHON-CASE01', stock: 70, imageId: '1592286927505-1def25115558' },
    { name: 'Phone Stand & Accessory Kit', price: 27, sku: 'PHON-STAND01', stock: 44, imageId: '1586953208448-b95a79798f07' },
  ],
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const seller = await User.findOne({ email: 'peradzenino51@gmail.com' });
  if (!seller) throw new Error('Seller user not found');

  const categoryDocs = {};
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true, new: true }
    );
    categoryDocs[cat.name] = doc;
  }
  console.log(`Categories ready: ${Object.keys(categoryDocs).length}`);

  let created = 0;
  let updated = 0;

  for (const [catName, products] of Object.entries(PRODUCTS)) {
    const category = categoryDocs[catName];
    for (const p of products) {
      const imageCover = img(p.imageId);
      const existing = await Product.findOne({ sku: p.sku });
      if (existing) {
        existing.name = p.name;
        existing.price = p.price;
        existing.compareAtPrice = p.compareAtPrice ?? null;
        existing.description = `${p.name} — quality product from the ${catName} collection.`;
        existing.imageCover = imageCover;
        existing.images = [imageCover];
        await existing.save();
        updated += 1;
        continue;
      }
      await Product.create({
        name: p.name,
        sku: p.sku,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        description: `${p.name} — quality product from the ${catName} collection.`,
        imageCover,
        images: [imageCover],
        category: category._id,
        seller: seller._id,
        stock: p.stock,
        ratingsAverage: 4 + Math.round(Math.random() * 10) / 10,
        ratingsQuantity: Math.floor(Math.random() * 40),
      });
      created += 1;
    }
  }

  console.log(`Products created: ${created}, updated: ${updated}`);
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
