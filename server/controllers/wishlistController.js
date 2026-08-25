const User = require('../models/User');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');

// Wishlist-ის წამოღება
exports.getWishlist = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('wishlist');

    res.status(200).json({
        status: 'success',
        results: user.wishlist.length,
        data: { wishlist: user.wishlist },
    });
});

// პროდუქტის დამატება Wishlist-ში
exports.addToWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }

    // $addToSet უზრუნველყოფს, რომ დუბლირება არ მოხდეს
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { wishlist: productId } },
        { new: true }
    ).populate('wishlist');

    res.status(200).json({
        status: 'success',
        data: { wishlist: user.wishlist },
    });
});

// პროდუქტის წაშლა Wishlist-იდან
exports.removeFromWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { wishlist: productId } },
        { new: true }
    ).populate('wishlist');

    res.status(200).json({
        status: 'success',
        data: { wishlist: user.wishlist },
    });
});