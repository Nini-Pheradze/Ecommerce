const mongoose = require('mongoose');
const Product = require('./Product');

const reviewSchema = new mongoose.Schema(
    {
        review: {
        type: String,
        required: [true, 'Review text is required'],
        trim: true,
        },
        rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1.0'],
        max: [5, 'Rating cannot be more than 5.0'],
        },
        product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Review must belong to a product'],
        },
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
        },
    },{timestamps: true});

// ერთი მომხმარებელი პროდუქტზე მხოლოდ 1 მიმოხილვას ტოვებს
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        {
        $match: { product: productId },
        },
        {
        $group: {
            _id: '$product',
            nRating: { $sum: 1 },
            avgRating: { $avg: '$rating' },
        },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: Math.round(stats[0].avgRating * 10) / 10,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5,
        });
    }
};

// ახალი Review-ს შექმნისას რეიტინგის გადათვლა
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.product);
});

// Update/Delete (findByIdAndUpdate / findByIdAndDelete) ოპერაციების დროს რეიტინგის გადათვლა
reviewSchema.post(/^findOneAnd/, async function (doc) {
    if (doc) {
        await doc.constructor.calcAverageRatings(doc.product);
    }
});

module.exports = mongoose.model('Review', reviewSchema);