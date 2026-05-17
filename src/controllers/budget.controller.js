const BudgetPlan = require('../../database/models/BudgetPlan');
const Vendor = require('../../database/models/Vendor');
const { v4: uuidv4 } = require('uuid');

// ─── Default percentage splits per event type ───────────────────────────────
// Only include categories that make real-world sense for each event.
// Percentages always sum to exactly 100.
const EVENT_DEFAULTS = {
  Wedding: {
    // Full traditional wedding — all categories apply
    Venue: 25, Catering: 28, Photography: 10, Decoration: 12,
    Makeup: 5, Mehendi: 4, DJ: 4, Invitation: 2,
    Clothing: 6, Jewelry: 2, Pandit: 1, Miscellaneous: 1,
  },
  Engagement: {
    // Intimate ceremony — no DJ/Pandit needed, focus on look & decor
    Venue: 28, Catering: 22, Photography: 14, Decoration: 16,
    Makeup: 8, Mehendi: 5, Invitation: 2, Clothing: 3, Miscellaneous: 2,
  },
  Reception: {
    // Party-style — DJ is big, no Mehendi/Pandit
    Venue: 30, Catering: 26, Photography: 10, Decoration: 14,
    Makeup: 4, DJ: 8, Invitation: 2, Clothing: 4, Miscellaneous: 2,
  },
  Birthday: {
    // Fun celebration — Venue, Food, Decor, DJ, Photography. No Mehendi/Pandit/Jewelry
    Venue: 28, Catering: 30, Photography: 10, Decoration: 20,
    DJ: 8, Invitation: 2, Miscellaneous: 2,
  },
  Anniversary: {
    // Romantic dinner/party — no Mehendi/Pandit, focus on ambience
    Venue: 30, Catering: 28, Photography: 14, Decoration: 16,
    Makeup: 4, DJ: 5, Invitation: 1, Miscellaneous: 2,
  },
  'Baby Shower': {
    // Daytime party — no DJ/Pandit, heavy on decor & food
    Venue: 22, Catering: 30, Photography: 12, Decoration: 24,
    Makeup: 4, Invitation: 4, Miscellaneous: 4,
  },
  'Corporate Event': {
    // Professional — no Mehendi/Pandit/Jewelry/Clothing, AV & catering heavy
    Venue: 35, Catering: 28, Photography: 10, Decoration: 14,
    DJ: 6, Invitation: 3, Miscellaneous: 4,
  },
  'Festival Celebration': {
    // Cultural — Mehendi & Decoration heavy, DJ for music
    Venue: 20, Catering: 26, Photography: 8, Decoration: 22,
    Mehendi: 8, DJ: 8, Invitation: 2, Clothing: 4, Miscellaneous: 2,
  },
  Other: {
    Venue: 28, Catering: 30, Photography: 10, Decoration: 16,
    Makeup: 4, DJ: 6, Invitation: 2, Miscellaneous: 4,
  },
};

// Categories that have matching vendors in the system
const VENDOR_LINKED_CATEGORIES = [
  'Venue', 'Catering', 'Photography', 'Videography',
  'Decoration', 'Makeup', 'Mehendi', 'DJ', 'Invitation', 'Pandit',
];

/**
 * Apply priority boost: categories in the priorities list get extra weight.
 * The boost is proportional to priority rank (first = highest boost).
 * Total percentages are re-normalised to exactly 100 after boosting,
 * using a single-pass floor + remainder distribution to avoid rounding drift.
 */
function applyPriorityBoost(basePercentages, priorities = []) {
  const result = { ...basePercentages };

  if (priorities.length) {
    // Boost factor: top priority gets +50% of its base, last priority gets +10%
    priorities.forEach((cat, idx) => {
      if (result[cat] !== undefined && result[cat] > 0) {
        const boostFactor = 0.5 - (idx / Math.max(priorities.length - 1, 1)) * 0.4;
        result[cat] = result[cat] * (1 + boostFactor);
      }
    });
  }

  // Re-normalise to exactly 100 using largest-remainder method
  const total = Object.values(result).reduce((s, v) => s + v, 0);
  if (total === 0) return result;

  const keys = Object.keys(result);
  const scaled = keys.map(k => ({ key: k, exact: (result[k] / total) * 100 }));

  // Floor each value
  let floorSum = 0;
  scaled.forEach(item => {
    item.floor = Math.floor(item.exact);
    item.remainder = item.exact - item.floor;
    floorSum += item.floor;
  });

  // Distribute the remaining integer points to items with largest remainders
  const toDistribute = 100 - floorSum;
  scaled.sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < toDistribute; i++) {
    scaled[i].floor += 1;
  }

  // Rebuild as object, keeping original key order
  const normalised = {};
  scaled.forEach(item => { normalised[item.key] = item.floor; });
  return normalised;
}

// @desc    Smart budget allocation with event type + priorities
// @route   POST /api/budget/smart-allocate
exports.smartAllocate = async (req, res) => {
  try {
    const { totalBudget, eventType = 'Wedding', priorities = [], city } = req.body;

    if (!totalBudget || totalBudget < 8000) {
      return res.status(400).json({ success: false, message: 'Minimum budget is ₹8,000' });
    }

    const basePercentages = EVENT_DEFAULTS[eventType] || EVENT_DEFAULTS.Wedding;
    const adjustedPercentages = applyPriorityBoost(basePercentages, priorities);

    // Build category allocations
    const categories = Object.entries(adjustedPercentages)
      .filter(([, pct]) => pct > 0)
      .map(([category, percentage]) => ({
        category,
        percentage,
        allocatedAmount: Math.round((totalBudget * percentage) / 100),
        isVendorLinked: VENDOR_LINKED_CATEGORIES.includes(category),
      }));

    // Fetch top vendors for vendor-linked categories in parallel
    const vendorLinked = categories.filter(c => c.isVendorLinked);
    const vendorResults = await Promise.all(
      vendorLinked.map(async (cat) => {
        try {
          const query = {
            isActive: true,
            category: cat.category,
            startingPrice: { $lte: cat.allocatedAmount },
          };
          if (city) query.city = city;

          const vendors = await Vendor.find(query)
            .sort({ isFeatured: -1, averageRating: -1, startingPrice: 1 })
            .limit(4)
            .select('businessName slug category city startingPrice averageRating totalReviews profilePhoto isVerified isFeatured');

          return { category: cat.category, vendors };
        } catch {
          return { category: cat.category, vendors: [] };
        }
      })
    );

    // Merge vendor data into categories
    const vendorMap = {};
    vendorResults.forEach(({ category, vendors }) => {
      vendorMap[category] = vendors;
    });

    const enrichedCategories = categories.map(cat => ({
      ...cat,
      vendors: vendorMap[cat.category] || [],
    }));

    res.json({
      success: true,
      eventType,
      totalBudget,
      priorities,
      categories: enrichedCategories,
    });
  } catch (error) {
    console.error('smartAllocate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate budget split (legacy endpoint kept for compatibility)
// @route   POST /api/budget/calculate
exports.calculateBudget = async (req, res) => {
  try {
    const { totalBudget, customPercentages, eventType = 'Wedding' } = req.body;

    if (!totalBudget || totalBudget < 8000) {
      return res.status(400).json({ success: false, message: 'Minimum budget is ₹8,000' });
    }

    const basePercentages = EVENT_DEFAULTS[eventType] || EVENT_DEFAULTS.Wedding;
    const percentages = { ...basePercentages, ...customPercentages };

    const categories = Object.entries(percentages).map(([category, percentage]) => ({
      category,
      percentage,
      allocatedAmount: Math.round((totalBudget * percentage) / 100),
    }));

    res.json({ success: true, categories, totalBudget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save budget plan
// @route   POST /api/budget/save
exports.saveBudgetPlan = async (req, res) => {
  try {
    const { totalBudget, categories, eventType, weddingDate, guestCount, city, notes, priorities } = req.body;

    const shareToken = uuidv4();

    const planData = {
      totalBudget,
      categories,
      eventType: eventType || 'Wedding',
      weddingDate,
      guestCount,
      city,
      notes,
      priorities: priorities || [],
      shareToken,
      isPublic: true,
    };

    if (req.user) {
      planData.user = req.user._id;
    }

    const plan = await BudgetPlan.create(planData);

    res.status(201).json({ success: true, plan, shareToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get budget plan by share token
// @route   GET /api/budget/share/:token
exports.getBudgetByToken = async (req, res) => {
  try {
    const plan = await BudgetPlan.findOne({ shareToken: req.params.token });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Budget plan not found' });
    }
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my budget plans
// @route   GET /api/budget/my-plans
exports.getMyBudgetPlans = async (req, res) => {
  try {
    const plans = await BudgetPlan.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get default percentages
// @route   GET /api/budget/defaults
exports.getDefaults = async (req, res) => {
  res.json({ success: true, defaults: EVENT_DEFAULTS });
};
