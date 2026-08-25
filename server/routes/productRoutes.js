const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { uploadProductImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

// ყველა პროდუქტის წამოღება (ყველასთვის ღიაა)
router.get('/', productController.getAllProducts);

// ახალი პროდუქტის დამატება (მხოლოდ ადმინსა და მოდერატორს + ფოტოები)
router.post('/', protect, restrictTo('admin', 'moderator'), uploadProductImages, productController.createProduct);

// კონკრეტული პროდუქტის წამოღება (ყველასთვის ღიაა)
router.get('/:id', productController.getProduct);

// პროდუქტის განახლება (მხოლოდ ადმინსა და მოდერატორს + ფოტოები)
router.patch('/:id', protect, restrictTo('admin', 'moderator'), uploadProductImages, productController.updateProduct);

// პროდუქტის წაშლა (მხოლოდ ადმინსა და მოდერატორს)
router.delete('/:id', protect, restrictTo('admin', 'moderator'), productController.deleteProduct);

module.exports = router;