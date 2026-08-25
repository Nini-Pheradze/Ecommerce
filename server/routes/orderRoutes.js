const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// შეკვეთის შექმნა (Checkout)
router.post('/', protect, orderController.createOrder);

// ავტორიზებული მომხმარებლის შეკვეთების წამოღება
router.get('/my-orders', protect, orderController.getMyOrders);

// კონკრეტული შეკვეთის წამოღება ID-ით
router.get('/:id', protect, orderController.getOrderById);

// შეკვეთის სტატუსის განახლება (მხოლოდ ადმინისთვის)
router.patch('/:id/status', protect, restrictTo('admin'), orderController.updateOrderStatus);

module.exports = router;