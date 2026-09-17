const express = require('express');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProductImages } = require('../middleware/uploadMiddleware');

const router = express.Router();

// ყველა პროდუქტის წამოღება (ყველასთვის ღიაა)
router.get('/', productController.getAllProducts);

// ახალი პროდუქტის დამატება (ნებისმიერ ავტორიზებულ მომხმარებელს შეუძლია გაყიდვა + ფოტოები)
router.post('/', protect, uploadProductImages, productController.createProduct);

// კონკრეტული პროდუქტის წამოღება (ყველასთვის ღიაა)
router.get('/:id', productController.getProduct);

// პროდუქტის განახლება (მხოლოდ გამყიდველს, ადმინს ან მოდერატორს - შემოწმება კონტროლერშია)
router.patch('/:id', protect, uploadProductImages, productController.updateProduct);

// პროდუქტის წაშლა (მხოლოდ გამყიდველს, ადმინს ან მოდერატორს - შემოწმება კონტროლერშია)
router.delete('/:id', protect, productController.deleteProduct);

module.exports = router;