const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
    isOwnerApproved: user.isOwnerApproved,
    phone: user.phone,
    studentId: user.studentId,
    department: user.department,
  };
  res.status(statusCode).json({ success: true, token, user: userData });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, studentId, department, year, businessName } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name, email, password, role: role || 'student',
      phone, studentId, department, year, businessName,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Email failure should NOT block registration
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailErr) {
      console.error('⚠️  Verification email failed (account still created):', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired verification link' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ success: false, message: 'Please verify your email first' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    try {
      await sendPasswordResetEmail(user, token);
      res.json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (emailErr) {
      // Email failed — clear the token so it's not left dangling
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();
      console.error('❌ Password reset email failed:', emailErr.message);
      res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please check server email configuration.',
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedRooms', 'title rent images address');
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'avatar', 'studentId', 'department', 'year', 'businessName', 'businessAddress'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!await user.comparePassword(req.body.currentPassword)) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleSaveRoom = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const roomId = req.params.roomId;
    const idx = user.savedRooms.indexOf(roomId);
    if (idx > -1) {
      user.savedRooms.splice(idx, 1);
    } else {
      user.savedRooms.push(roomId);
    }
    await user.save();
    res.json({ success: true, saved: idx === -1, savedRooms: user.savedRooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
