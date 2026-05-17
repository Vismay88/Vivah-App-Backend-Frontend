// constants/enums.js

const USER_ROLES = ['couple', 'vendor', 'admin'];

const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Reception',
  'Birthday',
  'Anniversary',
  'Baby Shower',
  'Corporate Event',
  'Festival Celebration',
  'Other',
];

const VENDOR_CATEGORIES = [
  'Photography',
  'Videography',
  'Catering',
  'Decoration',
  'Mehendi',
  'DJ',
  'Makeup',
  'Venue',
  'Invitation',
  'Pandit',
];

const BUDGET_CATEGORIES = [
  'Venue',
  'Catering',
  'Photography',
  'Decoration',
  'Makeup',
  'Mehendi',
  'DJ',
  'Invitation',
  'Clothing',
  'Jewelry',
  'Pandit',
  'Miscellaneous',
];

const GUJARAT_CITIES = [
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot',
  'Gandhinagar',
  'Bhavnagar',
  'Jamnagar',
  'Junagadh',
  'Anand',
  'Nadiad',
  'Mehsana',
  'Morbi',
  'Surendranagar',
  'Bharuch',
  'Navsari',
  'Valsad',
  'Porbandar',
  'Amreli',
  'Botad',
  'Dwarka',
  'Himatnagar',
  'Palanpur',
  'Godhra',
  'Dahod',
  'Veraval',
  'Gondal',
  'Jetpur',
  'Wankaner',
  'Ankleshwar',
  'Vapi',
];

const INDIAN_PHONE_REGEX = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

module.exports = {
  USER_ROLES,
  EVENT_TYPES,
  VENDOR_CATEGORIES,
  BUDGET_CATEGORIES,
  GUJARAT_CITIES,
  INDIAN_PHONE_REGEX,
};