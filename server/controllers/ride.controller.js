// ============================================
// controllers/ride.controller.js — Ride Booking
// ============================================
// Handles ride request, tracking, fare
// estimation, promo codes, and ride history.
// ============================================

const RideModel = require('../models/ride.model');
const DriverModel = require('../models/driver.model');
const UserModel = require('../models/user.model');
const AdminModel = require('../models/admin.model');
const { calculateFare, calculateDistance, estimateDuration, getAllFareEstimates } = require('../utils/fareCalculator');
const { generateOTP } = require('../utils/generateOTP');

const RideController = {
  /**
   * POST /api/rides/estimate
   * Get fare estimates for a route (all vehicle types).
   */
  getFareEstimate: async (req, res) => {
    try {
      const { pickup_lat, pickup_lng, drop_lat, drop_lng } = req.body;

      if (!pickup_lat || !pickup_lng || !drop_lat || !drop_lng) {
        return res.status(400).json({
          success: false,
          message: 'All coordinates required: pickup_lat, pickup_lng, drop_lat, drop_lng.'
        });
      }

      // Calculate distance using Haversine formula
      const distanceKm = calculateDistance(
        parseFloat(pickup_lat), parseFloat(pickup_lng),
        parseFloat(drop_lat), parseFloat(drop_lng)
      );

      // Estimate duration based on distance
      const durationMin = estimateDuration(distanceKm);

      // Get fare estimates for all vehicle types
      const estimates = getAllFareEstimates(distanceKm, durationMin);

      return res.status(200).json({
        success: true,
        data: {
          distance_km: distanceKm,
          estimated_duration_min: durationMin,
          estimates
        }
      });
    } catch (error) {
      console.error('[RideController.getFareEstimate] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * POST /api/rides/request
   * Create a new ride request.
   */
  requestRide: async (req, res) => {
    try {
      const {
        pickup_lat, pickup_lng, pickup_address,
        drop_lat, drop_lng, drop_address,
        vehicle_type = 'mini', promo_code
      } = req.body;

      // Validate required fields
      if (!pickup_lat || !pickup_lng || !pickup_address ||
          !drop_lat || !drop_lng || !drop_address) {
        return res.status(400).json({
          success: false,
          message: 'All pickup and drop location fields are required.'
        });
      }

      // Check if rider already has an active ride
      const activeRide = await RideModel.getActiveRideForRider(req.user.userId);
      if (activeRide) {
        return res.status(409).json({
          success: false,
          message: 'You already have an active ride. Complete or cancel it first.',
          data: { active_ride: activeRide }
        });
      }

      // Calculate distance and fare
      const distanceKm = calculateDistance(
        parseFloat(pickup_lat), parseFloat(pickup_lng),
        parseFloat(drop_lat), parseFloat(drop_lng)
      );
      const durationMin = estimateDuration(distanceKm);
      const fareResult = calculateFare(distanceKm, durationMin, vehicle_type);
      let finalFare = fareResult.fare;

      // Apply promo code if provided
      let promoApplied = null;
      if (promo_code) {
        const promoResult = await AdminModel.applyPromoCode(promo_code, finalFare);
        if (promoResult.valid) {
          finalFare = promoResult.final_fare;
          promoApplied = {
            code: promo_code,
            discount: promoResult.discount,
            original_fare: fareResult.fare,
            final_fare: finalFare
          };
        }
      }

      // Generate OTP for ride verification
      const otp = generateOTP(4);

      // Create the ride
      const ride = await RideModel.create({
        rider_id: req.user.userId,
        pickup_lat: parseFloat(pickup_lat),
        pickup_lng: parseFloat(pickup_lng),
        pickup_address,
        drop_lat: parseFloat(drop_lat),
        drop_lng: parseFloat(drop_lng),
        drop_address,
        fare: finalFare,
        distance_km: distanceKm,
        duration_min: durationMin,
        otp
      });

      // Create notification for the rider
      await UserModel.createNotification(
        req.user.userId,
        'Ride Requested',
        `Your ride from ${pickup_address} to ${drop_address} has been requested. Looking for a driver...`
      );

      // Emit socket event to notify nearby drivers
      const io = req.app.get('io');
      if (io) {
        // Find nearby available drivers
        const nearbyDrivers = await DriverModel.findNearby(
          parseFloat(pickup_lat), parseFloat(pickup_lng), 5, 20
        );

        // Emit ride request to each nearby driver's room
        nearbyDrivers.forEach(driver => {
          io.to(`driver_${driver.user_id}`).emit('new_ride_request', {
            ride_id: ride.ride_id,
            pickup_address,
            drop_address,
            fare: finalFare,
            distance_km: distanceKm,
            duration_min: durationMin,
            pickup_lat: parseFloat(pickup_lat),
            pickup_lng: parseFloat(pickup_lng)
          });
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Ride requested successfully.',
        data: {
          ride,
          fare_breakdown: fareResult.breakdown,
          ...(promoApplied && { promo_applied: promoApplied }),
          otp // Share OTP with rider to verify with driver
        }
      });
    } catch (error) {
      console.error('[RideController.requestRide] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * GET /api/rides/:id
   * Get details of a specific ride.
   */
  getRideDetails: async (req, res) => {
    try {
      const rideId = parseInt(req.params.id, 10);
      const ride = await RideModel.findById(rideId);

      if (!ride) {
        return res.status(404).json({
          success: false,
          message: 'Ride not found.'
        });
      }

      // Ensure user is authorized (rider, assigned driver, or admin)
      const driverProfile = await DriverModel.findByUserId(req.user.userId);
      const isRider = ride.rider_id === req.user.userId;
      const isDriver = driverProfile && ride.driver_id === driverProfile.driver_id;
      const isAdmin = req.user.role === 'admin';

      if (!isRider && !isDriver && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this ride.'
        });
      }

      return res.status(200).json({
        success: true,
        data: { ride }
      });
    } catch (error) {
      console.error('[RideController.getRideDetails] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * POST /api/rides/:id/cancel
   * Cancel a ride.
   */
  cancelRide: async (req, res) => {
    try {
      const rideId = parseInt(req.params.id, 10);

      const cancelled = await RideModel.cancel(rideId, req.user.userId);

      if (!cancelled) {
        return res.status(400).json({
          success: false,
          message: 'Unable to cancel ride. It may not exist, not belong to you, or already be in progress/completed.'
        });
      }

      // If a driver was assigned, make them available again
      if (cancelled.driver_id) {
        await DriverModel.toggleAvailability(cancelled.driver_id, true);

        // Notify driver via socket
        const io = req.app.get('io');
        if (io) {
          const driver = await DriverModel.findById(cancelled.driver_id);
          if (driver) {
            io.to(`driver_${driver.user_id}`).emit('ride_cancelled', {
              ride_id: cancelled.ride_id,
              message: 'The ride has been cancelled by the rider.'
            });
          }
        }
      }

      // Notify rider via socket
      const io = req.app.get('io');
      if (io) {
        io.to(`rider_${cancelled.rider_id}`).emit('ride_cancelled', {
          ride_id: cancelled.ride_id,
          message: 'Your ride has been cancelled.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Ride cancelled successfully.',
        data: { ride: cancelled }
      });
    } catch (error) {
      console.error('[RideController.cancelRide] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * GET /api/rides/active
   * Get the current active ride for the authenticated user.
   */
  getActiveRide: async (req, res) => {
    try {
      let ride;

      if (req.user.role === 'rider') {
        ride = await RideModel.getActiveRideForRider(req.user.userId);
      } else if (req.user.role === 'driver') {
        const driver = await DriverModel.findByUserId(req.user.userId);
        if (driver) {
          ride = await RideModel.getActiveRideForDriver(driver.driver_id);
        }
      }

      if (!ride) {
        return res.status(200).json({
          success: true,
          message: 'No active ride found.',
          data: { ride: null }
        });
      }

      return res.status(200).json({
        success: true,
        data: { ride }
      });
    } catch (error) {
      console.error('[RideController.getActiveRide] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * GET /api/rides/history
   * Get ride history for the current user.
   */
  getRideHistory: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const offset = parseInt(req.query.offset, 10) || 0;

      let rides;

      if (req.user.role === 'rider') {
        rides = await RideModel.getRiderHistory(req.user.userId, limit, offset);
      } else if (req.user.role === 'driver') {
        const driver = await DriverModel.findByUserId(req.user.userId);
        if (driver) {
          rides = await RideModel.getDriverHistory(driver.driver_id, limit, offset);
        } else {
          rides = [];
        }
      } else {
        // Admin can see all rides
        rides = await RideModel.findAll({ limit, offset });
      }

      return res.status(200).json({
        success: true,
        data: { rides, count: rides.length }
      });
    } catch (error) {
      console.error('[RideController.getRideHistory] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * GET /api/rides/pending
   * Get all pending ride requests (for drivers to see).
   */
  getPendingRides: async (req, res) => {
    try {
      const rides = await RideModel.getPendingRides(20);

      return res.status(200).json({
        success: true,
        data: { rides, count: rides.length }
      });
    } catch (error) {
      console.error('[RideController.getPendingRides] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = RideController;
