const express = require('express');
const router = express.Router();
const passport = require('passport');

const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  generate2FA,
  verify2FA,
  signToken // ვთქვათ გჭირდება ტოკენის გენერაციისთვის ქოლბექში (ან შენი კონტროლერიდან იძახებ)
} = require('../controllers/authController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// --- Google OAuth Routes ---
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // სესიის გარეშე ვიყენებთ JWT ტოკენს მომხმარებლისთვის
    const token = signToken(req.user._id);
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: req.user,
      },
    });
  }
);

// 2FA Routes
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);

// Admin-only Route
router.get('/admin/dashboard', protect, restrictTo('admin'), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Admin Dashboard!'
  });
});

module.exports = router;