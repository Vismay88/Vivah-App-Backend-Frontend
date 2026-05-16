require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../../database/connection');
const User = require('../../database/models/User');
const Vendor = require('../../database/models/Vendor');

const GUJARAT_CITIES = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Nadiad'];

const sampleVendors = [
  {
    businessName: 'Moments by Mehul Photography',
    category: 'Photography',
    city: 'Ahmedabad',
    description: 'Capturing your most precious wedding moments with artistic vision. Specializing in candid and traditional wedding photography across Gujarat.',
    phone: '9876543210',
    whatsapp: '9876543210',
    startingPrice: 35000,
    isVerified: true,
    isFeatured: true,
    yearsOfExperience: 8,
    eventsCompleted: 250,
    tags: ['candid', 'traditional', 'pre-wedding'],
    packages: [
      { name: 'Basic', price: 35000, description: '1 day coverage', features: ['8 hours coverage', '500 edited photos', 'Online gallery'], isPopular: false },
      { name: 'Premium', price: 65000, description: '2 day coverage', features: ['16 hours coverage', '1000 edited photos', 'Album', 'Pre-wedding shoot'], isPopular: true },
      { name: 'Royal', price: 95000, description: 'Full wedding coverage', features: ['Unlimited hours', '2000+ photos', 'Premium album', 'Drone shots', 'Same day edit'], isPopular: false },
    ],
  },
  {
    businessName: 'Shree Caterers Ahmedabad',
    category: 'Catering',
    city: 'Ahmedabad',
    description: 'Authentic Gujarati and multi-cuisine catering for weddings. Serving 500+ guests with fresh, hygienic food. Jain food available.',
    phone: '9876543211',
    whatsapp: '9876543211',
    startingPrice: 450,
    isVerified: true,
    isFeatured: true,
    yearsOfExperience: 15,
    eventsCompleted: 800,
    tags: ['gujarati', 'jain', 'multi-cuisine', 'buffet'],
    packages: [
      { name: 'Silver', price: 450, description: 'Per plate - basic menu', features: ['20 items', 'Gujarati thali', 'Soft drinks'], isPopular: false },
      { name: 'Gold', price: 650, description: 'Per plate - premium menu', features: ['35 items', 'Live counters', 'Dessert station', 'Welcome drinks'], isPopular: true },
      { name: 'Platinum', price: 950, description: 'Per plate - royal menu', features: ['50+ items', 'Multiple cuisines', 'Ice cream counter', 'Mocktail bar'], isPopular: false },
    ],
  },
  {
    businessName: 'Dream Decor Surat',
    category: 'Decoration',
    city: 'Surat',
    description: 'Transform your wedding venue into a dream with our floral and theme decorations. Specializing in mandap decoration, stage setup, and floral arrangements.',
    phone: '9876543212',
    whatsapp: '9876543212',
    startingPrice: 25000,
    isVerified: true,
    isFeatured: false,
    yearsOfExperience: 6,
    eventsCompleted: 180,
    tags: ['floral', 'mandap', 'stage', 'theme'],
    packages: [
      { name: 'Classic', price: 25000, description: 'Basic decoration', features: ['Mandap decoration', 'Stage backdrop', 'Entrance arch'], isPopular: false },
      { name: 'Elegant', price: 55000, description: 'Full venue decoration', features: ['Complete venue', 'Floral arrangements', 'Lighting', 'Photo booth'], isPopular: true },
      { name: 'Grand', price: 120000, description: 'Luxury decoration', features: ['Premium flowers', 'Custom theme', 'LED walls', 'Drone entry'], isPopular: false },
    ],
  },
  {
    businessName: 'Henna Art by Priya',
    category: 'Mehendi',
    city: 'Vadodara',
    description: 'Intricate bridal mehendi designs with Arabic, Rajasthani, and Indo-Arabic patterns. Team of 5 artists for large events.',
    phone: '9876543213',
    whatsapp: '9876543213',
    startingPrice: 5000,
    isVerified: true,
    isFeatured: false,
    yearsOfExperience: 10,
    eventsCompleted: 400,
    tags: ['bridal', 'arabic', 'rajasthani', 'indo-arabic'],
    packages: [
      { name: 'Bridal Basic', price: 5000, description: 'Bridal hands only', features: ['Both hands', 'Simple design', '2 hours'], isPopular: false },
      { name: 'Bridal Full', price: 9000, description: 'Hands and feet', features: ['Hands + feet', 'Intricate design', '4 hours'], isPopular: true },
      { name: 'Bridal Royal', price: 15000, description: 'Full bridal package', features: ['Hands + feet + arms', 'Custom design', 'Guest mehendi included'], isPopular: false },
    ],
  },
  {
    businessName: 'DJ Rhythm Rajkot',
    category: 'DJ',
    city: 'Rajkot',
    description: 'Professional DJ services for weddings, sangeet, and garba nights. Latest sound system and lighting equipment. Bollywood, Garba, and international music.',
    phone: '9876543214',
    whatsapp: '9876543214',
    startingPrice: 15000,
    isVerified: false,
    isFeatured: false,
    yearsOfExperience: 5,
    eventsCompleted: 120,
    tags: ['bollywood', 'garba', 'sangeet', 'lighting'],
    packages: [
      { name: 'Basic', price: 15000, description: '4 hours', features: ['Sound system', 'Basic lighting', 'DJ for 4 hours'], isPopular: false },
      { name: 'Premium', price: 28000, description: '8 hours', features: ['Premium sound', 'LED lighting', 'Fog machine', 'DJ for 8 hours'], isPopular: true },
      { name: 'Grand', price: 45000, description: 'Full event', features: ['Concert-grade sound', 'Full lighting rig', 'Laser show', 'Anchor'], isPopular: false },
    ],
  },
  {
    businessName: 'Glamour Studio by Kavya',
    category: 'Makeup',
    city: 'Ahmedabad',
    description: 'Professional bridal makeup artist with 7 years experience. HD makeup, airbrush, and traditional looks. Serving brides across Gujarat.',
    phone: '9876543215',
    whatsapp: '9876543215',
    startingPrice: 8000,
    isVerified: true,
    isFeatured: true,
    yearsOfExperience: 7,
    eventsCompleted: 350,
    tags: ['bridal', 'HD makeup', 'airbrush', 'traditional'],
    packages: [
      { name: 'Classic Bridal', price: 8000, description: 'Basic bridal look', features: ['Bridal makeup', 'Hairstyle', 'Saree draping'], isPopular: false },
      { name: 'HD Bridal', price: 15000, description: 'HD makeup package', features: ['HD makeup', 'Airbrush', 'Hairstyle', 'Saree draping', 'Touch-up kit'], isPopular: true },
      { name: 'Royal Bridal', price: 25000, description: 'Complete bridal package', features: ['Airbrush makeup', 'Hair extensions', 'Pre-bridal session', 'All day touch-up'], isPopular: false },
    ],
  },
  {
    businessName: 'The Grand Pavilion Venue',
    category: 'Venue',
    city: 'Surat',
    description: 'Luxurious wedding venue with capacity for 1000+ guests. Air-conditioned banquet halls, outdoor lawns, and dedicated parking. In-house catering available.',
    phone: '9876543216',
    whatsapp: '9876543216',
    startingPrice: 150000,
    isVerified: true,
    isFeatured: true,
    yearsOfExperience: 12,
    eventsCompleted: 500,
    tags: ['banquet', 'lawn', 'AC', 'parking', 'catering'],
    packages: [
      { name: 'Hall Only', price: 150000, description: 'Banquet hall rental', features: ['500 capacity', 'AC hall', 'Basic lighting', 'Parking'], isPopular: false },
      { name: 'Full Venue', price: 250000, description: 'Hall + lawn', features: ['1000 capacity', 'Indoor + outdoor', 'Premium lighting', 'Bridal room'], isPopular: true },
      { name: 'Royal Package', price: 450000, description: 'Complete venue package', features: ['1500 capacity', 'All areas', 'Decoration included', 'Catering included'], isPopular: false },
    ],
  },
  {
    businessName: 'Pixel Perfect Films',
    category: 'Photography',
    city: 'Surat',
    description: 'Cinematic wedding films and photography. We tell your love story through stunning visuals. Drone coverage and same-day edit available.',
    phone: '9876543217',
    whatsapp: '9876543217',
    startingPrice: 45000,
    isVerified: true,
    isFeatured: false,
    yearsOfExperience: 5,
    eventsCompleted: 150,
    tags: ['cinematic', 'drone', 'same-day-edit', 'films'],
    packages: [
      { name: 'Photo Only', price: 45000, description: 'Photography package', features: ['Full day coverage', '800 edited photos', 'Online delivery'], isPopular: false },
      { name: 'Photo + Video', price: 85000, description: 'Complete coverage', features: ['Photo + video', 'Highlight reel', 'Full film', 'Drone shots'], isPopular: true },
    ],
  },
  {
    businessName: 'Maharaja Caterers Vadodara',
    category: 'Catering',
    city: 'Vadodara',
    description: 'Traditional Gujarati wedding catering with authentic flavors. Specializing in Saurashtra and Kathiawadi cuisine. Minimum 200 guests.',
    phone: '9876543218',
    whatsapp: '9876543218',
    startingPrice: 400,
    isVerified: false,
    isFeatured: false,
    yearsOfExperience: 20,
    eventsCompleted: 1200,
    tags: ['gujarati', 'kathiawadi', 'traditional', 'authentic'],
    packages: [
      { name: 'Basic', price: 400, description: 'Per plate', features: ['15 items', 'Gujarati thali'], isPopular: false },
      { name: 'Premium', price: 600, description: 'Per plate', features: ['30 items', 'Live counters', 'Desserts'], isPopular: true },
    ],
  },
  {
    businessName: 'Floral Fantasy Decoration',
    category: 'Decoration',
    city: 'Ahmedabad',
    description: 'Premium floral wedding decorations. Fresh flowers imported from across India. Specializing in rose, marigold, and orchid arrangements.',
    phone: '9876543219',
    whatsapp: '9876543219',
    startingPrice: 30000,
    isVerified: true,
    isFeatured: false,
    yearsOfExperience: 9,
    eventsCompleted: 300,
    tags: ['floral', 'fresh flowers', 'roses', 'marigold'],
    packages: [
      { name: 'Simple', price: 30000, description: 'Basic floral decor', features: ['Mandap', 'Stage', 'Entrance'], isPopular: false },
      { name: 'Grand', price: 75000, description: 'Full floral decor', features: ['Complete venue', 'Premium flowers', 'Custom design'], isPopular: true },
    ],
  },
  {
    businessName: 'Beats & Lights DJ Ahmedabad',
    category: 'DJ',
    city: 'Ahmedabad',
    description: 'Top-rated DJ service in Ahmedabad. Specializing in Bollywood, EDM, and Garba music. Professional sound and lighting setup.',
    phone: '9876543220',
    whatsapp: '9876543220',
    startingPrice: 20000,
    isVerified: true,
    isFeatured: false,
    yearsOfExperience: 8,
    eventsCompleted: 200,
    tags: ['bollywood', 'EDM', 'garba', 'professional'],
    packages: [
      { name: 'Standard', price: 20000, description: '6 hours', features: ['Sound system', 'Lighting', 'DJ'], isPopular: false },
      { name: 'Premium', price: 35000, description: '10 hours', features: ['Premium sound', 'LED setup', 'Fog machine'], isPopular: true },
    ],
  },
  {
    businessName: 'Bridal Bliss Makeup Studio',
    category: 'Makeup',
    city: 'Surat',
    description: 'Award-winning bridal makeup studio in Surat. International makeup techniques with Indian traditional touch. Trial session available.',
    phone: '9876543221',
    whatsapp: '9876543221',
    startingPrice: 10000,
    isVerified: true,
    isFeatured: false,
    yearsOfExperience: 6,
    eventsCompleted: 280,
    tags: ['bridal', 'international', 'trial', 'award-winning'],
    packages: [
      { name: 'Bridal', price: 10000, description: 'Bridal makeup', features: ['Makeup', 'Hairstyle', 'Draping'], isPopular: false },
      { name: 'Premium Bridal', price: 18000, description: 'Premium package', features: ['HD makeup', 'Hair', 'Draping', 'Trial'], isPopular: true },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await Vendor.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@vivahbazaar.com',
      password: 'admin123',
      role: 'admin',
      phone: '9000000000',
    });
    console.log('👤 Admin user created');

    // Create vendor users and profiles
    for (let i = 0; i < sampleVendors.length; i++) {
      const vendorData = sampleVendors[i];
      const city = vendorData.city;

      const user = await User.create({
        name: vendorData.businessName + ' Owner',
        email: `vendor${i + 1}@vivahbazaar.com`,
        password: 'vendor123',
        role: 'vendor',
        phone: vendorData.phone,
      });

      // Add sample reviews
      const reviews = [
        { user: admin._id, userName: 'Priya Shah', rating: 5, comment: 'Absolutely amazing service! Highly recommended for any wedding.' },
        { user: admin._id, userName: 'Rahul Patel', rating: 4, comment: 'Very professional and delivered exactly what was promised.' },
        { user: admin._id, userName: 'Neha Desai', rating: 5, comment: 'Best in Gujarat! Our wedding was perfect because of them.' },
      ];

      const vendor = new Vendor({
        ...vendorData,
        user: user._id,
        reviews,
      });
      vendor.calculateAverageRating();
      await vendor.save();

      console.log(`✅ Created vendor: ${vendorData.businessName}`);
    }

    // Create a couple user
    await User.create({
      name: 'Anjali Mehta',
      email: 'couple@vivahbazaar.com',
      password: 'couple123',
      role: 'couple',
      phone: '9111111111',
    });
    console.log('💑 Couple user created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Admin: admin@vivahbazaar.com / admin123');
    console.log('📧 Vendor: vendor1@vivahbazaar.com / vendor123');
    console.log('📧 Couple: couple@vivahbazaar.com / couple123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
