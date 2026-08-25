const User = require('../models/User');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');

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

// 2. პროდუქტების ძებნა დასახელებით, აღწერით ან კატეგორიით
exports.searchProducts = catchAsync(async (req, res, next) => {
    const { query } = req.query;

    const products = await Product.find({
        $or: [
        { name: { $regex: query || '', $options: 'i' } },
        { description: { $regex: query || '', $options: 'i' } },
        { category: { $regex: query || '', $options: 'i' } },
        ],
    });

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products },
    });
});