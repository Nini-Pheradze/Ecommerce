const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');

// $regex-ში სპეციალური სიმბოლოების უსაფრთხოდ escape-გაკეთება
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1. იუზერების ძებნა სახელით ან მეილით
exports.searchUsers = catchAsync(async (req, res, next) => {
    const { query } = req.query;

    const users = await User.find({
        $or: [
        { name: { $regex: query || '', $options: 'i' } },
        { email: { $regex: query || '', $options: 'i' } },
        ],
    }).select('-password');

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
    });
});

// 2. პროდუქტების ძებნა დასახელებით, აღწერით, SKU-თი ან ვარიანტებით (ზომა/ფერი)
// მოთხოვნა სიტყვებადაა დაშლილი, რომ "43 size shoes" ტიპის მოთხოვნამაც იპოვოს
// პროდუქტი, რომელიც ერთ-ერთ სიტყვას (მაგ. "43" ვარიანტის ზომაში) ემთხვევა
exports.searchProducts = catchAsync(async (req, res, next) => {
    const { query } = req.query;
    const words = (query || '').trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        const products = await Product.find().populate('category', 'name');
        return res.status(200).json({
            status: 'success',
            results: products.length,
            data: { products },
        });
    }

    // შენიშვნა: category ObjectId ტიპისაა, ამიტომ $regex მასზე პირდაპირ ვერ გამოვიყენებთ
    const orConditions = words.flatMap((word) => {
        const regex = { $regex: escapeRegex(word), $options: 'i' };
        return [
            { name: regex },
            { description: regex },
            { sku: regex },
            { 'variants.size': regex },
            { 'variants.color': regex },
        ];
    });

    const products = await Product.find({ $or: orConditions }).populate('category', 'name');

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products },
    });
});

// 3. კატეგორიების ძებნა/ფილტრაცია დასახელებით
exports.searchCategories = catchAsync(async (req, res, next) => {
    const { query } = req.query;

    const categories = await Category.find({
        name: { $regex: query || '', $options: 'i' },
    });

    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories },
    });
});