// ============================================
// models/admin.model.js — Admin SQL Queries
// ============================================
// Aggregation queries for the admin dashboard,
// promo code management, and system-wide stats.
// ============================================

const { query } = require('../config/db');

const AdminModel = {
  // ---- DASHBOARD STATS ----

  /**
   * Get overall system statistics for the admin dashboard.
   * @returns {object}
   */
  getDashboardStats: async () => {
    const statsSQL = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'rider') AS total_riders,
        (SELECT COUNT(*) FROM users WHERE role = 'driver') AS total_drivers,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
        (SELECT COUNT(*) FROM rides) AS total_rides,
        (SELECT COUNT(*) FROM rides WHERE status = 'completed') AS completed_rides,
        (SELECT COUNT(*) FROM rides WHERE status = 'cancelled') AS cancelled_rides,
        (SELECT COUNT(*) FROM rides WHERE status = 'requested') AS pending_rides,
        (SELECT COUNT(*) FROM rides WHERE status IN ('accepted', 'arriving', 'in_progress')) AS active_rides,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'completed') AS total_revenue,
        (SELECT COUNT(*) FROM drivers WHERE is_available = true) AS available_drivers,
        (SELECT COALESCE(ROUND(AVG(fare), 2), 0) FROM rides WHERE status = 'completed') AS avg_fare,
        (SELECT COALESCE(ROUND(AVG(distance_km), 2), 0) FROM rides WHERE status = 'completed') AS avg_distance
    `;
    const result = await query(statsSQL, []);
    return result.rows[0];
  },

  /**
   * Get rides created per day for the last N days.
   * @param {number} days - Number of days to look back (default 30)
   * @returns {Array}
   */
  getRidesPerDay: async (days = 30) => {
    const sql = `
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled
      FROM rides
      WHERE created_at >= NOW() - INTERVAL '1 day' * $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const result = await query(sql, [days]);
    return result.rows;
  },

  /**
   * Get revenue per day for the last N days.
   * @param {number} days
   * @returns {Array}
   */
  getRevenuePerDay: async (days = 30) => {
    const sql = `
      SELECT
        DATE(created_at) AS date,
        SUM(amount) AS revenue,
        COUNT(*) AS transactions
      FROM payments
      WHERE payment_status = 'completed'
        AND created_at >= NOW() - INTERVAL '1 day' * $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const result = await query(sql, [days]);
    return result.rows;
  },

  /**
   * Get new user registrations per day.
   * @param {number} days
   * @returns {Array}
   */
  getRegistrationsPerDay: async (days = 30) => {
    const sql = `
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE role = 'rider') AS riders,
        COUNT(*) FILTER (WHERE role = 'driver') AS drivers
      FROM users
      WHERE created_at >= NOW() - INTERVAL '1 day' * $1
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const result = await query(sql, [days]);
    return result.rows;
  },

  /**
   * Get top-rated drivers.
   * @param {number} limit
   * @returns {Array}
   */
  getTopDrivers: async (limit = 10) => {
    const sql = `
      SELECT d.driver_id, d.rating, d.is_available,
             u.full_name, u.email, u.phone,
             COUNT(r.ride_id) AS total_rides,
             COALESCE(SUM(r.fare), 0) AS total_earnings
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      LEFT JOIN rides r ON r.driver_id = d.driver_id AND r.status = 'completed'
      GROUP BY d.driver_id, u.full_name, u.email, u.phone
      ORDER BY d.rating DESC, total_rides DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  },

  // ---- PROMO CODE MANAGEMENT ----

  /**
   * Create a new promo code.
   * @param {object} promoData
   * @returns {object}
   */
  createPromoCode: async ({ code, discount_percent, max_discount, valid_from, valid_to }) => {
    const sql = `
      INSERT INTO promo_codes (code, discount_percent, max_discount, valid_from, valid_to)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [code, discount_percent, max_discount, valid_from, valid_to]);
    return result.rows[0];
  },

  /**
   * Get all promo codes.
   * @returns {Array}
   */
  getAllPromoCodes: async () => {
    const sql = `SELECT * FROM promo_codes ORDER BY created_at DESC`;
    const result = await query(sql, []);
    return result.rows;
  },

  /**
   * Find a promo code by code string.
   * @param {string} code
   * @returns {object|null}
   */
  findPromoByCode: async (code) => {
    const sql = `
      SELECT * FROM promo_codes
      WHERE code = $1 AND is_active = true
        AND valid_from <= NOW() AND valid_to >= NOW()
    `;
    const result = await query(sql, [code]);
    return result.rows[0] || null;
  },

  /**
   * Toggle promo code active status.
   * @param {number} promoId
   * @param {boolean} isActive
   * @returns {object}
   */
  togglePromoCode: async (promoId, isActive) => {
    const sql = `
      UPDATE promo_codes SET is_active = $1 WHERE promo_id = $2 RETURNING *
    `;
    const result = await query(sql, [isActive, promoId]);
    return result.rows[0];
  },

  /**
   * Delete a promo code.
   * @param {number} promoId
   * @returns {object|null}
   */
  deletePromoCode: async (promoId) => {
    const sql = `DELETE FROM promo_codes WHERE promo_id = $1 RETURNING *`;
    const result = await query(sql, [promoId]);
    return result.rows[0] || null;
  },

  /**
   * Validate and apply a promo code to a fare.
   * @param {string} code
   * @param {number} originalFare
   * @returns {object} - { valid, discount, final_fare, promo }
   */
  applyPromoCode: async (code, originalFare) => {
    const promo = await AdminModel.findPromoByCode(code);
    if (!promo) {
      return { valid: false, discount: 0, final_fare: originalFare, promo: null };
    }

    let discount = (originalFare * promo.discount_percent) / 100;
    if (promo.max_discount && discount > parseFloat(promo.max_discount)) {
      discount = parseFloat(promo.max_discount);
    }

    const final_fare = Math.max(originalFare - discount, 0);

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100,
      final_fare: Math.round(final_fare * 100) / 100,
      promo
    };
  }
};

module.exports = AdminModel;
