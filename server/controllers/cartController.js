const Cart = require('../models/Cart');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');

// 1. ავტორიზებული მომხმარებლის კალათის წამოღება
exports.getCart = catchAsync(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
        cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
        status: 'success',
        data: { cart },
    });
});

// 2. პროდუქტის დამატება კალათაში (ან რაოდენობის გაზრდა, თუ უკვე არის)
exports.addToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity } = req.body;
    const qty = quantity || 1;

    // 1. ვამოწმებთ არსებობს თუ არა პროდუქტი რეალურად ბაზაში
    const productExists = await Product.findById(productId);
    if (!productExists) {
        return res.status(404).json({
        status: 'fail',
        message: 'Product not found with this ID',
        });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity: qty }],
        });
    } else {
        // 2. ვასუფთავებთ ძველ null-ებს კალათიდან
        cart.items = cart.items.filter((item) => item.product !== null);

        const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
        cart.items[itemIndex].quantity += qty;
        } else {
        cart.items.push({ product: productId, quantity: qty });
        }

        await cart.save();
    }

    cart = await cart.populate('items.product');

    res.status(200).json({
        status: 'success',
        data: { cart },
    });
});

// 3. პროდუქტის წაშლა კალათიდან
exports.removeFromCart = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return res.status(404).json({
        status: 'fail',
        message: 'Cart not found',
        });
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    );

    await cart.save();
    cart = await cart.populate('items.product');

    res.status(200).json({
        status: 'success',
        data: { cart },
    });
});