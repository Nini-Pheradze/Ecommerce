const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 1. ახალი შეკვეთის შექმნა (Checkout & Stripe Session)
exports.createOrder = catchAsync(async (req, res, next) => {
    const { shippingAddress, couponCode } = req.body;

    // 1.1 იპოვე მომხმარებლის კალათა
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || !cart.items || cart.items.length === 0) {
        return next(new AppError('Your cart is empty', 400));
    }

    // 1.2 გამოითვალე საწყისი ჯამური ფასი კალათიდან
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
        const product = item.product;

        if (!product) {
            return next(new AppError('One or more products in your cart no longer exist', 404));
        }

        if (product.stock < item.quantity) {
            return next(new AppError(`Not enough stock for ${product.name}`, 400));
        }

        const itemPrice = product.price * item.quantity;
        subtotal += itemPrice;

        orderItems.push({
            product: product._id,
            name: product.name,
            quantity: item.quantity,
            price: product.price,
            sku: product.sku
        });
    }

    let totalPrice = subtotal;
    let discountAmount = 0;

    // 1.3 კუპონის შემოწმება და ფასდაკლება
    if (couponCode) {
        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            expiresAt: { $gt: Date.now() }
        });

        if (!coupon) {
            return next(new AppError('Invalid or expired coupon code', 400));
        }

        if (coupon.maxUses && coupon.usesCount >= coupon.maxUses) {
            return next(new AppError('Coupon has reached its maximum usage limit', 400));
        }

        if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        }

        totalPrice = Math.max(0, subtotal - discountAmount);

        coupon.usesCount = (coupon.usesCount || 0) + 1;
        await coupon.save();
    }

    // 1.4 შექმენი შეკვეთა (Pending სტატუსით და unpaid გადახდით)
    const newOrder = await Order.create({
        user: req.user._id,
        orderItems,
        shippingAddress,
        subtotal,
        discountAmount,
        totalPrice,
        status: 'Pending',
        paymentStatus: 'pending'
    });

    // 1.5 შეამცირე პროდუქციის მარაგები
    for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity }
        });
    }

    // 1.6 გასუფთავე მომხმარებლის კალათა
    cart.items = [];
    await cart.save();

    // 1.7 Stripe Checkout სესიის შექმნა
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&orderId=${newOrder._id}`,
        cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/cancel`,
        customer_email: req.user.email,
        client_reference_id: newOrder._id.toString(),
        line_items: orderItems.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        })),
        mode: 'payment',
    });

    res.status(201).json({
        status: 'success',
        sessionId: session.id,
        sessionUrl: session.url,
        data: {
            order: newOrder
        }
    });
});

// 1.5 Stripe Webhook - გადახდის დადასტურების შემდეგ შეკვეთის სტატუსის განახლება
exports.stripeWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.client_reference_id;

        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                isPaid: true,
                paymentStatus: 'paid',
                status: 'Processing',
            });
        }
    }

    res.status(200).json({ received: true });
};

// 2. მომხმარებლის შეკვეთების წამოღება
exports.getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders
        }
    });
});

// 3. კონკრეტული შეკვეთის წამოღება ID-ით
exports.getOrderById = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});

// 4. შეკვეთის სტატუსის განახლება (Admin Only)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
    );

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            order
        }
    });
});