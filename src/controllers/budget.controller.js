const BudgetPlan = require('../../database/models/BudgetPlan');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_PERCENTAGES = {
  Venue: 25,
  Catering: 30,
  Photography: 10,
  Decoration: 10,
  Makeup: 5,
  Mehendi: 3,
  DJ: 4,
  Invitation: 2,
  Clothing: 6,
  Jewelry: 3,
  Pandit: 1,
  Miscellaneous: 1,
};

// @desc    Calculate budget split
// @route   POST /api/budget/calculate
exports.calculateBudget = async (req, res) => {
  try {
    const { totalBudget, customPercentages } = req.body;

    if (!totalBudget || totalBudget < 10000) {
      return res.status(400).json({ success: false, message: 'Minimum budget is ₹10,000' });
    }

    const percentages = { ...DEFAULT_PERCENTAGES, ...customPercentages };

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
    const { totalBudget, categories, weddingDate, guestCount, city, notes } = req.body;

    const shareToken = uuidv4();

    const planData = {
      totalBudget,
      categories,
      weddingDate,
      guestCount,
      city,
      notes,
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
  res.json({ success: true, defaults: DEFAULT_PERCENTAGES });
};
