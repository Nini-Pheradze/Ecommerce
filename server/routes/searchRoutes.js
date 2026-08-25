const express = require('express');
const searchController = require('../controllers/searchController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// პროდუქტების ძებნა (ყველასთვის ღიაა)
router.get('/products', searchController.searchProducts);

// იუზერების ძებნა (მხოლოდ ადმინს)
router.get('/users', protect, restrictTo('admin'), searchController.searchUsers);

module.exports = router;