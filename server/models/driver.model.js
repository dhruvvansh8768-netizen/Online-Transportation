// ============================================
// models/driver.model.js — Driver SQL Queries
// ============================================
// All database operations related to drivers:
// create driver profile, update availability,
// location tracking, vehicle management, etc.
// ============================================

const { query } = require('../config/db');

const DriverModel = {
  // ---- DRIVER PROFILE ----

  /**
   * Create a new driver profile linked to a user.
   * @param {object} data - { user_id, license_number }
   * @returns {object} The created driver row
   */
  create: async ({ user_id, license_number }) => {
    const sql = `
      INSERT INTO drivers (user_id, license_number)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await query(sql, [user_id, license_number]);
    return result.rows[0];
  },

  /**
   * Find a driver profile by user_id.
   * @param {number} userId
   * @returns {object|null}
   */
  findByUserId: async (userId) => {
    const sql = `
      SELECT d.*, u.full_name, u.email, u.phone, u.is_active
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      WHERE d.user_id = $1
    `;
    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  },

  /**
   * Find a driver profile by driver_id.
   * @param {number} driverId
   * @returns {object|null}
   */
  findById: async (driverId) => {
    const sql = `
      SELECT d.*, u.full_name, u.email, u.phone, u.is_active
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      WHERE d.driver_id = $1
    `;
    const result = await query(sql, [driverId]);
    return result.rows[0] || null;
  },

  /**
   * Update driver profile details.
   * @param {number} driverId
   * @param {object} fields - { license_number }
   * @returns {object}
   */
  updateProfile: async (driverId, { license_number }) => {
    const sql = `
      UPDATE drivers
      SET license_number = COALESCE($1, license_number)
      WHERE driver_id = $2
      RETURNING *
    `;
    const result = await query(sql, [license_number, driverId]);
    return result.rows[0];
  },

  // ---- AVAILABILITY & LOCATION ----

  /**
   * Toggle driver availability status.
   * @param {number} driverId
   * @param {boolean} isAvailable
   * @returns {object}
   */
  toggleAvailability: async (driverId, isAvailable) => {
    const sql = `
      UPDATE drivers
      SET is_available = $1
      WHERE driver_id = $2
      RETURNING driver_id, is_available
    `;
    const result = await query(sql, [isAvailable, driverId]);
    return result.rows[0];
  },

  /**
   * Update driver's current GPS location.
   * @param {number} driverId
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {object}
   */
  updateLocation: async (driverId, lat, lng) => {
    const sql = `
      UPDATE drivers
      SET current_lat = $1, current_lng = $2
      WHERE driver_id = $3
      RETURNING driver_id, current_lat, current_lng
    `;
    const result = await query(sql, [lat, lng, driverId]);
    return result.rows[0];
  },

  /**
   * Find nearby available drivers using Euclidean distance approximation.
   * For production, use PostGIS with ST_DWithin for accurate geographic distance.
   * @param {number} lat - Pickup latitude
   * @param {number} lng - Pickup longitude
   * @param {number} radiusKm - Search radius in km (default 5)
   * @param {number} limit - Max drivers to return
   * @returns {Array}
   */
  findNearby: async (lat, lng, radiusKm = 5, limit = 10) => {
    // Approximate degree-to-km conversion (1 degree ≈ 111 km)
    const radiusDeg = radiusKm / 111.0;
    const sql = `
      SELECT d.driver_id, d.user_id, d.current_lat, d.current_lng, d.rating,
             u.full_name, u.phone,
             v.vehicle_type, v.model, v.registration_number, v.color,
             SQRT(
               POWER(d.current_lat - $1, 2) + POWER(d.current_lng - $2, 2)
             ) * 111.0 AS distance_km
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      LEFT JOIN vehicles v ON v.driver_id = d.driver_id
      WHERE d.is_available = true
        AND u.is_active = true
        AND d.current_lat IS NOT NULL
        AND d.current_lng IS NOT NULL
        AND ABS(d.current_lat - $1) < $3
        AND ABS(d.current_lng - $2) < $3
      ORDER BY distance_km ASC
      LIMIT $4
    `;
    const result = await query(sql, [lat, lng, radiusDeg, limit]);
    return result.rows;
  },

  /**
   * Get all drivers with optional filters (admin).
   * @param {object} filters - { is_available, limit, offset }
   * @returns {Array}
   */
  findAll: async ({ is_available, limit = 50, offset = 0 }) => {
    let sql = `
      SELECT d.*, u.full_name, u.email, u.phone, u.is_active
      FROM drivers d
      JOIN users u ON d.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (is_available !== undefined && is_available !== null) {
      sql += ` AND d.is_available = $${paramIndex++}`;
      params.push(is_available);
    }

    sql += ` ORDER BY d.driver_id DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Update driver rating (calculated average).
   * @param {number} driverId
   * @returns {object}
   */
  recalculateRating: async (driverId) => {
    // Get the driver's user_id first
    const driverResult = await query(`SELECT user_id FROM drivers WHERE driver_id = $1`, [driverId]);
    if (!driverResult.rows[0]) return null;
    const userId = driverResult.rows[0].user_id;

    const sql = `
      UPDATE drivers
      SET rating = (
        SELECT COALESCE(ROUND(AVG(r.rating), 2), 0)
        FROM ratings r
        WHERE r.rated_to = $1
      )
      WHERE driver_id = $2
      RETURNING driver_id, rating
    `;
    const result = await query(sql, [userId, driverId]);
    return result.rows[0];
  },

  // ---- VEHICLE MANAGEMENT ----

  /**
   * Add a vehicle for a driver.
   * @param {object} data - { driver_id, vehicle_type, model, registration_number, color }
   * @returns {object}
   */
  addVehicle: async ({ driver_id, vehicle_type, model, registration_number, color }) => {
    const sql = `
      INSERT INTO vehicles (driver_id, vehicle_type, model, registration_number, color)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [driver_id, vehicle_type, model, registration_number, color]);
    return result.rows[0];
  },

  /**
   * Get vehicles for a specific driver.
   * @param {number} driverId
   * @returns {Array}
   */
  getVehicles: async (driverId) => {
    const sql = `SELECT * FROM vehicles WHERE driver_id = $1`;
    const result = await query(sql, [driverId]);
    return result.rows;
  },

  /**
   * Update a vehicle.
   * @param {number} vehicleId
   * @param {number} driverId - Ensures ownership
   * @param {object} fields - { vehicle_type, model, registration_number, color }
   * @returns {object}
   */
  updateVehicle: async (vehicleId, driverId, { vehicle_type, model, registration_number, color }) => {
    const sql = `
      UPDATE vehicles
      SET vehicle_type = COALESCE($1, vehicle_type),
          model = COALESCE($2, model),
          registration_number = COALESCE($3, registration_number),
          color = COALESCE($4, color)
      WHERE vehicle_id = $5 AND driver_id = $6
      RETURNING *
    `;
    const result = await query(sql, [vehicle_type, model, registration_number, color, vehicleId, driverId]);
    return result.rows[0];
  },

  /**
   * Delete a vehicle.
   * @param {number} vehicleId
   * @param {number} driverId
   * @returns {object|null}
   */
  deleteVehicle: async (vehicleId, driverId) => {
    const sql = `
      DELETE FROM vehicles
      WHERE vehicle_id = $1 AND driver_id = $2
      RETURNING *
    `;
    const result = await query(sql, [vehicleId, driverId]);
    return result.rows[0] || null;
  },

  // ---- EARNINGS ----

  /**
   * Get total earnings for a driver.
   * @param {number} driverId
   * @returns {object} - { total_earnings, total_rides, avg_fare }
   */
  getEarnings: async (driverId) => {
    const sql = `
      SELECT
        COALESCE(SUM(r.fare), 0) AS total_earnings,
        COUNT(r.ride_id) AS total_rides,
        COALESCE(ROUND(AVG(r.fare), 2), 0) AS avg_fare
      FROM rides r
      WHERE r.driver_id = $1
        AND r.status = 'completed'
    `;
    const result = await query(sql, [driverId]);
    return result.rows[0];
  },

  /**
   * Get earnings breakdown by date range.
   * @param {number} driverId
   * @param {string} startDate - ISO date string
   * @param {string} endDate - ISO date string
   * @returns {Array}
   */
  getEarningsByDateRange: async (driverId, startDate, endDate) => {
    const sql = `
      SELECT
        DATE(completed_at) AS date,
        COUNT(ride_id) AS rides,
        SUM(fare) AS earnings
      FROM rides
      WHERE driver_id = $1
        AND status = 'completed'
        AND completed_at >= $2
        AND completed_at <= $3
      GROUP BY DATE(completed_at)
      ORDER BY date DESC
    `;
    const result = await query(sql, [driverId, startDate, endDate]);
    return result.rows;
  }
};

module.exports = DriverModel;
