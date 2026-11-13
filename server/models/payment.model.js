// ============================================
// models/payment.model.js — Payment SQL Queries
// ============================================
// All database operations related to payments:
// create, update status, find by various
// criteria, and payment history.
// ============================================

const { query } = require('../config/db');

const PaymentModel = {
  /**
   * Create a new payment record.
   * @param {object} paymentData
   * @returns {object}
   */
  create: async ({ ride_id, user_id, amount, payment_method, transaction_id }) => {
    const sql = `
      INSERT INTO payments (ride_id, user_id, amount, payment_method, transaction_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [ride_id, user_id, amount, payment_method, transaction_id]);
    return result.rows[0];
  },

  /**
   * Find a payment by its ID.
   * @param {number} paymentId
   * @returns {object|null}
   */
  findById: async (paymentId) => {
    const sql = `
      SELECT p.*, r.pickup_address, r.drop_address, r.status AS ride_status,
             u.full_name, u.email
      FROM payments p
      JOIN rides r ON p.ride_id = r.ride_id
      JOIN users u ON p.user_id = u.user_id
      WHERE p.payment_id = $1
    `;
    const result = await query(sql, [paymentId]);
    return result.rows[0] || null;
  },

  /**
   * Find a payment by ride_id.
   * @param {number} rideId
   * @returns {object|null}
   */
  findByRideId: async (rideId) => {
    const sql = `SELECT * FROM payments WHERE ride_id = $1`;
    const result = await query(sql, [rideId]);
    return result.rows[0] || null;
  },

  /**
   * Update payment status.
   * @param {number} paymentId
   * @param {string} status - 'pending', 'completed', 'failed', 'refunded'
   * @returns {object}
   */
  updateStatus: async (paymentId, status) => {
    const sql = `
      UPDATE payments
      SET payment_status = $1
      WHERE payment_id = $2
      RETURNING *
    `;
    const result = await query(sql, [status, paymentId]);
    return result.rows[0];
  },

  /**
   * Update payment status by ride_id.
   * @param {number} rideId
   * @param {string} status
   * @returns {object}
   */
  updateStatusByRideId: async (rideId, status) => {
    const sql = `
      UPDATE payments
      SET payment_status = $1
      WHERE ride_id = $2
      RETURNING *
    `;
    const result = await query(sql, [status, rideId]);
    return result.rows[0];
  },

  /**
   * Get payment history for a user.
   * @param {number} userId
   * @param {number} limit
   * @param {number} offset
   * @returns {Array}
   */
  getHistoryByUser: async (userId, limit = 20, offset = 0) => {
    const sql = `
      SELECT p.*, r.pickup_address, r.drop_address, r.status AS ride_status,
             r.distance_km, r.duration_min
      FROM payments p
      JOIN rides r ON p.ride_id = r.ride_id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [userId, limit, offset]);
    return result.rows;
  },

  /**
   * Get all payments (admin).
   * @param {object} filters - { payment_status, payment_method, limit, offset }
   * @returns {Array}
   */
  findAll: async ({ payment_status, payment_method, limit = 50, offset = 0 }) => {
    let sql = `
      SELECT p.*, u.full_name, u.email,
             r.pickup_address, r.drop_address
      FROM payments p
      JOIN users u ON p.user_id = u.user_id
      JOIN rides r ON p.ride_id = r.ride_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (payment_status) {
      sql += ` AND p.payment_status = $${paramIndex++}`;
      params.push(payment_status);
    }
    if (payment_method) {
      sql += ` AND p.payment_method = $${paramIndex++}`;
      params.push(payment_method);
    }

    sql += ` ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Get revenue summary (admin dashboard).
   * @returns {object} - { total_revenue, total_payments, avg_payment }
   */
  getRevenueSummary: async () => {
    const sql = `
      SELECT
        COALESCE(SUM(amount), 0) AS total_revenue,
        COUNT(payment_id) AS total_payments,
        COALESCE(ROUND(AVG(amount), 2), 0) AS avg_payment
      FROM payments
      WHERE payment_status = 'completed'
    `;
    const result = await query(sql, []);
    return result.rows[0];
  },

  /**
   * Get daily revenue for a date range (admin).
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Array}
   */
  getDailyRevenue: async (startDate, endDate) => {
    const sql = `
      SELECT
        DATE(created_at) AS date,
        SUM(amount) AS revenue,
        COUNT(payment_id) AS transactions
      FROM payments
      WHERE payment_status = 'completed'
        AND created_at >= $1
        AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const result = await query(sql, [startDate, endDate]);
    return result.rows;
  }
};

module.exports = PaymentModel;
