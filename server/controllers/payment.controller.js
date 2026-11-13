// ============================================
// controllers/payment.controller.js — Payments
// ============================================

const { v4: uuidv4 } = require('uuid');
const PaymentModel = require('../models/payment.model');
const RideModel = require('../models/ride.model');

const PaymentController = {
  /**
   * POST /api/payments/initiate
   */
  initiatePayment: async (req, res) => {
    try {
      const { ride_id, amount, payment_method = 'upi' } = req.body;
      if (!ride_id || !amount) {
        return res.status(400).json({
          success: false,
          message: 'ride_id and amount are required.'
        });
      }

      const transaction_id = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;
      const payment = await PaymentModel.create({
        ride_id,
        user_id: req.user.userId,
        amount,
        payment_method,
        transaction_id
      });

      return res.status(201).json({
        success: true,
        message: 'Payment initiated successfully.',
        data: { payment }
      });
    } catch (error) {
      console.error('[PaymentController.initiatePayment] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * POST /api/payments/verify | /api/payments/process
   */
  verifyPayment: async (req, res) => {
    try {
      const { payment_id, ride_id, status = 'completed', amount, payment_method = 'upi' } = req.body;

      let payment;
      if (payment_id) {
        payment = await PaymentModel.updateStatus(payment_id, status);
      } else if (ride_id) {
        const existing = await PaymentModel.findByRideId(ride_id);
        if (existing) {
          payment = await PaymentModel.updateStatusByRideId(ride_id, status);
        } else {
          const ride = await RideModel.findById(ride_id);
          const txn = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;
          const created = await PaymentModel.create({
            ride_id,
            user_id: req.user.userId,
            amount: amount || ride?.fare || 0,
            payment_method,
            transaction_id: txn
          });
          payment = await PaymentModel.updateStatus(created.payment_id, status);
        }
      } else {
        return res.status(400).json({ success: false, message: 'payment_id or ride_id is required.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment processed successfully.',
        data: { payment }
      });
    } catch (error) {
      console.error('[PaymentController.verifyPayment] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * GET /api/payments/history
   */
  getHistory: async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const payments = await PaymentModel.getHistoryByUser(req.user.userId, Number(limit), Number(offset));
      return res.status(200).json({
        success: true,
        data: { payments }
      });
    } catch (error) {
      console.error('[PaymentController.getHistory] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * GET /api/payments/:id
   */
  getPaymentById: async (req, res) => {
    try {
      const payment = await PaymentModel.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment not found.' });
      }
      return res.status(200).json({ success: true, data: { payment } });
    } catch (error) {
      console.error('[PaymentController.getPaymentById] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * GET /api/payments/methods
   */
  getPaymentMethods: async (req, res) => {
    return res.status(200).json({
      success: true,
      data: {
        methods: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Google Pay', 'PhonePe', 'Paytm', 'Net Banking', 'Wallet']
      }
    });
  }
};

module.exports = PaymentController;

