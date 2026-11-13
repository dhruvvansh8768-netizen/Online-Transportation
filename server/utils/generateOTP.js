// ============================================
// utils/generateOTP.js — OTP Generator
// ============================================
// Generates random numeric OTP codes for ride
// verification and authentication.
// ============================================

/**
 * Generate a random numeric OTP of specified length.
 * @param {number} length - Number of digits (default 4)
 * @returns {string} The OTP string (e.g., "4821")
 */
const generateOTP = (length = 4) => {
  // Ensure length is between 4 and 8
  const otpLength = Math.min(Math.max(length, 4), 8);

  // Generate a random number with the required number of digits
  const min = Math.pow(10, otpLength - 1);  // e.g., 1000 for 4 digits
  const max = Math.pow(10, otpLength) - 1;   // e.g., 9999 for 4 digits

  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return otp.toString();
};

/**
 * Generate a random alphanumeric code (for transaction IDs, etc.).
 * @param {number} length - Length of the code (default 12)
 * @returns {string} The alphanumeric code
 */
const generateTransactionId = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'TXN_';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = { generateOTP, generateTransactionId };
