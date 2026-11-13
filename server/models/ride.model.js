// ============================================
// models/ride.model.js — Ride SQL Queries
// ============================================
// All database operations related to rides:
// create, update status, find by various
// criteria, ride history, etc.
// ============================================

const { query } = require('../config/db');

const RideModel = {
  // ---- RIDE CRUD ----

  /**
   * Create a new ride request.
   * @param {object} rideData
   * @returns {object} The created ride row
   */
  create: async ({
    rider_id, pickup_lat, pickup_lng, pickup_address,
    drop_lat, drop_lng, drop_address, fare, distance_km, duration_min, otp
  }) => {
    const sql = `
      INSERT INTO rides (
        rider_id, pickup_lat, pickup_lng, pickup_address,
        drop_lat, drop_lng, drop_address, fare, distance_km, duration_min, otp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const result = await query(sql, [
      rider_id, pickup_lat, pickup_lng, pickup_address,
      drop_lat, drop_lng, drop_address, fare, distance_km, duration_min, otp
    ]);
    return result.rows[0];
  },

  /**
   * Find a ride by its ID.
   * @param {number} rideId
   * @returns {object|null}
   */
  findById: async (rideId) => {
    const sql = `
      SELECT r.*,
             rider.full_name AS rider_name, rider.phone AS rider_phone,
             driver_user.full_name AS driver_name, driver_user.phone AS driver_phone,
             d.current_lat AS driver_lat, d.current_lng AS driver_lng, d.rating AS driver_rating,
             v.vehicle_type, v.model AS vehicle_model, v.registration_number, v.color AS vehicle_color
      FROM rides r
      JOIN users rider ON r.rider_id = rider.user_id
      LEFT JOIN drivers d ON r.driver_id = d.driver_id
      LEFT JOIN users driver_user ON d.user_id = driver_user.user_id
      LEFT JOIN vehicles v ON v.driver_id = d.driver_id
      WHERE r.ride_id = $1
    `;
    const result = await query(sql, [rideId]);
    return result.rows[0] || null;
  },

  /**
   * Assign a driver to a ride.
   * @param {number} rideId
   * @param {number} driverId
   * @returns {object}
   */
  assignDriver: async (rideId, driverId) => {
    const sql = `
      UPDATE rides
      SET driver_id = $1, status = 'accepted'
      WHERE ride_id = $2 AND status = 'requested'
      RETURNING *
    `;
    const result = await query(sql, [driverId, rideId]);
    return result.rows[0];
  },

  /**
   * Update ride status.
   * @param {number} rideId
   * @param {string} status - One of: 'requested', 'accepted', 'arriving', 'in_progress', 'completed', 'cancelled'
   * @returns {object}
   */
  updateStatus: async (rideId, status) => {
    let extraFields = '';
    if (status === 'in_progress') {
      extraFields = ', started_at = NOW()';
    } else if (status === 'completed') {
      extraFields = ', completed_at = NOW()';
    }

    const sql = `
      UPDATE rides
      SET status = $1 ${extraFields}
      WHERE ride_id = $2
      RETURNING *
    `;
    const result = await query(sql, [status, rideId]);
    return result.rows[0];
  },

  /**
   * Cancel a ride.
   * @param {number} rideId
   * @param {number} userId - The user requesting cancellation (rider or driver's user_id)
   * @returns {object}
   */
  cancel: async (rideId, userId) => {
    const sql = `
      UPDATE rides
      SET status = 'cancelled'
      WHERE ride_id = $1
        AND (rider_id = $2 OR driver_id = (SELECT driver_id FROM drivers WHERE user_id = $2))
        AND status IN ('requested', 'accepted', 'arriving')
      RETURNING *
    `;
    const result = await query(sql, [rideId, userId]);
    return result.rows[0];
  },

  /**
   * Update fare for a ride (e.g., after promo code or recalculation).
   * @param {number} rideId
   * @param {number} fare
   * @returns {object}
   */
  updateFare: async (rideId, fare) => {
    const sql = `
      UPDATE rides SET fare = $1 WHERE ride_id = $2 RETURNING *
    `;
    const result = await query(sql, [fare, rideId]);
    return result.rows[0];
  },

  // ---- RIDE QUERIES ----

  /**
   * Get ride history for a rider.
   * @param {number} riderId
   * @param {number} limit
   * @param {number} offset
   * @returns {Array}
   */
  getRiderHistory: async (riderId, limit = 20, offset = 0) => {
    const sql = `
      SELECT r.*,
             driver_user.full_name AS driver_name,
             v.vehicle_type, v.model AS vehicle_model, v.registration_number
      FROM rides r
      LEFT JOIN drivers d ON r.driver_id = d.driver_id
      LEFT JOIN users driver_user ON d.user_id = driver_user.user_id
      LEFT JOIN vehicles v ON v.driver_id = d.driver_id
      WHERE r.rider_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [riderId, limit, offset]);
    return result.rows;
  },

  /**
   * Get ride history for a driver.
   * @param {number} driverId
   * @param {number} limit
   * @param {number} offset
   * @returns {Array}
   */
  getDriverHistory: async (driverId, limit = 20, offset = 0) => {
    const sql = `
      SELECT r.*,
             rider.full_name AS rider_name, rider.phone AS rider_phone
      FROM rides r
      JOIN users rider ON r.rider_id = rider.user_id
      WHERE r.driver_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [driverId, limit, offset]);
    return result.rows;
  },

  /**
   * Get the active ride for a rider (if any).
   * @param {number} riderId
   * @returns {object|null}
   */
  getActiveRideForRider: async (riderId) => {
    const sql = `
      SELECT r.*,
             driver_user.full_name AS driver_name, driver_user.phone AS driver_phone,
             d.current_lat AS driver_lat, d.current_lng AS driver_lng, d.rating AS driver_rating,
             v.vehicle_type, v.model AS vehicle_model, v.registration_number, v.color AS vehicle_color
      FROM rides r
      LEFT JOIN drivers d ON r.driver_id = d.driver_id
      LEFT JOIN users driver_user ON d.user_id = driver_user.user_id
      LEFT JOIN vehicles v ON v.driver_id = d.driver_id
      WHERE r.rider_id = $1
        AND r.status IN ('requested', 'accepted', 'arriving', 'in_progress')
      ORDER BY r.created_at DESC
      LIMIT 1
    `;
    const result = await query(sql, [riderId]);
    return result.rows[0] || null;
  },

  /**
   * Get the active ride for a driver (if any).
   * @param {number} driverId
   * @returns {object|null}
   */
  getActiveRideForDriver: async (driverId) => {
    const sql = `
      SELECT r.*,
             rider.full_name AS rider_name, rider.phone AS rider_phone
      FROM rides r
      JOIN users rider ON r.rider_id = rider.user_id
      WHERE r.driver_id = $1
        AND r.status IN ('accepted', 'arriving', 'in_progress')
      ORDER BY r.created_at DESC
      LIMIT 1
    `;
    const result = await query(sql, [driverId]);
    return result.rows[0] || null;
  },

  /**
   * Get all pending ride requests (not yet accepted by any driver).
   * @param {number} limit
   * @returns {Array}
   */
  getPendingRides: async (limit = 20) => {
    const sql = `
      SELECT r.*,
             rider.full_name AS rider_name, rider.phone AS rider_phone
      FROM rides r
      JOIN users rider ON r.rider_id = rider.user_id
      WHERE r.status = 'requested'
      ORDER BY r.created_at ASC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  },

  /**
   * Get all rides with optional filters (admin).
   * @param {object} filters - { status, limit, offset }
   * @returns {Array}
   */
  findAll: async ({ status, limit = 50, offset = 0 }) => {
    let sql = `
      SELECT r.*,
             rider.full_name AS rider_name,
             driver_user.full_name AS driver_name
      FROM rides r
      JOIN users rider ON r.rider_id = rider.user_id
      LEFT JOIN drivers d ON r.driver_id = d.driver_id
      LEFT JOIN users driver_user ON d.user_id = driver_user.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND r.status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY r.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Count rides by status (admin dashboard).
   * @returns {Array} - Array of { status, count } objects
   */
  countByStatus: async () => {
    const sql = `
      SELECT status, COUNT(*) AS count
      FROM rides
      GROUP BY status
      ORDER BY status
    `;
    const result = await query(sql, []);
    return result.rows;
  },

  /**
   * Verify OTP for starting a ride.
   * @param {number} rideId
   * @param {string} otp
   * @returns {object|null}
   */
  verifyOTP: async (rideId, otp) => {
    const sql = `
      SELECT * FROM rides
      WHERE ride_id = $1 AND otp = $2 AND status = 'accepted'
    `;
    const result = await query(sql, [rideId, otp]);
    return result.rows[0] || null;
  }
};

module.exports = RideModel;
