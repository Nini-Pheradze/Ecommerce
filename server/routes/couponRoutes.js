const express = require('express');
const couponController = require('../controllers/couponController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// კუპონის ვალიდაცია (ავტორიზებული მომხმარებლისთვის)
router.post('/validate', protect, couponController.validateCoupon);

// ადმინისტრატორის მარშრუტები
router.get('/', protect, restrictTo('admin'), couponController.getAllCoupons);
router.post('/', protect, restrictTo('admin'), couponController.createCoupon);
router.delete('/:id', protect, restrictTo('admin'), couponController.deleteCoupon);

module.exports = router;