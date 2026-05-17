const Vendor = require('../../database/models/Vendor');
const User = require('../../database/models/User');

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

    if (category) query.category = category;
    if (city) query.city = city;
    if (rating) query.averageRating = { $gte: parseFloat(rating) };
    if (featured === 'true') query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = parseInt(minPrice);
      if (maxPrice) query.startingPrice.$lte = parseInt(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('businessName slug category city startingPrice averageRating totalReviews profilePhoto coverPhoto isVerified isFeatured tags yearsOfExperience'),
      Vendor.countDocuments(query),
    ]);

    res.json({
      success: true,
      vendors,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vendor by slug
// @route   GET /api/vendors/:slug
exports.getVendorBySlug = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ slug: req.params.slug, isActive: true })
      .populate('user', 'name email');

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Increment view count
    vendor.viewCount += 1;
    await vendor.save({ validateBeforeSave: false });

    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    const vendorData = { ...req.body, user: req.user._id };
    const vendor = await Vendor.create(vendorData);

    // Update user role to vendor
    await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

    res.status(201).json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    const updatedVendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    // Check if user already reviewed
    const alreadyReviewed = vendor.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this vendor' });
    }

    const review = {
      user: req.user._id,
      userName: req.user.name,
      rating: req.body.rating,
      comment: req.body.comment,
    };

    vendor.reviews.push(review);
    vendor.calculateAverageRating();
    await vendor.save();

    res.status(201).json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get vendors by budget range for a category
// @route   GET /api/vendors/by-budget
exports.getVendorsByBudget = async (req, res) => {
  try {
    const { category, maxBudget, city, limit = 3 } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (city) query.city = city;
    if (maxBudget) query.startingPrice = { $lte: parseInt(maxBudget) };

    const vendors = await Vendor.find(query)
      .sort('-averageRating')
      .limit(parseInt(limit))
      .select('businessName slug category city startingPrice averageRating totalReviews profilePhoto isVerified');

    res.json({ success: true, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stats (vendor count, cities)
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
      stats: {
        totalVendors,
        totalCities: cities.length,
        cities,
        categories,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
