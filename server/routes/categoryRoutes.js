const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// ყველა კატეგორიის წამოღება (ყველასთვის ღიაა)
router.get('/', categoryController.getAllCategories);

// ახალი კატეგორიის დამატება (ადმინი და მოდერატორი)
router.post('/', protect, restrictTo('admin', 'moderator'), categoryController.createCategory);

// კატეგორიის რედაქტირება (ადმინი და მოდერატორი)
router.patch('/:id', protect, restrictTo('admin', 'moderator'), categoryController.updateCategory);

// კატეგორიის წაშლა (ადმინი და მოდერატორი)
router.delete('/:id', protect, restrictTo('admin', 'moderator'), categoryController.deleteCategory);

module.exports = router;