// ============================================
// controllers/driver.controller.js — Driver Ops
// ============================================
// Handles driver availability toggle, ride
// accept/decline, location updates, vehicle
// management, and earnings.
// ============================================

const DriverModel = require('../models/driver.model');
const RideModel = require('../models/ride.model');
const UserModel = require('../models/user.model');

const DriverController = {
  /**
   * GET /api/drivers/profile
   * Get the current driver's profile with vehicle info.
   */
  getProfile: async (req, res) => {
    try {
      const driver = await DriverModel.findByUserId(req.user.userId);

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found. Are you registered as a driver?'
        });
      }

      const vehicles = await DriverModel.getVehicles(driver.driver_id);

      return res.status(200).json({
        success: true,
        data: { driver, vehicles }
      });
    } catch (error) {
      console.error('[DriverController.getProfile] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * PUT /api/drivers/toggle-availability
   * Toggle the driver's online/offline status.
   */
  toggleAvailability: async (req, res) => {
    try {
      const driver = await DriverModel.findByUserId(req.user.userId);

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.'
        });
      }

      // Toggle the availability
      const newStatus = !driver.is_available;
      const updated = await DriverModel.toggleAvailability(driver.driver_id, newStatus);

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.to(`driver_${req.user.userId}`).emit('availability_changed', {
          driver_id: driver.driver_id,
          is_available: updated.is_available
        });
      }

      return res.status(200).json({
        success: true,
        message: `You are now ${newStatus ? 'online' : 'offline'}.`,
        data: { is_available: updated.is_available }
      });
    } catch (error) {
      console.error('[DriverController.toggleAvailability] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * PUT /api/drivers/location
   * Update the driver's current GPS location.
   */
  updateLocation: async (req, res) => {
    try {
      const { lat, lng } = req.body;

      if (lat === undefined || lng === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Latitude (lat) and longitude (lng) are required.'
        });
      }

      const driver = await DriverModel.findByUserId(req.user.userId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.'
        });
      }

      const updated = await DriverModel.updateLocation(
        driver.driver_id,
        parseFloat(lat),
        parseFloat(lng)
      );

      // Emit location update to the rider if on an active ride
      const activeRide = await RideModel.getActiveRideForDriver(driver.driver_id);
      if (activeRide) {
        const io = req.app.get('io');
        if (io) {
          io.to(`ride_${activeRide.ride_id}`).emit('driver_location_updated', {
            ride_id: activeRide.ride_id,
            driver_id: driver.driver_id,
            lat: updated.current_lat,
            lng: updated.current_lng
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Location updated.',
        data: { location: updated }
      });
    } catch (error) {
      console.error('[DriverController.updateLocation] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * POST /api/drivers/rides/:id/accept
   * Accept a ride request.
   */
  acceptRide: async (req, res) => {
    try {
      const rideId = parseInt(req.params.id, 10);

      // Get driver profile
      const driver = await DriverModel.findByUserId(req.user.userId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.'
        });
      }

      // Check if driver already has an active ride
      const activeRide = await RideModel.getActiveRideForDriver(driver.driver_id);
      if (activeRide) {
        return res.status(409).json({
          success: false,
          message: 'You already have an active ride. Complete it first.'
        });
      }

      // Assign the driver to the ride
      const ride = await RideModel.assignDriver(rideId, driver.driver_id);
      if (!ride) {
        return res.status(400).json({
          success: false,
          message: 'Ride not found or already accepted by another driver.'
        });
      }

      // Set driver as unavailable
      await DriverModel.toggleAvailability(driver.driver_id, false);

      // Notify the rider via socket
      const io = req.app.get('io');
      if (io) {
        io.to(`rider_${ride.rider_id}`).emit('ride_accepted', {
          ride_id: ride.ride_id,
          driver: {
            driver_id: driver.driver_id,
            full_name: driver.full_name,
            phone: driver.phone,
            rating: driver.rating,
            current_lat: driver.current_lat,
            current_lng: driver.current_lng
          }
        });

        // Also join the ride room
        io.to(`driver_${req.user.userId}`).emit('join_ride_room', {
          room: `ride_${ride.ride_id}`
        });
      }

      // Create notifications
      await UserModel.createNotification(
        ride.rider_id,
        'Driver Assigned',
        `${driver.full_name} is on the way to pick you up!`
      );

      return res.status(200).json({
        success: true,
        message: 'Ride accepted successfully.',
        data: { ride }
      });
    } catch (error) {
      console.error('[DriverController.acceptRide] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * POST /api/drivers/rides/:id/decline
   * Decline a ride request (driver passes on it).
   */
  declineRide: async (req, res) => {
    try {
      const rideId = parseInt(req.params.id, 10);

      // Simply acknowledge the decline — the ride stays in 'requested' status
      // for other drivers to accept
      return res.status(200).json({
        success: true,
        message: 'Ride declined. It will be offered to other drivers.'
      });
    } catch (error) {
      console.error('[DriverController.declineRide] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * POST /api/drivers/rides/:id/arriving
   * Mark that the driver is arriving at pickup.
   */
  markArriving: async (req, res) => {
    try {
      const rideId = parseInt(req.params.id, 10);

      const ride = await RideModel.updateStatus(rideId, 'arriving');
      if (!ride) {
        return res.status(404).json({
          success: false,
          message: 'Ride not found.'
        });
      }

      // Notify rider
      const io = req.app.get('io');
      if (io) {
        io.to(`rider_${ride.rider_id}`).emit('driver_arriving', {
          ride_id: ride.ride_id,
          message: 'Your driver is arriving at the pickup location.'
        });
      }

      await UserModel.createNotification(
        ride.rider_id,
        'Driver Arriving',
        'Your driver is arriving at the pickup location.'
      );

      return res.status(200).json({
        success: true,
        message: 'Marked as arriving.',
        data: { ride }
      });
    } catch (error) {
      console.error('[DriverController.markArriving] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * POST /api/drivers/rides/:id/start
   * Start the ride after verifying OTP.
   */
  startRide: async (req, res) => {
    try {
      const rideId = parseInt(req.params.id, 10);
      const { otp } = req.body;

      if (!otp) {
        return res.status(400).json({
          success: false,
          message: 'OTP is required to start the ride.'
        });
      }

      // Verify OTP
      const verified = await RideModel.verifyOTP(rideId, otp);
      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP or ride is not in accepted status.'
        });
      }

      // Update ride status to in_progress
      const ride = await RideModel.updateStatus(rideId, 'in_progress');

      // Notify rider
      const io = req.app.get('io');
      if (io) {
        io.to(`rider_${ride.rider_id}`).emit('ride_started', {
          ride_id: ride.ride_id,
          message: 'Your ride has started!'
        });
      }

      await UserModel.createNotification(
        ride.rider_id,
        'Ride Started',
        'Your ride is now in progress. Enjoy the trip!'
      );

      return res.status(200).json({
        success: true,
        message: 'Ride started successfully.',
        data: { ride }
      });
    } catch (error) {
      console.error('[DriverController.startRide] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * POST /api/drivers/rides/:id/complete
   * Complete a ride.
   */
  completeRide: async (req, res) => {
    try {
      const rideId = parseInt(req.params.id, 10);

      // Verify the ride exists and is in_progress
      const currentRide = await RideModel.findById(rideId);
      if (!currentRide || currentRide.status !== 'in_progress') {
        return res.status(400).json({
          success: false,
          message: 'Ride not found or not currently in progress.'
        });
      }

      // Complete the ride
      const ride = await RideModel.updateStatus(rideId, 'completed');

      // Get driver profile to make available again
      const driver = await DriverModel.findByUserId(req.user.userId);
      if (driver) {
        await DriverModel.toggleAvailability(driver.driver_id, true);
      }

      // Notify rider
      const io = req.app.get('io');
      if (io) {
        io.to(`rider_${ride.rider_id}`).emit('ride_completed', {
          ride_id: ride.ride_id,
          fare: ride.fare,
          message: 'Your ride is complete! Please rate your driver.'
        });
      }

      await UserModel.createNotification(
        ride.rider_id,
        'Ride Completed',
        `Your ride is complete. Fare: ₹${ride.fare}. Please rate your experience!`
      );

      return res.status(200).json({
        success: true,
        message: 'Ride completed successfully.',
        data: { ride }
      });
    } catch (error) {
      console.error('[DriverController.completeRide] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // ---- VEHICLE MANAGEMENT ----

  /**
   * POST /api/drivers/vehicles
   * Add a vehicle to the driver's profile.
   */
  addVehicle: async (req, res) => {
    try {
      const { vehicle_type, model, registration_number, color } = req.body;

      if (!vehicle_type || !model || !registration_number || !color) {
        return res.status(400).json({
          success: false,
          message: 'All fields required: vehicle_type, model, registration_number, color.'
        });
      }

      const driver = await DriverModel.findByUserId(req.user.userId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.'
        });
      }

      const vehicle = await DriverModel.addVehicle({
        driver_id: driver.driver_id,
        vehicle_type, model, registration_number, color
      });

      return res.status(201).json({
        success: true,
        message: 'Vehicle added successfully.',
        data: { vehicle }
      });
    } catch (error) {
      console.error('[DriverController.addVehicle] Error:', error.message);
      // Handle unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'A vehicle with this registration number already exists.'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * PUT /api/drivers/vehicles/:id
   * Update a vehicle.
   */
  updateVehicle: async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id, 10);
      const { vehicle_type, model, registration_number, color } = req.body;

      const driver = await DriverModel.findByUserId(req.user.userId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.'
        });
      }

      const updated = await DriverModel.updateVehicle(vehicleId, driver.driver_id, {
        vehicle_type, model, registration_number, color
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found or you do not own it.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully.',
        data: { vehicle: updated }
      });
    } catch (error) {
      console.error('[DriverController.updateVehicle] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * DELETE /api/drivers/vehicles/:id
   * Remove a vehicle.
   */
  deleteVehicle: async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.id, 10);

      const driver = await DriverModel.findByUserId(req.user.userId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.'
        });
      }

      const deleted = await DriverModel.deleteVehicle(vehicleId, driver.driver_id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found or you do not own it.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully.'
      });
    } catch (error) {
      console.error('[DriverController.deleteVehicle] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * GET /api/drivers/vehicles
   * Get all vehicles for the current driver.
   */
  getVehicles: async (req, res) => {
    try {
      const driver = await DriverModel.findByUserId(req.user.userId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.'
        });
      }

      const vehicles = await DriverModel.getVehicles(driver.driver_id);

      return res.status(200).json({
        success: true,
        data: { vehicles }
      });
    } catch (error) {
      console.error('[DriverController.getVehicles] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  // ---- EARNINGS ----

  /**
   * GET /api/drivers/earnings
   * Get total earnings for the current driver.
   */
  getEarnings: async (req, res) => {
    try {
      const driver = await DriverModel.findByUserId(req.user.userId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.'
        });
      }

      const earnings = await DriverModel.getEarnings(driver.driver_id);

      return res.status(200).json({
        success: true,
        data: { earnings }
      });
    } catch (error) {
      console.error('[DriverController.getEarnings] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * GET /api/drivers/earnings/daily
   * Get daily earnings breakdown.
   */
  getDailyEarnings: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'start_date and end_date query parameters are required.'
        });
      }

      const driver = await DriverModel.findByUserId(req.user.userId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found.'
        });
      }

      const earnings = await DriverModel.getEarningsByDateRange(
        driver.driver_id, start_date, end_date
      );

      return res.status(200).json({
        success: true,
        data: { earnings }
      });
    } catch (error) {
      console.error('[DriverController.getDailyEarnings] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  },

  /**
   * GET /api/drivers/nearby
   * Find nearby available drivers (for riders).
   */
  getNearbyDrivers: async (req, res) => {
    try {
      const { lat, lng, radius = 5 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude (lat) and longitude (lng) query parameters are required.'
        });
      }

      const drivers = await DriverModel.findNearby(
        parseFloat(lat), parseFloat(lng), parseFloat(radius), 15
      );

      return res.status(200).json({
        success: true,
        data: { drivers, count: drivers.length }
      });
    } catch (error) {
      console.error('[DriverController.getNearbyDrivers] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = DriverController;
