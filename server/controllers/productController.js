const Product = require('../models/Product');
const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllProducts = catchAsync(async (req, res, next) => {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'size', 'color', 'onSale'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const filterCriteria = JSON.parse(queryStr);

    if (req.query.size) {
        filterCriteria['variants.size'] = req.query.size;
    }
    if (req.query.color) {
        filterCriteria['variants.color'] = req.query.color;
    }
    if (req.query.onSale === 'true') {
        filterCriteria.compareAtPrice = { $gt: 0 };
    }

    let query = Product.find(filterCriteria).populate('category', 'name');

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;
    const totalProducts = await Product.countDocuments(filterCriteria);

    res.status(200).json({
        status: 'success',
        results: products.length,
        totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        data: { products },
    });
});

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { product },
    });
});

exports.createProduct = catchAsync(async (req, res, next) => {
    // 💡 ფაილების ატვირთვის დამუშავება Multer-იდან
    if (req.files) {
        if (req.files.imageCover) {
            req.body.imageCover = req.files.imageCover[0].filename;
        }
        if (req.files.images) {
            req.body.images = req.files.images.map((file) => file.filename);
        }
    }

    const newProduct = await Product.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { product: newProduct },
    });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
    // 💡 განახლებისას თუ ახალი ფოტოები აიტვირთა, განვახლოთ ისინიც
    if (req.files) {
        if (req.files.imageCover) {
            req.body.imageCover = req.files.imageCover[0].filename;
        }
        if (req.files.images) {
            req.body.images = req.files.images.map((file) => file.filename);
        }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    
    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: { product },
    });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null,
    });
});