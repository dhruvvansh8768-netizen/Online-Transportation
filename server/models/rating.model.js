// ============================================
// models/rating.model.js — Rating SQL Queries
// ============================================
// All database operations related to ratings
// and reviews for rides.
// ============================================

const { query } = require('../config/db');

const RatingModel = {
  /**
   * Submit a rating for a completed ride.
   * @param {object} ratingData - { ride_id, rated_by, rated_to, rating, review }
   * @returns {object}
   */
  create: async ({ ride_id, rated_by, rated_to, rating, review }) => {
    const sql = `
      INSERT INTO ratings (ride_id, rated_by, rated_to, rating, review)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [ride_id, rated_by, rated_to, rating, review]);
    return result.rows[0];
  },

  /**
   * Check if a user has already rated a specific ride.
   * @param {number} rideId
   * @param {number} ratedBy
   * @returns {object|null}
   */
  findByRideAndUser: async (rideId, ratedBy) => {
    const sql = `
      SELECT * FROM ratings
      WHERE ride_id = $1 AND rated_by = $2
    `;
    const result = await query(sql, [rideId, ratedBy]);
    return result.rows[0] || null;
  },

  /**
   * Get all ratings received by a user.
   * @param {number} userId - The user who was rated
   * @param {number} limit
   * @param {number} offset
   * @returns {Array}
   */
  getReceivedRatings: async (userId, limit = 20, offset = 0) => {
    const sql = `
      SELECT rat.*, u.full_name AS rated_by_name,
             r.pickup_address, r.drop_address, r.completed_at
      FROM ratings rat
      JOIN users u ON rat.rated_by = u.user_id
      JOIN rides r ON rat.ride_id = r.ride_id
      WHERE rat.rated_to = $1
      ORDER BY rat.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [userId, limit, offset]);
    return result.rows;
  },

  /**
   * Get all ratings given by a user.
   * @param {number} userId - The user who gave the rating
   * @param {number} limit
   * @param {number} offset
   * @returns {Array}
   */
  getGivenRatings: async (userId, limit = 20, offset = 0) => {
    const sql = `
      SELECT rat.*, u.full_name AS rated_to_name,
             r.pickup_address, r.drop_address, r.completed_at
      FROM ratings rat
      JOIN users u ON rat.rated_to = u.user_id
      JOIN rides r ON rat.ride_id = r.ride_id
      WHERE rat.rated_by = $1
      ORDER BY rat.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [userId, limit, offset]);
    return result.rows;
  },

  /**
   * Get average rating for a user.
   * @param {number} userId
   * @returns {object} - { avg_rating, total_ratings }
   */
  getAverageRating: async (userId) => {
    const sql = `
      SELECT
        COALESCE(ROUND(AVG(rating), 2), 0) AS avg_rating,
        COUNT(rating_id) AS total_ratings
      FROM ratings
      WHERE rated_to = $1
    `;
    const result = await query(sql, [userId]);
    return result.rows[0];
  },

  /**
   * Get ratings for a specific ride.
   * @param {number} rideId
   * @returns {Array}
   */
  getRideRatings: async (rideId) => {
    const sql = `
      SELECT rat.*, 
             by_user.full_name AS rated_by_name,
             to_user.full_name AS rated_to_name
      FROM ratings rat
      JOIN users by_user ON rat.rated_by = by_user.user_id
      JOIN users to_user ON rat.rated_to = to_user.user_id
      WHERE rat.ride_id = $1
    `;
    const result = await query(sql, [rideId]);
    return result.rows;
  },

  /**
   * Get all ratings (admin).
   * @param {number} limit
   * @param {number} offset
   * @returns {Array}
   */
  findAll: async (limit = 50, offset = 0) => {
    const sql = `
      SELECT rat.*,
             by_user.full_name AS rated_by_name,
             to_user.full_name AS rated_to_name
      FROM ratings rat
      JOIN users by_user ON rat.rated_by = by_user.user_id
      JOIN users to_user ON rat.rated_to = to_user.user_id
      ORDER BY rat.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await query(sql, [limit, offset]);
    return result.rows;
  }
};

module.exports = RatingModel;
