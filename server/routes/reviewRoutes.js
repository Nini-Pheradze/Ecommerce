const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// 1. ყველა მიმოხილვის წამოღება (GET)
router.get('/', reviewController.getAllReviews);

// 2. ახალი მიმოხილვის დამატება (POST - დაცული როუტი)
router.post('/', protect, reviewController.createReview);

module.exports = router;