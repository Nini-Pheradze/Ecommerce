const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, 'A product must have a name'],
        trim: true,
        },
        sku: {
        type: String,
        unique: true,
        required: [true, 'A product must have an SKU'],
        trim: true,
        },
        price: {
        type: Number,
        required: [true, 'A product must have a price'],
        },
        compareAtPrice: {
        type: Number, // ძველი ფასი (ფასდაკლებამდე)
        default: null,
        },
        description: {
        type: String,
        trim: true,
        },
        category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'A product must belong to a category'],
        },
        stock: {
        type: Number,
        default: 0,
        },
        // ვარიანტები (ზომები და ფერები)
        variants: [
        {
            size: { type: String, trim: true },
            color: { type: String, trim: true },
            stock: { type: Number, default: 0 },
            sku: { type: String, trim: true },
        },
        ],
        ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: (val) => Math.round(val * 10) / 10,
        },
        ratingsQuantity: {
        type: Number,
        default: 0,
        },
    }, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }});

// ვირტუალური ველი: გამოთვლილი ფასდაკლების პროცენტი
productSchema.virtual('discountPercentage').get(function () {
    if (this.compareAtPrice && this.compareAtPrice > this.price) {
        const discount = ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100;
        return Math.round(discount);
    }
    return 0;
});

module.exports = mongoose.model('Product', productSchema);