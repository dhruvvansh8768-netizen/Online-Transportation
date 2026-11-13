/**
 * Utility helpers — formatters, validators, and misc functions
 */

// Format currency (INR by default)
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount == null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format distance in km
export const formatDistance = (meters) => {
  if (!meters) return '0 km';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

// Format duration in minutes
export const formatDuration = (seconds) => {
  if (!seconds) return '0 min';
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m`;
};

// Format date to readable string
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format time to readable string
export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format date and time
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`;
};

// Relative time (e.g., "5 minutes ago")
export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Normalize phone number (strips country code +91, leading 0, spaces, and hyphens)
export const normalizePhone = (phone) => {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
};

// Validate phone number (Indian format: 10 digits starting with 6, 7, 8, or 9)
export const isValidPhone = (phone) => {
  const normalized = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
};

// Validate password strength
export const isStrongPassword = (password) => {
  return password && password.length >= 8;
};

// Get password strength label
export const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: '' };
  if (password.length < 6) return { label: 'Weak', color: 'text-red-400' };
  if (password.length < 8) return { label: 'Fair', color: 'text-yellow-400' };
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 3) return { label: 'Strong', color: 'text-accent' };
  return { label: 'Good', color: 'text-blue-400' };
};

// Truncate string
export const truncate = (str, maxLen = 30) => {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
};

// Generate random OTP display (for UI preview)
export const generateOTP = (length = 4) => {
  return Math.random().toString().slice(2, 2 + length);
};

// Calculate Haversine distance between two coords
export const haversineDistance = (coord1, coord2) => {
  const R = 6371e3; // Earth radius in meters
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get ride status label and color
export const getRideStatusInfo = (status) => {
  const statusMap = {
    searching: { label: 'Searching', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    accepted: { label: 'Accepted', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    arriving: { label: 'Driver Arriving', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    'in-progress': { label: 'In Progress', color: 'text-accent', bg: 'bg-accent/10' },
    completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-400/10' },
    cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10' },
  };
  return statusMap[status] || { label: status, color: 'text-gray-400', bg: 'bg-gray-400/10' };
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Debounce function
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// Format rating as stars
export const formatRating = (rating) => {
  if (!rating) return '0.0';
  return parseFloat(rating).toFixed(1);
};
