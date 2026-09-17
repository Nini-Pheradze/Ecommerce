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
        imageCover: {
        type: String,
        default: null,
        },
        images: {
        type: [String],
        default: [],
        },
        category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'A product must belong to a category'],
        },
        seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A product must belong to a seller'],
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

// ინდექსები - ფილტრაციისა და ძებნის ოპტიმიზაციისთვის
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'variants.size': 1, 'variants.color': 1 });
productSchema.index({ name: 'text', description: 'text' });

// ვირტუალური ველი: გამოთვლილი ფასდაკლების პროცენტი
productSchema.virtual('discountPercentage').get(function () {
    if (this.compareAtPrice && this.compareAtPrice > this.price) {
        const discount = ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100;
        return Math.round(discount);
    }
    return 0;
});

module.exports = mongoose.model('Product', productSchema);