const mongoose = require('mongoose');
const { BUDGET_CATEGORIES } = require('../../enums');

const budgetCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum:BUDGET_CATEGORIES
    
  },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  allocatedAmount: { type: Number, required: true, min: 0 },
  actualSpent: { type: Number, default: 0 },
  notes: { type: String },
});

const budgetPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    totalBudget: {
      type: Number,
      required: [true, 'Total budget is required'],
      min: [8000, 'Minimum budget is ₹8000'],
    },
    weddingDate: { type: Date },
    guestCount: { type: Number },
    city: { type: String },
    categories: [budgetCategorySchema],
    notes: { type: String },
    isPublic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BudgetPlan', budgetPlanSchema);
