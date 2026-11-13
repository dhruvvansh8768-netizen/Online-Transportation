import api from './api';

/**
 * Auth service — handles all authentication API calls
 */
const authService = {
  // Login with email and password
  login: (credentials) => api.post('/auth/login', credentials),

  // Register as a rider
  signupRider: (userData) => api.post('/auth/signup/rider', userData),

  // Register as a driver
  signupDriver: (userData) => api.post('/auth/signup/driver', userData),

  // Get current user profile
  getProfile: () => api.get('/auth/profile'),

  // Update user profile
  updateProfile: (data) => api.put('/auth/profile', data),

  // Verify OTP
  verifyOTP: (data) => api.post('/auth/verify-otp', data),

  // Send OTP
  sendOTP: (data) => api.post('/auth/send-otp', data),

  // Forgot password
  forgotPassword: (data) => api.post('/auth/forgot-password', data),

  // Reset password
  resetPassword: (data) => api.post('/auth/reset-password', data),

  // Change password
  changePassword: (data) => api.put('/auth/change-password', data),

  // Logout (invalidate token on server)
  logout: () => api.post('/auth/logout'),
};

export default authService;
