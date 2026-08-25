const Category = require('../models/Category');
const catchAsync = require('../utils/catchAsync');

exports.getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories },
    });
});

exports.createCategory = catchAsync(async (req, res, next) => {
    const newCategory = await Category.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { category: newCategory },
    });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
        return res.status(404).json({ status: 'fail', message: 'Category not found' });
    }
    res.status(204).json({
        status: 'success',
        data: null,
    });
});