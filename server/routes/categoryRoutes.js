const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// ყველა კატეგორიის წამოღება (ყველასთვის ღიაა)
router.get('/', categoryController.getAllCategories);

// ახალი კატეგორიის დამატება (მხოლოდ ადმინს)
router.post('/', protect, restrictTo('admin'), categoryController.createCategory);

// კატეგორიის წაშლა (მხოლოდ ადმინს)
router.delete('/:id', protect, restrictTo('admin'), categoryController.deleteCategory);

module.exports = router;