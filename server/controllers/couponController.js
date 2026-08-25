const Coupon = require('../models/Coupon');
const catchAsync = require('../utils/catchAsync');

// ყველა კუპონის წამოღება (მხოლოდ ადმინს)
exports.getAllCoupons = catchAsync(async (req, res, next) => {
    const coupons = await Coupon.find();
    res.status(200).json({
        status: 'success',
        results: coupons.length,
        data: { coupons }
    });
});

// ახალი კუპონის შექმნა (მხოლოდ ადმინს)
exports.createCoupon = catchAsync(async (req, res, next) => {
    const newCoupon = await Coupon.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { coupon: newCoupon }
    });
});

// კუპონის წაშლა (მხოლოდ ადმინს)
exports.deleteCoupon = catchAsync(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
        return res.status(404).json({ status: 'fail', message: 'Coupon not found' });
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

// კუპონის შემოწმება / ვალიდაცია (ავტორიზებული მომხმარებლისთვის)
exports.validateCoupon = catchAsync(async (req, res, next) => {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
        return res.status(404).json({ status: 'fail', message: 'Invalid coupon code' });
    }

    if (coupon.expiresAt < new Date()) {
        return res.status(400).json({ status: 'fail', message: 'Coupon has expired' });
    }

    if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
        return res.status(400).json({ status: 'fail', message: 'Coupon usage limit reached' });
    }

    res.status(200).json({
        status: 'success',
        data: {
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        },
    });
});