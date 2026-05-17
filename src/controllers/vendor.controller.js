const Vendor = require('../../database/models/Vendor');
const User = require('../../database/models/User');
const { VENDOR_CATEGORIES, GUJARAT_CITIES } = require('../../enums');

// Fields a vendor owner is allowed to update — whitelist approach
const VENDOR_UPDATABLE_FIELDS = [
  'businessName', 'description', 'city', 'address', 'phone', 'whatsapp',
  'email', 'website', 'startingPrice', 'coverPhoto', 'profilePhoto',
  'portfolio', 'packages', 'tags', 'yearsOfExperience', 'eventsCompleted',
  'socialLinks', 'category',
];

// Fields allowed on create (excludes admin-only fields)
const VENDOR_CREATABLE_FIELDS = [
  ...VENDOR_UPDATABLE_FIELDS, 'user',
];

// Safe sort fields — prevent arbitrary sort injection
const ALLOWED_SORT_FIELDS = new Set([
  '-averageRating', 'averageRating',
  '-startingPrice', 'startingPrice',
  '-viewCount',     'viewCount',
  '-createdAt',     'createdAt',
  '-totalReviews',  'totalReviews',
]);

// @desc    Get all vendors with filters
// @route   GET /api/vendors
exports.getVendors = async (req, res) => {
  try {
    const {
      category,
      city,
      minPrice,
      maxPrice,
      rating,
      search,
      sort = '-averageRating',
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const query = { isActive: true };

    // Validate enum values against whitelist
    if (category) {
      if (!VENDOR_CATEGORIES.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      query.category = category;
    }
    if (city) {
      if (!GUJARAT_CITIES.includes(city)) {
        return res.status(400).json({ success: false, message: 'Invalid city' });
      }
      query.city = city;
    }

    if (rating) {
      const r = parseFloat(rating);
      if (isNaN(r) || r < 0 || r > 5) {
        return res.status(400).json({ success: false, message: 'Invalid rating' });
      }
      query.averageRating = { $gte: r };
    }
    if (featured === 'true') query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.startingPrice = {};
      const min = parseInt(minPrice);
      const max = parseInt(maxPrice);
      if (minPrice && (!isNaN(min) && min >= 0)) query.startingPrice.$gte = min;
      if (maxPrice && (!isNaN(max) && max >= 0)) query.startingPrice.$lte = max;
    }

    if (search) {
      // Sanitise search — strip special regex chars
      const sanitised = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
      query.$text = { $search: sanitised };
    }

    // Validate sort field
    const safeSort = ALLOWED_SORT_FIELDS.has(sort) ? sort : '-averageRating';

    // Cap pagination
    const safePage  = Math.max(1, parseInt(page)  || 1);
    const safeLimit = Math.min(48, Math.max(1, parseInt(limit) || 12));
    const skip = (safePage - 1) * safeLimit;

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .sort(safeSort)
        .skip(skip)
        .limit(safeLimit)
        .select('businessName slug category city startingPrice averageRating totalReviews profilePhoto coverPhoto isVerified isFeatured tags yearsOfExperience'),
      Vendor.countDocuments(query),
    ]);

    res.json({
      success: true,
      vendors,
      pagination: {
        total,
        page: safePage,
        pages: Math.ceil(total / safeLimit),
        limit: safeLimit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get vendor by slug
// @route   GET /api/vendors/:slug
exports.getVendorBySlug = async (req, res) => {
  try {
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(req.params.slug)) {
      return res.status(400).json({ success: false, message: 'Invalid slug' });
    }

    const vendor = await Vendor.findOne({ slug: req.params.slug, isActive: true })
      .populate('user', 'name');  // removed email from populate — no need to expose

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendor.viewCount += 1;
    await vendor.save({ validateBeforeSave: false });

    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create vendor profile
// @route   POST /api/vendors
exports.createVendor = async (req, res) => {
  try {
    const existingVendor = await Vendor.findOne({ user: req.user._id });
    if (existingVendor) {
      return res.status(400).json({ success: false, message: 'You already have a vendor profile' });
    }

    // Whitelist — only pick allowed fields, never trust req.body directly
    const vendorData = { user: req.user._id };
    for (const field of VENDOR_UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        vendorData[field] = req.body[field];
      }
    }

    const vendor = await Vendor.create(vendorData);
    await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

    res.status(201).json({ success: true, vendor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update vendor profile
// @route   PUT /api/vendors/:id
exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id, user: req.user._id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found or unauthorized' });
    }

    // Whitelist — only pick allowed fields
    const updateData = {};
    for (const field of VENDOR_UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add review to vendor
// @route   POST /api/vendors/:slug/reviews
exports.addReview = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ slug: req.params.slug });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Validate review fields
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();

    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }
    if (!comment || comment.length < 10 || comment.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment must be between 10 and 1000 characters' });
    }

    // Prevent vendor from reviewing themselves
    if (vendor.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot review your own profile' });
    }

    const alreadyReviewed = vendor.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this vendor' });
    }

    vendor.reviews.push({
      user: req.user._id,
      userName: req.user.name,
      rating,
      comment,
    });
    vendor.calculateAverageRating();
    await vendor.save();

    res.status(201).json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get my vendor profile
// @route   GET /api/vendors/my-profile
exports.getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'No vendor profile found' });
    }
    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get vendors by budget range for a category
// @route   GET /api/vendors/by-budget
exports.getVendorsByBudget = async (req, res) => {
  try {
    const { category, maxBudget, city } = req.query;
    const safeLimit = Math.min(10, Math.max(1, parseInt(req.query.limit) || 4));

    const query = { isActive: true };
    if (category) {
      if (!VENDOR_CATEGORIES.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      query.category = category;
    }
    if (city) {
      if (!GUJARAT_CITIES.includes(city)) {
        return res.status(400).json({ success: false, message: 'Invalid city' });
      }
      query.city = city;
    }
    if (maxBudget) {
      const budget = parseInt(maxBudget);
      if (!isNaN(budget) && budget > 0) {
        query.startingPrice = { $lte: budget };
      }
    }

    const vendors = await Vendor.find(query)
      .sort('-averageRating')
      .limit(safeLimit)
      .select('businessName slug category city startingPrice averageRating totalReviews profilePhoto isVerified');

    res.json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get stats
// @route   GET /api/vendors/stats
exports.getStats = async (req, res) => {
  try {
    const [totalVendors, cities, categories] = await Promise.all([
      Vendor.countDocuments({ isActive: true }),
      Vendor.distinct('city', { isActive: true }),
      Vendor.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: { totalVendors, totalCities: cities.length, cities, categories },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
