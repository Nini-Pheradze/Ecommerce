const Review = require('../models/Review');
const Order = require('../models/Order');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    const productId = req.params.productId || req.query.product;
    if (productId) filter = { product: productId };

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

    // 2. Verified Purchase-ის შემოწმება (ადმინი და მოდერატორი თავისუფლდებიან ამ პირობისგან)
    const canBypassPurchaseCheck = ['admin', 'moderator'].includes(req.user.role);

    if (!canBypassPurchaseCheck) {
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
    }

    const newReview = await Review.create(req.body);

res.status(201).json({
        status: 'success',
        data: { review: newReview },
    });
});

// 3. საკუთარი შეფასების რედაქტირება
exports.updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return res.status(404).json({ status: 'fail', message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
        return res.status(403).json({ status: 'fail', message: 'You can only edit your own review' });
    }

    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.review !== undefined) review.review = req.body.review;
    await review.save();

    res.status(200).json({
        status: 'success',
        data: { review },
    });
});

// 4. შეფასების წაშლა (ავტორი, მოდერატორი ან ადმინი)
exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return res.status(404).json({ status: 'fail', message: 'Review not found' });
    }

    const isOwner = review.user.toString() === req.user.id;
    const canModerate = ['admin', 'moderator'].includes(req.user.role);

    if (!isOwner && !canModerate) {
        return res.status(403).json({ status: 'fail', message: 'You do not have permission to delete this review' });
    }

    const productId = review.product;
    await review.deleteOne();
    await Review.calcAverageRatings(productId);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});