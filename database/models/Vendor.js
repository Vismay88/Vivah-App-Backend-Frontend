const mongoose = require('mongoose');
const {
  VENDOR_CATEGORIES,
  INDIAN_PHONE_REGEX,
  GUJARAT_CITIES
} = require('../../enums/index');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  features: [{ type: String }],
  isPopular: { type: Boolean, default: false },
});

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [{ type: String }],
  },
  { timestamps: true }
);

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [150, 'Business name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: VENDOR_CATEGORIES,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: GUJARAT_CITIES,
    },
    address: { type: String },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [INDIAN_PHONE_REGEX, 'Please enter a valid Indian phone number']
    },
    whatsapp: {
      type: String,
      match: [INDIAN_PHONE_REGEX, 'Please enter a valid Indian phone number']
    },
    email: { type: String },
    website: { type: String },
    startingPrice: {
      type: Number,
      required: [true, 'Starting price is required'],
      min: [0, 'Price cannot be negative'],
    },
    coverPhoto: { type: String, default: null },
    profilePhoto: { type: String, default: null },
    portfolio: [
      {
        url: { type: String },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        caption: { type: String },
      },
    ],
    packages: [packageSchema],
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
    yearsOfExperience: { type: Number, default: 0 },
    eventsCompleted: { type: Number, default: 0 },
    socialLinks: {
      instagram: { type: String },
      facebook: { type: String },
      youtube: { type: String },
    },
    viewCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from businessName
vendorSchema.pre('save', async function (next) {
  if (this.isModified('businessName') || this.isNew) {
    const slugify = require('slugify');
    let baseSlug = slugify(this.businessName, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;
    while (await mongoose.model('Vendor').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    this.slug = slug;
  }
  next();
});

// Recalculate average rating when reviews change
vendorSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.totalReviews = this.reviews.length;
  }
};

// Indexes for search performance
vendorSchema.index({ category: 1, city: 1 });
vendorSchema.index({ startingPrice: 1 });
vendorSchema.index({ averageRating: -1 });
vendorSchema.index({ businessName: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Vendor', vendorSchema);
