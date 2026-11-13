// ============================================
// controllers/user.controller.js — User Profile
// ============================================
// Handles user profile CRUD, saved addresses,
// and notification management.
// ============================================

const UserModel = require('../models/user.model');

const UserController = {
  /**
   * GET /api/users/profile
   * Get the current user's profile.
   */
  getProfile: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      return res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('[UserController.getProfile] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * PUT /api/users/profile
   * Update the current user's profile.
   */
  updateProfile: async (req, res) => {
    try {
      const { full_name, phone } = req.body;

      if (!full_name && !phone) {
        return res.status(400).json({
          success: false,
          message: 'At least one field (full_name or phone) is required to update.'
        });
      }

      // If phone is being updated, check uniqueness
      if (phone) {
        const existingPhone = await UserModel.findByPhone(phone);
        if (existingPhone && existingPhone.user_id !== req.user.userId) {
          return res.status(409).json({
            success: false,
            message: 'This phone number is already in use by another account.'
          });
        }
      }

      const updatedUser = await UserModel.updateProfile(req.user.userId, { full_name, phone });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('[UserController.updateProfile] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // ---- SAVED ADDRESSES ----

  /**
   * GET /api/users/addresses
   * Get all saved addresses for the current user.
   */
  getSavedAddresses: async (req, res) => {
    try {
      const addresses = await UserModel.getSavedAddresses(req.user.userId);
      return res.status(200).json({
        success: true,
        data: { addresses }
      });
    } catch (error) {
      console.error('[UserController.getSavedAddresses] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * POST /api/users/addresses
   * Add a new saved address.
   */
  addSavedAddress: async (req, res) => {
    try {
      const { label, address, lat, lng } = req.body;

      if (!label || !address || lat === undefined || lng === undefined) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required: label, address, lat, lng.'
        });
      }

      const savedAddress = await UserModel.addSavedAddress(req.user.userId, {
        label, address, lat, lng
      });

      return res.status(201).json({
        success: true,
        message: 'Address saved successfully.',
        data: { address: savedAddress }
      });
    } catch (error) {
      console.error('[UserController.addSavedAddress] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * PUT /api/users/addresses/:id
   * Update a saved address.
   */
  updateSavedAddress: async (req, res) => {
    try {
      const addressId = parseInt(req.params.id, 10);
      const { label, address, lat, lng } = req.body;

      const updated = await UserModel.updateSavedAddress(
        addressId, req.user.userId, { label, address, lat, lng }
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Address not found or you do not own it.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Address updated successfully.',
        data: { address: updated }
      });
    } catch (error) {
      console.error('[UserController.updateSavedAddress] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * DELETE /api/users/addresses/:id
   * Delete a saved address.
   */
  deleteSavedAddress: async (req, res) => {
    try {
      const addressId = parseInt(req.params.id, 10);
      const deleted = await UserModel.deleteSavedAddress(addressId, req.user.userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Address not found or you do not own it.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Address deleted successfully.'
      });
    } catch (error) {
      console.error('[UserController.deleteSavedAddress] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // ---- NOTIFICATIONS ----

  /**
   * GET /api/users/notifications
   * Get notifications for the current user.
   */
  getNotifications: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = parseInt(req.query.offset, 10) || 0;

      const notifications = await UserModel.getNotifications(req.user.userId, limit, offset);
      const unreadCount = await UserModel.getUnreadNotificationCount(req.user.userId);

      return res.status(200).json({
        success: true,
        data: { notifications, unread_count: unreadCount }
      });
    } catch (error) {
      console.error('[UserController.getNotifications] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * PUT /api/users/notifications/:id/read
   * Mark a notification as read.
   */
  markNotificationRead: async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id, 10);
      const notification = await UserModel.markNotificationRead(notificationId, req.user.userId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        data: { notification }
      });
    } catch (error) {
      console.error('[UserController.markNotificationRead] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * PUT /api/users/notifications/read-all
   * Mark all notifications as read.
   */
  markAllNotificationsRead: async (req, res) => {
    try {
      const count = await UserModel.markAllNotificationsRead(req.user.userId);

      return res.status(200).json({
        success: true,
        message: `${count} notification(s) marked as read.`
      });
    } catch (error) {
      console.error('[UserController.markAllNotificationsRead] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = UserController;
