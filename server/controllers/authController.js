const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const { sendSMS } = require('../utils/twilio');

exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = catchAsync(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ status: 'fail', message: 'Email is already registered' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    phoneNumber,
    verificationToken,
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      userId: user._id,
      email: user.email,
      verificationToken
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = exports.signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

// @desc    Verify Email Token
// @route   POST /api/auth/verify-email
exports.verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ status: 'fail', message: 'Invalid or expired token' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.status(200).json({ status: 'success', message: 'Email verified successfully' });
});

// @desc    Request Password Reset Token
// @route   POST /api/auth/forgot-password
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Reset token generated successfully',
    resetToken
  });
});

// @desc    Reset Password via Token
// @route   POST /api/auth/reset-password
exports.resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ status: 'fail', message: 'Invalid or expired token' });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ status: 'success', message: 'Password updated successfully' });
});


// @desc    Generate 2FA QR Code & Secret (Authenticator App)
// @route   POST /api/auth/2fa/generate
exports.generate2FA = catchAsync(async (req, res) => {
  const user = req.user;

  const secret = speakeasy.generateSecret({
    name: `NodeShop Marketplace (${user.email})`
  });

  user.twoFactorSecret = secret.base32;
  await user.save();

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.status(200).json({
    status: 'success',
    secret: secret.base32,
    qrCode: qrCodeUrl
  });
});

// @desc    Verify and Enable 2FA (Authenticator App)
// @route   POST /api/auth/2fa/verify
exports.verify2FA = catchAsync(async (req, res) => {
  const { token } = req.body;
  const user = req.user;

  if (!user || !user.twoFactorSecret) {
    return res.status(400).json({ status: 'fail', message: '2FA setup not initiated' });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token
  });

  if (!verified) {
    return res.status(400).json({ status: 'fail', message: 'Invalid 2FA token' });
  }

  user.twoFactorEnabled = true;
  await user.save();

  res.status(200).json({ status: 'success', message: '2FA successfully enabled' });
});


// ==========================================
// 💡 TWILIO SMS / 2FA მეთოდები
// ==========================================

// @desc    Send 2FA Code via Twilio SMS
// @route   POST /api/auth/sms-2fa/send
exports.sendSms2FACode = catchAsync(async (req, res, next) => {
  const user = req.user; // ან req.body.email-იდან ძებნა

  if (!user.phoneNumber) {
    return next(new AppError('Phone number is missing on user profile', 400));
  }

  // გენერირდება 6 ნიშნა ერთჯერადი კოდი
  const smsCode = Math.floor(100000 + Math.random() * 900000).toString();

  user.twoFactorCode = smsCode;
  user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // ვადის გასვლა 10 წუთში
  await user.save({ validateBeforeSave: false });

  // Twilio SMS-ის გაგზავნა
  const smsResult = await sendSMS(user.phoneNumber, `Your Marketplace 2FA verification code is: ${smsCode}`);

  if (!smsResult.success) {
    return next(new AppError('Failed to send SMS via Twilio', 500));
  }

  res.status(200).json({
    status: 'success',
    message: '2FA verification code sent successfully via SMS'
  });
});

// @desc    Verify Twilio SMS 2FA Code
// @route   POST /api/auth/sms-2fa/verify
exports.verifySms2FA = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  const user = req.user;

  if (!user || !user.twoFactorCode || !user.twoFactorExpires) {
    return next(new AppError('No active 2FA code found. Please request a new one.', 400));
  }

  if (user.twoFactorExpires < Date.now()) {
    return next(new AppError('2FA code has expired', 400));
  }

  if (user.twoFactorCode !== code) {
    return next(new AppError('Invalid 2FA verification code', 400));
  }

  // კოდი სწორია, ვასუფთავებთ ველებს და ვრთავთ 2FA-ს
  user.twoFactorEnabled = true;
  user.twoFactorCode = undefined;
  user.twoFactorExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const token = exports.signToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'SMS 2FA verified successfully',
    token
  });
});