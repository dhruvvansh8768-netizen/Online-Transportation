// ============================================
// models/user.model.js — User SQL Queries
// ============================================
// All database operations related to users:
// create, find, update, delete, saved addresses,
// and notification management.
// ============================================

const { query } = require('../config/db');

const UserModel = {
  // ---- USER CRUD ----

  /**
   * Create a new user.
   * @param {object} userData - { full_name, email, phone, password_hash, role }
   * @returns {object} The created user row
   */
  create: async ({ full_name, email, phone, password_hash, role = 'rider' }) => {
    const sql = `
      INSERT INTO users (full_name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, full_name, email, phone, role, created_at, is_active
    `;
    const result = await query(sql, [full_name, email, phone, password_hash, role]);
    return result.rows[0];
  },

  /**
   * Find a user by their email address.
   * @param {string} email
   * @returns {object|null} The user row or null
   */
  findByEmail: async (email) => {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  },

  /**
   * Find a user by their phone number.
   * @param {string} phone
   * @returns {object|null}
   */
  findByPhone: async (phone) => {
    const sql = `SELECT * FROM users WHERE phone = $1`;
    const result = await query(sql, [phone]);
    return result.rows[0] || null;
  },

  /**
   * Find a user by their ID.
   * @param {number} userId
   * @returns {object|null}
   */
  findById: async (userId) => {
    const sql = `
      SELECT user_id, full_name, email, phone, role, created_at, is_active
      FROM users
      WHERE user_id = $1
    `;
    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  },

  /**
   * Update a user's profile fields.
   * @param {number} userId
   * @param {object} fields - { full_name, phone }
   * @returns {object} The updated user row
   */
  updateProfile: async (userId, { full_name, phone }) => {
    const sql = `
      UPDATE users
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone)
      WHERE user_id = $3
      RETURNING user_id, full_name, email, phone, role, created_at, is_active
    `;
    const result = await query(sql, [full_name, phone, userId]);
    return result.rows[0];
  },

  /**
   * Update a user's password hash.
   * @param {number} userId
   * @param {string} password_hash
   * @returns {object}
   */
  updatePassword: async (userId, password_hash) => {
    const sql = `
      UPDATE users SET password_hash = $1 WHERE user_id = $2
      RETURNING user_id
    `;
    const result = await query(sql, [password_hash, userId]);
    return result.rows[0];
  },

  /**
   * Toggle active status of a user (admin action).
   * @param {number} userId
   * @param {boolean} isActive
   * @returns {object}
   */
  toggleActive: async (userId, isActive) => {
    const sql = `
      UPDATE users SET is_active = $1 WHERE user_id = $2
      RETURNING user_id, full_name, email, is_active
    `;
    const result = await query(sql, [isActive, userId]);
    return result.rows[0];
  },

  /**
   * Get all users with optional filters (admin).
   * @param {object} filters - { role, is_active, limit, offset }
   * @returns {Array}
   */
  findAll: async ({ role, is_active, limit = 50, offset = 0 }) => {
    let sql = `
      SELECT user_id, full_name, email, phone, role, created_at, is_active
      FROM users WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (role) {
      sql += ` AND role = $${paramIndex++}`;
      params.push(role);
    }
    if (is_active !== undefined && is_active !== null) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(is_active);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Count total users with optional filters.
   * @param {object} filters - { role, is_active }
   * @returns {number}
   */
  countAll: async ({ role, is_active }) => {
    let sql = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (role) {
      sql += ` AND role = $${paramIndex++}`;
      params.push(role);
    }
    if (is_active !== undefined && is_active !== null) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(is_active);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].total, 10);
  },

  // ---- SAVED ADDRESSES ----

  /**
   * Add a saved address for a user.
   * @param {number} userId
   * @param {object} address - { label, address, lat, lng }
   * @returns {object}
   */
  addSavedAddress: async (userId, { label, address, lat, lng }) => {
    const sql = `
      INSERT INTO saved_addresses (user_id, label, address, lat, lng)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [userId, label, address, lat, lng]);
    return result.rows[0];
  },

  /**
   * Get all saved addresses for a user.
   * @param {number} userId
   * @returns {Array}
   */
  getSavedAddresses: async (userId) => {
    const sql = `SELECT * FROM saved_addresses WHERE user_id = $1 ORDER BY label`;
    const result = await query(sql, [userId]);
    return result.rows;
  },

  /**
   * Delete a saved address.
   * @param {number} addressId
   * @param {number} userId - Ensures ownership
   * @returns {object|null}
   */
  deleteSavedAddress: async (addressId, userId) => {
    const sql = `
      DELETE FROM saved_addresses
      WHERE address_id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await query(sql, [addressId, userId]);
    return result.rows[0] || null;
  },

  /**
   * Update a saved address.
   * @param {number} addressId
   * @param {number} userId
   * @param {object} fields - { label, address, lat, lng }
   * @returns {object}
   */
  updateSavedAddress: async (addressId, userId, { label, address, lat, lng }) => {
    const sql = `
      UPDATE saved_addresses
      SET label = COALESCE($1, label),
          address = COALESCE($2, address),
          lat = COALESCE($3, lat),
          lng = COALESCE($4, lng)
      WHERE address_id = $5 AND user_id = $6
      RETURNING *
    `;
    const result = await query(sql, [label, address, lat, lng, addressId, userId]);
    return result.rows[0];
  },

  // ---- NOTIFICATIONS ----

  /**
   * Create a notification for a user.
   * @param {number} userId
   * @param {string} title
   * @param {string} message
   * @returns {object}
   */
  createNotification: async (userId, title, message) => {
    const sql = `
      INSERT INTO notifications (user_id, title, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await query(sql, [userId, title, message]);
    return result.rows[0];
  },

  /**
   * Get all notifications for a user.
   * @param {number} userId
   * @param {number} limit
   * @param {number} offset
   * @returns {Array}
   */
  getNotifications: async (userId, limit = 20, offset = 0) => {
    const sql = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [userId, limit, offset]);
    return result.rows;
  },

  /**
   * Mark a notification as read.
   * @param {number} notificationId
   * @param {number} userId
   * @returns {object}
   */
  markNotificationRead: async (notificationId, userId) => {
    const sql = `
      UPDATE notifications
      SET is_read = true
      WHERE notification_id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await query(sql, [notificationId, userId]);
    return result.rows[0];
  },

  /**
   * Mark all notifications as read for a user.
   * @param {number} userId
   * @returns {number} Number of updated rows
   */
  markAllNotificationsRead: async (userId) => {
    const sql = `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
    `;
    const result = await query(sql, [userId]);
    return result.rowCount;
  },

  /**
   * Get count of unread notifications.
   * @param {number} userId
   * @returns {number}
   */
  getUnreadNotificationCount: async (userId) => {
    const sql = `
      SELECT COUNT(*) as unread
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;
    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].unread, 10);
  }
};

module.exports = UserModel;
