const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        },
        discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'Discount type is required (percentage or fixed)'],
        },
        discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        },
        expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required'],
        },
        maxUses: {
        type: Number,
        default: null,
        },
        usesCount: {
        type: Number,
        default: 0,
        },
        isActive: {
        type: Boolean,
        default: true,
        },
    }, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);