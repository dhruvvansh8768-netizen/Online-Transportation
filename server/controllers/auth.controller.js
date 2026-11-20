// ============================================
// controllers/auth.controller.js — Authentication
// ============================================
// Handles user signup, login, password reset,
// and token management.
// ============================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const DriverModel = require('../models/driver.model');
const { pool } = require('../config/db');
const { generateOTP } = require('../utils/generateOTP');
require('dotenv').config();

const SALT_ROUNDS = 12;

// Dummy hash used for constant-time comparisons when a user does not exist (mitigates timing attacks & user enumeration)
const DUMMY_HASH = '$2b$12$e80yqV0d/UaQ3H7vW2hQ9uWnF7n6B5G2D8gJ0K1L2M3N4O5P6Q7R8';

/**
 * Phone normalizer helper — handles +91, leading 0, spaces, dashes
 */
const normalizePhone = (raw) => {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
};

const AuthController = {
  /**
   * POST /api/auth/signup
   * Register a new user (rider or driver).
   */
  signup: async (req, res) => {
    try {
      let {
        full_name: rawFullName,
        name,
        email,
        phone: rawPhone,
        password,
        role = 'rider',
        license_number: rawLicense,
        licenseNumber
      } = req.body;

      const full_name = (rawFullName || name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const phone = normalizePhone(rawPhone);
      const license_number = (rawLicense || licenseNumber || '').trim();

      // 1. Validate required fields
      if (!full_name || !cleanEmail || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required: Full Name, Email, Phone Number, and Password.'
        });
      }

      // 2. Validate input lengths (Prevents Buffer Flooding / Column Overflow)
      if (full_name.length < 2 || full_name.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be between 2 and 100 characters.'
        });
      }

      // 3. Strict Email Validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail) || cleanEmail.length > 150) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.'
        });
      }

      // 4. Strict Phone Validation (Valid 10-digit Indian mobile number)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be a valid 10-digit mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210).'
        });
      }

      // 5. Strong Password Policy (Prevents Weak / Dictionary Passwords)
      if (password.length < 8 || password.length > 72) {
        return res.status(400).json({
          success: false,
          message: 'Password must be between 8 and 72 characters long.'
        });
      }

      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (!hasLetter || !hasNumber) {
        return res.status(400).json({
          success: false,
          message: 'Password must contain at least one letter and one number for your security.'
        });
      }

      // 6. Privilege Escalation Prevention (Never allow public signup as 'admin')
      let userRole = role.toLowerCase();
      if (userRole === 'admin') {
        userRole = 'rider'; // Force to safe role
      }
      if (!['rider', 'driver'].includes(userRole)) {
        userRole = 'rider';
      }

      // 7. Driver requires license
      if (userRole === 'driver' && !license_number) {
        return res.status(400).json({
          success: false,
          message: 'License number is required for driver registration.'
        });
      }

      // 8. Check if email already exists
      const existingEmail = await UserModel.findByEmail(cleanEmail);
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      // 9. Check if phone already exists
      const existingPhone = await UserModel.findByPhone(phone);
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'An account with this phone number already exists.'
        });
      }

      // 10. Hash password with bcrypt salt rounds = 12
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user in users table
      const user = await UserModel.create({
        full_name,
        email: cleanEmail,
        phone,
        password_hash,
        role: userRole
      });

      // Split full_name into first, middle, last names for 3NF CUSTOMER table
      const nameParts = full_name.trim().split(/\s+/);
      const firstName = nameParts[0] || 'User';
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null;
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Rider';

      if (userRole === 'rider') {
        // Simultaneously persist into the official Lab-2/Lab-3 CUSTOMER table
        try {
          await pool.query(
            'INSERT INTO customer (firstname, middlename, lastname) VALUES ($1, $2, $3)',
            [firstName, middleName, lastName]
          );
        } catch (e) {
          console.warn('[AuthController.signup] customer table insert warning:', e.message);
        }
      } else if (userRole === 'driver') {
        const lic = license_number || `GJ01-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          await pool.query(
            'INSERT INTO drivers (user_id, license_number, years_of_experience, is_available, rating) VALUES ($1, $2, 1, true, 5.00) ON CONFLICT (user_id) DO NOTHING',
            [user.user_id, lic]
          );
        } catch (e) {
          console.warn('[AuthController.signup] drivers table insert warning:', e.message);
        }

        // Simultaneously persist into the official Lab-2/Lab-3 DRIVER table
        try {
          await pool.query(
            'INSERT INTO driver (drivername, driverrating, drivercontactno, yearofexperience) VALUES ($1, 5.00, $2, 1)',
            [full_name, phone]
          );
        } catch (e) {
          console.warn('[AuthController.signup] driver table insert warning:', e.message);
        }

        // Simultaneously persist vehicle into vehicles AND official Lab-2/Lab-3 VEHICLE table
        try {
          const vPlate = `GJ01AB${Math.floor(1000 + Math.random() * 9000)}`;
          const vCode = `VH${Math.floor(100 + Math.random() * 900)}`;
          const drvRes = await pool.query('SELECT driver_id FROM drivers WHERE user_id = $1', [user.user_id]);
          if (drvRes.rows.length > 0) {
            await pool.query(
              'INSERT INTO vehicles (driver_id, vehicle_type, model, registration_number, color, vehicle_code) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (registration_number) DO NOTHING',
              [drvRes.rows[0].driver_id, 'sedan', 'Swift Dzire', vPlate, 'White', vCode]
            );
          }
          await pool.query(
            'INSERT INTO vehicle (vehiclemodel, vehicletype, vehiclecolor, vehiclecode, lincenseplateno) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
            ['Swift Dzire', 'Sedan', 'White', vCode, vPlate]
          );
        } catch (e) {
          console.warn('[AuthController.signup] vehicle table insert warning:', e.message);
        }
      }

      // Generate secure JWT token
      const token = jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'ridego-jwt-secret-key-32-chars-minimum',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('[AuthController.signup] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Unable to complete registration. Please try again.'
      });
    }
  },

  /**
   * POST /api/auth/login
   * Authenticate a user and return a JWT.
   * Hardened against user enumeration & timing attacks.
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const user = await UserModel.findByEmail(cleanEmail);

      // Timing-attack mitigation: if user not found, perform dummy comparison so timing is identical
      if (!user) {
        await bcrypt.compare(password, DUMMY_HASH);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'ridego-jwt-secret-key-32-chars-minimum',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: {
            user_id: user.user_id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('[AuthController.login] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during login.'
      });
    }
  },

  /**
   * POST /api/auth/send-otp
   * Generate and send an OTP to the user's phone (simulated).
   */
  sendOTP: async (req, res) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number is required.'
        });
      }

      // Find user by phone
      const user = await UserModel.findByPhone(phone);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this phone number.'
        });
      }

      // Generate OTP
      const otp = generateOTP(6);

      // In production, send OTP via SMS service (e.g., Twilio)
      // For development, we return it in the response
      console.log(`[OTP] Generated OTP ${otp} for phone ${phone}`);

      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully.',
        data: {
          // Only include OTP in development mode
          ...(process.env.NODE_ENV === 'development' && { otp }),
          phone,
          expires_in: '5 minutes'
        }
      });
    } catch (error) {
      console.error('[AuthController.sendOTP] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while sending OTP.'
      });
    }
  },

  /**
   * POST /api/auth/reset-password
   * Reset a user's password (requires current password or admin access).
   */
  resetPassword: async (req, res) => {
    try {
      const { email, current_password, new_password } = req.body;

      if (!email || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Email and new_password are required.'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.'
        });
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email.'
        });
      }

      // If authenticated user is not admin, require current password
      if (!req.user || req.user.role !== 'admin') {
        if (!current_password) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required.'
          });
        }

        const isMatch = await bcrypt.compare(current_password, user.password_hash);
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: 'Current password is incorrect.'
          });
        }
      }

      // Hash new password
      const password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);

      // Update password
      await UserModel.updatePassword(user.user_id, password_hash);

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully.'
      });
    } catch (error) {
      console.error('[AuthController.resetPassword] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during password reset.'
      });
    }
  },

  /**
   * GET /api/auth/me
   * Get the currently authenticated user's profile.
   */
  getMe: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      // If the user is a driver, include driver profile
      let driverProfile = null;
      if (user.role === 'driver') {
        driverProfile = await DriverModel.findByUserId(user.user_id);
      }

      return res.status(200).json({
        success: true,
        data: {
          user,
          ...(driverProfile && { driver: driverProfile })
        }
      });
    } catch (error) {
      console.error('[AuthController.getMe] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = AuthController;
