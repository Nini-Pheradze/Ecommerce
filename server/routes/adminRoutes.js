const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// ყველა მარშრუტზე მოთხოვნილია ავტორიზაცია და ადმინისტრატორის როლი
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/block', adminController.toggleBlockUser);
router.patch('/users/:id/warn', adminController.warnUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;