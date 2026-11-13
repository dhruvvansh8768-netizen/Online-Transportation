const express = require('express');
const router = express.Router();
const RideController = require('../controllers/ride.controller');
const DriverController = require('../controllers/driver.controller');
const RatingController = require('../controllers/rating.controller');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate);

router.post('/estimate', RideController.getFareEstimate);
router.post('/request', RideController.requestRide);
router.post('/book', RideController.requestRide);
router.get('/active', RideController.getActiveRide);
router.get('/history', RideController.getRideHistory);
router.get('/pending', roleCheck('driver', 'admin'), RideController.getPendingRides);
router.get('/nearby-drivers', DriverController.getNearbyDrivers);
router.get('/:id', RideController.getRideDetails);
router.put('/:id/cancel', RideController.cancelRide);
router.post('/:id/cancel', RideController.cancelRide);
router.post('/:id/rate', (req, res, next) => {
  req.body.ride_id = req.params.id;
  next();
}, RatingController.submitRating);

module.exports = router;

