import api from './api';

/**
 * Admin service — handles all admin-related API calls
 */
const adminService = {
  // Dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard'),

  // User management
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  toggleUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),

  // Ride management
  getRides: (params) => api.get('/admin/rides', { params }),
  getRideById: (rideId) => api.get(`/admin/rides/${rideId}`),

  // Vehicle management
  getVehicles: (params) => api.get('/admin/vehicles', { params }),
  approveVehicle: (vehicleId) => api.put(`/admin/vehicles/${vehicleId}/approve`),
  rejectVehicle: (vehicleId) => api.put(`/admin/vehicles/${vehicleId}/reject`),

  // Payment management
  getTransactions: (params) => api.get('/admin/transactions', { params }),

  // Promo codes
  getPromos: (params) => api.get('/admin/promos', { params }),
  createPromo: (data) => api.post('/admin/promos', data),
  updatePromo: (promoId, data) => api.put(`/admin/promos/${promoId}`, data),
  deletePromo: (promoId) => api.delete(`/admin/promos/${promoId}`),

  // Reports & analytics
  getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  getRideReport: (params) => api.get('/admin/reports/rides', { params }),
  getUserReport: (params) => api.get('/admin/reports/users', { params }),
  getDriverReport: (params) => api.get('/admin/reports/drivers', { params }),
};

export default adminService;
