const express = require('express');
const router = express.Router();
const {
  calculateBudget,
  saveBudgetPlan,
  getBudgetByToken,
  getMyBudgetPlans,
  getDefaults,
} = require('../controllers/budget.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

router.get('/defaults', getDefaults);
router.post('/calculate', calculateBudget);
router.post('/save', optionalAuth, saveBudgetPlan);
router.get('/share/:token', getBudgetByToken);
router.get('/my-plans', protect, getMyBudgetPlans);

module.exports = router;
