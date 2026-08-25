const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        },
        orderItems: [
        {
            product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        },
        ],
        shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: String, required: true },
        },
        totalPrice: {
        type: Number,
        required: true,
        },
        isPaid: {
        type: Boolean,
        default: false,
        },
        status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
        },
    }, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);