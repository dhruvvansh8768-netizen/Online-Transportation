import api from './api';

/**
 * Ride service — handles all ride-related API calls
 */
const rideService = {
  // Get fare estimate for pickup/destination
  getFareEstimate: (data) => api.post('/rides/estimate', data),

  // Book a new ride
  bookRide: (data) => api.post('/rides/book', data),

  // Get active ride status
  getActiveRide: () => api.get('/rides/active'),
  getPendingRides: () => api.get('/rides/pending'),

  // Get ride by ID
  getRideById: (rideId) => api.get(`/rides/${rideId}`),

  // Cancel a ride
  cancelRide: (rideId) => api.post(`/rides/${rideId}/cancel`),

  // Rate a completed ride
  rateRide: (rideId, data) => api.post(`/rides/${rideId}/rate`, data),

  // Get ride history for current user
  getRideHistory: (params) => api.get('/rides/history', { params }),

  // Search locations (geocoding)
  searchLocations: (query) => api.get('/rides/search-location', { params: { query } }),

  // Get nearby drivers
  getNearbyDrivers: (coords) => api.get('/rides/nearby-drivers', { params: coords }),

  // Apply promo code
  applyPromo: (data) => api.post('/rides/apply-promo', data),

  // Verify ride OTP
  verifyRideOTP: (rideId, otp) => api.post(`/rides/${rideId}/verify-otp`, { otp }),

  // Get all rides (admin)
  getAllRides: (params) => api.get('/rides', { params }),
};

export default rideService;
