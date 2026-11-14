// ============================================
// controllers/admin.controller.js — Admin Ops
// ============================================

const AdminModel = require('../models/admin.model');
const UserModel = require('../models/user.model');
const RideModel = require('../models/ride.model');
const PaymentModel = require('../models/payment.model');
const DriverModel = require('../models/driver.model');

const AdminController = {
  /**
   * GET /api/admin/dashboard
   */
  getDashboard: async (req, res) => {
    try {
      const stats = await AdminModel.getDashboardStats();
      const topDrivers = await AdminModel.getTopDrivers(5);
      const ridesPerDay = await AdminModel.getRidesPerDay(7);
      const revenuePerDay = await AdminModel.getRevenuePerDay(7);
      return res.status(200).json({
        success: true,
        data: { stats, topDrivers, ridesPerDay, revenuePerDay }
      });
    } catch (error) {
      console.error('[AdminController.getDashboard] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * GET /api/admin/users
   */
  getUsers: async (req, res) => {
    try {
      const { role, limit = 50, offset = 0 } = req.query;
      const users = await UserModel.findAll({ role, limit: Number(limit), offset: Number(offset) });
      return res.status(200).json({ success: true, data: { users } });
    } catch (error) {
      console.error('[AdminController.getUsers] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * PUT /api/admin/users/:id/status
   */
  toggleUserStatus: async (req, res) => {
    try {
      const { is_active, status } = req.body;
      const activeFlag = is_active !== undefined ? is_active : status === 'active';
      const updated = await UserModel.toggleActive(req.params.id, activeFlag);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      return res.status(200).json({ success: true, data: { user: updated } });
    } catch (error) {
      console.error('[AdminController.toggleUserStatus] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * GET /api/admin/rides
   */
  getRides: async (req, res) => {
    try {
      const { status, limit = 50, offset = 0 } = req.query;
      const rides = await RideModel.findAll({ status, limit: Number(limit), offset: Number(offset) });
      return res.status(200).json({ success: true, data: { rides } });
    } catch (error) {
      console.error('[AdminController.getRides] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * GET /api/admin/vehicles
   */
  getVehicles: async (req, res) => {
    try {
      const drivers = await DriverModel.findAllDrivers();
      return res.status(200).json({ success: true, data: { drivers } });
    } catch (error) {
      console.error('[AdminController.getVehicles] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * GET /api/admin/transactions | /api/admin/revenue
   */
  getRevenue: async (req, res) => {
    try {
      const summary = await PaymentModel.getRevenueSummary();
      const transactions = await PaymentModel.findAll({ limit: 50, offset: 0 });
      return res.status(200).json({
        success: true,
        data: { summary, transactions }
      });
    } catch (error) {
      console.error('[AdminController.getRevenue] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * GET /api/admin/promos
   */
  getPromos: async (req, res) => {
    try {
      const promos = await AdminModel.getAllPromoCodes();
      return res.status(200).json({ success: true, data: { promos } });
    } catch (error) {
      console.error('[AdminController.getPromos] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * POST /api/admin/promos
   */
  createPromo: async (req, res) => {
    try {
      const { code, discount_percent, max_discount, valid_from, valid_to } = req.body;
      if (!code || !discount_percent) {
        return res.status(400).json({ success: false, message: 'code and discount_percent are required.' });
      }
      const promo = await AdminModel.createPromoCode({
        code: code.toUpperCase(),
        discount_percent,
        max_discount: max_discount || 100,
        valid_from: valid_from || new Date(),
        valid_to: valid_to || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      });
      return res.status(201).json({ success: true, data: { promo } });
    } catch (error) {
      console.error('[AdminController.createPromo] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * POST /api/admin/users
   * Admin direct creation of rider or driver with live SQL transparency
   */
  createUser: async (req, res) => {
    const startTime = Date.now();
    try {
      const { full_name, email, phone, role = 'rider', password = 'password123', license_number } = req.body;
      if (!full_name || !email || !phone) {
        return res.status(400).json({ success: false, message: 'full_name, email, and phone are required.' });
      }

      const bcrypt = require('bcrypt');
      const { pool } = require('../config/db');
      const password_hash = await bcrypt.hash(password, 10);
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();

      let executedQueries = [];

      // 1. Insert into users
      const userSql = `INSERT INTO users (full_name, email, phone, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *;`;
      const userRes = await pool.query(userSql, [full_name, cleanEmail, cleanPhone, password_hash, role]);
      const newUser = userRes.rows[0];
      executedQueries.push(`-- 1. Insert into users\nINSERT INTO users (full_name, email, phone, password_hash, role, is_active)\nVALUES ('${full_name}', '${cleanEmail}', '${cleanPhone}', '[BCRYPT_HASH]', '${role}', true)\nRETURNING *;`);

      const parts = full_name.trim().split(' ');
      const firstName = parts[0] || full_name;
      const lastName = parts.slice(1).join(' ') || 'User';

      if (role === 'rider') {
        try {
          const custSql = `INSERT INTO "CUSTOMER" ("FirstName", "LastName", "Email", "PhoneNumber", "CustomerRating") VALUES ($1, $2, $3, $4, 5.0) RETURNING *;`;
          await pool.query(custSql, [firstName, lastName, cleanEmail, cleanPhone]);
          executedQueries.push(`-- 2. Insert into Lab-2/Lab-3 CUSTOMER table\nINSERT INTO "CUSTOMER" ("FirstName", "LastName", "Email", "PhoneNumber", "CustomerRating")\nVALUES ('${firstName}', '${lastName}', '${cleanEmail}', '${cleanPhone}', 5.0);`);
        } catch (e) {
          console.warn('[AdminController.createUser] CUSTOMER insert warning:', e.message);
        }
      } else if (role === 'driver') {
        const lic = license_number || `GJ01-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          const drvSql = `INSERT INTO drivers (user_id, license_number, is_available, is_verified) VALUES ($1, $2, true, true) RETURNING *;`;
          await pool.query(drvSql, [newUser.user_id, lic]);
          executedQueries.push(`-- 2. Insert into drivers table\nINSERT INTO drivers (user_id, license_number, is_available, is_verified)\nVALUES (${newUser.user_id}, '${lic}', true, true);`);
        } catch (e) {
          console.warn('[AdminController.createUser] drivers insert warning:', e.message);
        }

        try {
          const drvLabSql = `INSERT INTO "DRIVER" ("FirstName", "LastName", "Email", "PhoneNumber", "LicenseNumber", "DriverRating", "AvailabilityStatus") VALUES ($1, $2, $3, $4, $5, 5.0, 'Available') RETURNING *;`;
          await pool.query(drvLabSql, [firstName, lastName, cleanEmail, cleanPhone, lic]);
          executedQueries.push(`-- 3. Insert into Lab-2/Lab-3 DRIVER table\nINSERT INTO "DRIVER" ("FirstName", "LastName", "Email", "PhoneNumber", "LicenseNumber", "DriverRating", "AvailabilityStatus")\nVALUES ('${firstName}', '${lastName}', '${cleanEmail}', '${cleanPhone}', '${lic}', 5.0, 'Available');`);
        } catch (e) {
          console.warn('[AdminController.createUser] DRIVER table warning:', e.message);
        }
      }

      const duration = Date.now() - startTime;
      return res.status(201).json({
        success: true,
        message: `${role === 'driver' ? 'Driver' : 'Rider'} created successfully in PostgreSQL!`,
        data: { user: newUser },
        executedSql: executedQueries.join('\n\n'),
        executionTime: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[AdminController.createUser] Error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * DELETE /api/admin/promos/:id
   */
  deletePromo: async (req, res) => {
    try {
      const deleted = await AdminModel.deletePromoCode(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Promo code not found.' });
      }
      return res.status(200).json({ success: true, message: 'Promo deleted.' });
    } catch (error) {
      console.error('[AdminController.deletePromo] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
};

module.exports = AdminController;

