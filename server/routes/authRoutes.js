const express = require('express');
const router = express.Router();
const passport = require('passport');

const {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
  generate2FA,
  verify2FA,
  sendSms2FACode,
  verifySms2FA,
  verifyLogin2FA,
  issueTwoFactorChallenge,
  signToken // ვთქვათ გჭირდება ტოკენის გენერაციისთვის ქოლბექში (ან შენი კონტროლერიდან იძახებ)
} = require('../controllers/authController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);
router.patch('/update-password', protect, updatePassword);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/login/verify-2fa', verifyLogin2FA);

// --- Google OAuth Routes ---
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google` }),
  async (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    // თუ მომხმარებელს 2FA ჩართული აქვს, Google-ით შესვლაც უნდა გაიაროს იგივე შემოწმება
    if (req.user.twoFactorEnabled) {
      const { twoFactorMethod, tempToken } = await issueTwoFactorChallenge(req.user);
      return res.redirect(
        `${clientUrl}/oauth/callback?requires2FA=1&method=${twoFactorMethod}&tempToken=${tempToken}`
      );
    }

    // სესიის გარეშე ვიყენებთ JWT ტოკენს მომხმარებლისთვის
    const token = signToken(req.user._id);

    // ბრაუზერს ვამისამართებთ frontend-ის callback გვერდზე, სადაც ტოკენი შეინახება
    res.redirect(`${clientUrl}/oauth/callback?token=${token}`);
  }
);

// 2FA Routes (Authenticator App)
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);

// 2FA Routes (SMS / Twilio)
router.post('/sms-2fa/send', protect, sendSms2FACode);
router.post('/sms-2fa/verify', protect, verifySms2FA);

// Admin-only Route
router.get('/admin/dashboard', protect, restrictTo('admin'), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Admin Dashboard!'
  });
});

module.exports = router;