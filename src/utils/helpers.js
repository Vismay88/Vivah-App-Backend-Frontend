// Format currency in INR
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with Indian comma system
export const formatNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

// Get category icon
export const getCategoryIcon = (category) => {
  const icons = {
    Photography: 'pi pi-camera',
    Catering: 'pi pi-star',
    Decoration: 'pi pi-palette',
    Mehendi: 'pi pi-pencil',
    DJ: 'pi pi-volume-up',
    Makeup: 'pi pi-heart',
    Venue: 'pi pi-building',
    Videography: 'pi pi-video',
    Invitation: 'pi pi-envelope',
    Pandit: 'pi pi-sun',
  };
  return icons[category] || 'pi pi-tag';
};

// Get category emoji
export const getCategoryEmoji = (category) => {
  const emojis = {
    Photography: '📸',
    Catering: '🍽️',
    Decoration: '🌸',
    Mehendi: '🌿',
    DJ: '🎵',
    Makeup: '💄',
    Venue: '🏛️',
    Videography: '🎬',
    Invitation: '💌',
    Pandit: '🙏',
  };
  return emojis[category] || '✨';
};

// Get category color
export const getCategoryColor = (category) => {
  const colors = {
    Photography: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hex: '#1d4ed8' },
    Catering: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', hex: '#c2410c' },
    Decoration: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', hex: '#be185d' },
    Mehendi: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', hex: '#15803d' },
    DJ: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hex: '#7e22ce' },
    Makeup: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', hex: '#be123c' },
    Venue: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', hex: '#b45309' },
    Videography: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', hex: '#4338ca' },
    Invitation: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', hex: '#0f766e' },
    Pandit: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', hex: '#a16207' },
  };
  return colors[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', hex: '#374151' };
};

// Truncate text
export const truncate = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Get WhatsApp link
export const getWhatsAppLink = (phone, message = '') => {
  const cleanPhone = phone?.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/91${cleanPhone}?text=${encodedMessage}`;
};

// Get share URL
export const getVendorShareUrl = (slug) => {
  return `${window.location.origin}/vendors/${slug}`;
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

// Get relative time
export const getRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Gujarat cities list — must match backend Vendor.js city enum exactly
export const GUJARAT_CITIES = [
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

// Vendor categories — must match backend Vendor.js category enum exactly
export const VENDOR_CATEGORIES = [
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

// Budget categories with default percentages
export const BUDGET_CATEGORIES = [
  { name: 'Venue', percentage: 25, icon: '🏛️', color: '#b45309' },
  { name: 'Catering', percentage: 30, icon: '🍽️', color: '#c2410c' },
  { name: 'Photography', percentage: 10, icon: '📸', color: '#1d4ed8' },
  { name: 'Decoration', percentage: 10, icon: '🌸', color: '#be185d' },
  { name: 'Makeup', percentage: 5, icon: '💄', color: '#be123c' },
  { name: 'Mehendi', percentage: 3, icon: '🌿', color: '#15803d' },
  { name: 'DJ', percentage: 4, icon: '🎵', color: '#7e22ce' },
  { name: 'Invitation', percentage: 2, icon: '💌', color: '#0f766e' },
  { name: 'Clothing', percentage: 6, icon: '👗', color: '#9333ea' },
  { name: 'Jewelry', percentage: 3, icon: '💍', color: '#d97706' },
  { name: 'Pandit', percentage: 1, icon: '🙏', color: '#a16207' },
  { name: 'Miscellaneous', percentage: 1, icon: '✨', color: '#6b7280' },
];
