const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendorBySlug,
  createVendor,
  updateVendor,
  addReview,
  getMyVendorProfile,
  getVendorsByBudget,
  getStats,
} = require('../controllers/vendor.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

router.get('/stats', getStats);
router.get('/by-budget', getVendorsByBudget);
router.get('/my-profile', protect, getMyVendorProfile);
router.get('/', getVendors);
router.post('/', protect, createVendor);
router.get('/:slug', optionalAuth, getVendorBySlug);
router.put('/:id', protect, updateVendor);
router.post('/:slug/reviews', protect, addReview);

module.exports = router;
