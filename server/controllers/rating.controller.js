// ============================================
// controllers/rating.controller.js — Ratings
// ============================================

const RatingModel = require('../models/rating.model');
const RideModel = require('../models/ride.model');
const DriverModel = require('../models/driver.model');

const RatingController = {
  /**
   * POST /api/ratings
   */
  submitRating: async (req, res) => {
    try {
      const { ride_id, rated_to, rating, review = '' } = req.body;

      if (!ride_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'ride_id and rating (1-5) are required.'
        });
      }

      const existing = await RatingModel.findByRideAndUser(ride_id, req.user.userId);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'You have already rated this ride.'
        });
      }

      let targetUserId = rated_to;
      if (!targetUserId) {
        const ride = await RideModel.findById(ride_id);
        if (!ride) {
          return res.status(404).json({ success: false, message: 'Ride not found.' });
        }
        targetUserId = ride.rider_id === req.user.userId ? ride.driver_user_id : ride.rider_id;
      }

      const newRating = await RatingModel.create({
        ride_id,
        rated_by: req.user.userId,
        rated_to: targetUserId,
        rating: Number(rating),
        review
      });

      const avg = await RatingModel.getAverageRating(targetUserId);
      const driver = await DriverModel.findByUserId(targetUserId);
      if (driver && avg?.avg_rating) {
        await DriverModel.updateRating(driver.driver_id, avg.avg_rating);
      }

      return res.status(201).json({
        success: true,
        message: 'Rating submitted successfully.',
        data: { rating: newRating, average: avg }
      });
    } catch (error) {
      console.error('[RatingController.submitRating] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  /**
   * GET /api/ratings/:userId
   */
  getUserRatings: async (req, res) => {
    try {
      const userId = req.params.userId;
      const ratings = await RatingModel.getReceivedRatings(userId);
      const summary = await RatingModel.getAverageRating(userId);
      return res.status(200).json({
        success: true,
        data: { ratings, summary }
      });
    } catch (error) {
      console.error('[RatingController.getUserRatings] Error:', error.message);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
};

module.exports = RatingController;

