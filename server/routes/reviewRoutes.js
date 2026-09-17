const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// 1. ყველა მიმოხილვის წამოღება (GET)
router.get('/', reviewController.getAllReviews);

// 2. ახალი მიმოხილვის დამატება (POST - დაცული როუტი)
router.post('/', protect, reviewController.createReview);

// 3. საკუთარი შეფასების რედაქტირება
router.patch('/:id', protect, reviewController.updateReview);

// 4. შეფასების წაშლა (ავტორი, მოდერატორი ან ადმინი)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;