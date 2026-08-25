const Review = require('../models/Review');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const reviews = await Review.find(filter).populate('user', 'name');

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews },
    });
    });

    exports.createReview = catchAsync(async (req, res, next) => {
    if (!req.body.product) req.body.product = req.params.productId;
    if (!req.body.user) req.body.user = req.user.id;

    // 1. შემოწმება: უკვე დატოვა თუ არა შეფასება ამ პროდუქტზე
    const existingReview = await Review.findOne({
        product: req.body.product,
        user: req.user.id,
    });

    if (existingReview) {
        return res.status(400).json({
        status: 'fail',
        message: 'You have already reviewed this product.',
        });
    }

    // 2. Verified Purchase-ის შემოწმება
    const userOrders = await Order.find({ user: req.user.id });
    const hasPurchased = userOrders.some((order) =>
        order.orderItems.some(
        (item) => item.product.toString() === req.body.product.toString()
        )
    );

    if (!hasPurchased) {
        return res.status(403).json({
        status: 'fail',
        message: 'You can only review products you have purchased.',
        });
    }

    const newReview = await Review.create(req.body);

res.status(201).json({
        status: 'success',
        data: { review: newReview },
    });
});