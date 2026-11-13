import api from './api';

/**
 * Driver service — handles all driver-related API calls
 */
const driverService = {
  // Toggle driver online/offline status
  toggleStatus: (status) => api.put('/drivers/status', { status }),

  // Get current driver status
  getStatus: () => api.get('/drivers/status'),

  // Update driver location
  updateLocation: (coords) => api.put('/drivers/location', coords),

  // Accept a ride request
  acceptRide: (rideId) => api.post(`/drivers/rides/${rideId}/accept`),

  // Reject a ride request
  rejectRide: (rideId) => api.post(`/drivers/rides/${rideId}/reject`),

  // Start a ride (after OTP verification)
  startRide: (rideId, otp) => api.post(`/drivers/rides/${rideId}/start`, { otp }),

  // Complete / end a ride
  completeRide: (rideId) => api.post(`/drivers/rides/${rideId}/complete`),

  // Get driver earnings summary
  getEarnings: (params) => api.get('/drivers/earnings', { params }),
  getDailyEarnings: (params) => api.get('/drivers/earnings/daily', { params }),

  // Get driver trip history
  getTripHistory: (params) => api.get('/drivers/trips', { params }),

  // Get driver profile / vehicle info
  getProfile: () => api.get('/drivers/profile'),

  // Update driver profile
  updateProfile: (data) => api.put('/drivers/profile', data),

  // Update vehicle information
  updateVehicle: (data) => api.put('/drivers/vehicle', data),

  // Get active ride for driver
  getActiveRide: () => api.get('/drivers/active-ride'),

  // Rate a rider
  rateRider: (rideId, data) => api.post(`/drivers/rides/${rideId}/rate-rider`, data),
};

export default driverService;
