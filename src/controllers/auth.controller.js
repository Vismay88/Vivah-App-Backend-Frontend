const jwt = require('jsonwebtoken');
const User = require('../../database/models/User');
const Vendor = require('../../database/models/Vendor');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ success: true, token, user: userObj });
};

// Simple in-memory rate limiter for login (production: use redis-based rate limiter)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const checkRateLimit = (ip) => {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.windowStart > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (record.count >= MAX_ATTEMPTS) return false;
  record.count++;
  return true;
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || undefined,
      role: role === 'vendor' ? 'vendor' : 'couple', // only allow couple or vendor on register
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ success: false, message: 'Too many login attempts. Please try again in 15 minutes.' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    // Reset rate limit on successful login
    loginAttempts.delete(ip);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedVendors', 'businessName category city startingPrice averageRating profilePhoto slug');

    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await Vendor.findOne({ user: user._id })
        .select('businessName category city isVerified slug');
    }

    res.json({ success: true, user, vendorProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Whitelist — only allow name and phone, never avatar from client
    const updateData = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters' });
      }
      updateData.name = name.trim();
    }
    if (phone !== undefined) {
      updateData.phone = phone?.trim() || undefined;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Save/unsave vendor
// @route   POST /api/auth/save-vendor/:vendorId
exports.toggleSaveVendor = async (req, res) => {
  try {
    // Validate vendorId is a valid ObjectId
    if (!/^[a-f\d]{24}$/i.test(req.params.vendorId)) {
      return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
    }

    // Verify vendor exists
    const vendorExists = await Vendor.exists({ _id: req.params.vendorId, isActive: true });
    if (!vendorExists) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const user = await User.findById(req.user._id);
    const vendorId = req.params.vendorId;
    const index = user.savedVendors.findIndex(id => id.toString() === vendorId);

    if (index > -1) {
      user.savedVendors.splice(index, 1);
    } else {
      // Cap saved vendors at 100
      if (user.savedVendors.length >= 100) {
        return res.status(400).json({ success: false, message: 'Maximum saved vendors limit reached' });
      }
      user.savedVendors.push(vendorId);
    }

    await user.save();
    res.json({ success: true, savedVendors: user.savedVendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
