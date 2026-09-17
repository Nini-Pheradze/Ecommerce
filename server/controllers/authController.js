const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const { sendSMS } = require('../utils/twilio');
const sendEmail = require('../utils/email');

exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

const signTwoFactorChallengeToken = (id) => {
  return jwt.sign({ id, purpose: 'login-2fa' }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '10m',
  });
};

// გენერაცია და (საჭიროების შემთხვევაში) SMS-ის გაგზავნა შესვლისას, როცა მომხმარებელს 2FA ჩართული აქვს
exports.issueTwoFactorChallenge = async (user) => {
  const twoFactorMethod = user.twoFactorSecret ? 'app' : 'sms';

  if (twoFactorMethod === 'sms') {
    const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFactorCode = smsCode;
    user.twoFactorExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    await sendSMS(user.phoneNumber, `Your ShopSpace login verification code is: ${smsCode}`);
  }

  return { twoFactorMethod, tempToken: signTwoFactorChallengeToken(user._id) };
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
    emailVerificationToken: verificationToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
  });

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'დაადასტურე შენი ShopSpace ანგარიში',
      message: `გთხოვთ დაადასტუროთ თქვენი ელ. ფოსტა შემდეგ ბმულზე გადასვლით: ${verifyUrl}`,
      html: `<p>გამარჯობა ${user.name},</p><p>გთხოვთ დაადასტუროთ თქვენი ელ. ფოსტა <a href="${verifyUrl}">ბმულზე</a> გადასვლით.</p>`
    });
  } catch (err) {
    console.error('Failed to send verification email:', err.message);
  }

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      userId: user._id,
      email: user.email,
      // დეველოპერული რეჟიმისთვის ვაბრუნებთ ტოკენს პასუხშიც (email delivery-ის გარეშე ტესტირებისთვის)
      verificationToken
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +twoFactorSecret');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (user.isBlocked) {
    return next(new AppError('Your account has been blocked', 403));
  }

  if (user.twoFactorEnabled) {
    const challenge = await exports.issueTwoFactorChallenge(user);
    return res.status(200).json({
      status: 'success',
      requires2FA: true,
      ...challenge,
    });
  }

  const token = exports.signToken(user._id);
  user.password = undefined;
  user.twoFactorSecret = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: { user }
  });
});

// @desc    Verify the 2FA code presented after a password login and issue the real session token
// @route   POST /api/auth/login/verify-2fa
exports.verifyLogin2FA = catchAsync(async (req, res, next) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return next(new AppError('Verification code is required', 400));
  }

  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'your-secret-key');
  } catch (err) {
    return next(new AppError('Login session expired, please sign in again', 401));
  }

  if (decoded.purpose !== 'login-2fa') {
    return next(new AppError('Invalid verification session', 401));
  }

  const user = await User.findById(decoded.id).select('+twoFactorSecret +twoFactorCode');
  if (!user || !user.twoFactorEnabled) {
    return next(new AppError('Invalid verification session', 401));
  }

  let verified = false;

  if (user.twoFactorSecret) {
    verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code
    });
  } else {
    verified = Boolean(
      user.twoFactorCode &&
      user.twoFactorCode === code &&
      user.twoFactorExpires &&
      user.twoFactorExpires > Date.now()
    );
    if (verified) {
      user.twoFactorCode = undefined;
      user.twoFactorExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  if (!verified) {
    return next(new AppError('Invalid or expired verification code', 401));
  }

  const token = exports.signToken(user._id);
  user.password = undefined;
  user.twoFactorSecret = undefined;
  user.twoFactorCode = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: { user }
  });
});

// @desc    Get currently logged-in user's profile
// @route   GET /api/auth/me
exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
});

// @desc    Update currently logged-in user's profile (name / phone number)
// @route   PATCH /api/auth/me
exports.updateMe = catchAsync(async (req, res, next) => {
  const { name, phoneNumber } = req.body;

  if (req.body.password || req.body.role || req.body.email) {
    return next(new AppError('This route is not for password, email or role updates', 400));
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// @desc    Change password for the currently logged-in user
// @route   PATCH /api/auth/update-password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!user.password || !(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  const token = exports.signToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
    token
  });
});

// @desc    Verify Email Token
// @route   POST /api/auth/verify-email
exports.verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ status: 'fail', message: 'Invalid or expired token' });
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
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
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'პაროლის აღდგენა — ShopSpace',
      message: `პაროლის აღსადგენად გადადით შემდეგ ბმულზე (ვადა 10 წუთი): ${resetUrl}`,
      html: `<p>პაროლის აღსადგენად დააჭირეთ <a href="${resetUrl}">ამ ბმულს</a>. ბმული ვალიდურია 10 წუთის განმავლობაში.</p>`
    });
  } catch (err) {
    console.error('Failed to send password reset email:', err.message);
  }

  res.status(200).json({
    status: 'success',
    message: 'Reset instructions sent to your email',
    // დეველოპერული რეჟიმისთვის ვაბრუნებთ ტოკენს პასუხშიც
    resetToken
  });
});

// @desc    Reset Password via Token
// @route   POST /api/auth/reset-password
exports.resetPassword = catchAsync(async (req, res) => {
  const token = req.params.token || req.body.token;
  const { newPassword } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ status: 'fail', message: 'Invalid or expired token' });
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({ status: 'success', message: 'Password updated successfully' });
});


// @desc    Generate 2FA QR Code & Secret (Authenticator App)
// @route   POST /api/auth/2fa/generate
exports.generate2FA = catchAsync(async (req, res) => {
  const user = req.user;

  const secret = speakeasy.generateSecret({
    name: `ShopSpace (${user.email})`
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
  const user = await User.findById(req.user.id).select('+twoFactorSecret');

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



// TWILIO SMS / 2FA მეთოდები

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
  const user = await User.findById(req.user.id).select('+twoFactorCode');

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