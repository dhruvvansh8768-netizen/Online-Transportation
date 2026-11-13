import api from './api';

/**
 * Payment service — handles all payment-related API calls
 */
const paymentService = {
  // Get payment methods for current user
  getPaymentMethods: () => api.get('/payments/methods'),

  // Add a new payment method
  addPaymentMethod: (data) => api.post('/payments/methods', data),

  // Remove a payment method
  removePaymentMethod: (methodId) => api.delete(`/payments/methods/${methodId}`),

  // Set default payment method
  setDefault: (methodId) => api.put(`/payments/methods/${methodId}/default`),

  // Get payment history
  getHistory: (params) => api.get('/payments/history', { params }),

  // Get a specific transaction
  getTransaction: (txnId) => api.get(`/payments/${txnId}`),

  // Process payment for a ride
  processPayment: (data) => api.post('/payments/process', data),

  // Get wallet balance
  getWalletBalance: () => api.get('/payments/wallet'),

  // Add money to wallet
  addToWallet: (data) => api.post('/payments/wallet/add', data),

  // Get all transactions (admin)
  getAllTransactions: (params) => api.get('/payments/all', { params }),
};

export default paymentService;
