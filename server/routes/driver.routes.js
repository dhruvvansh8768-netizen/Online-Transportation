const express = require('express');
const router = express.Router();
const DriverController = require('../controllers/driver.controller');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.get('/nearby', authenticate, DriverController.getNearbyDrivers);

router.use(authenticate, roleCheck('driver', 'admin'));

router.get('/profile', DriverController.getProfile);
router.put('/toggle', DriverController.toggleAvailability);
router.put('/toggle-availability', DriverController.toggleAvailability);
router.put('/status', DriverController.toggleAvailability);
router.put('/location', DriverController.updateLocation);
router.post('/rides/:id/accept', DriverController.acceptRide);
router.put('/:id/accept', DriverController.acceptRide);
router.post('/rides/:id/reject', DriverController.declineRide);
router.put('/:id/decline', DriverController.declineRide);
router.put('/rides/:id/arriving', DriverController.markArriving);
router.post('/rides/:id/start', DriverController.startRide);
router.put('/:id/start', DriverController.startRide);
router.post('/rides/:id/complete', DriverController.completeRide);
router.put('/:id/complete', DriverController.completeRide);
router.get('/vehicles', DriverController.getVehicles);
router.post('/vehicles', DriverController.addVehicle);
router.put('/vehicles/:id', DriverController.updateVehicle);
router.delete('/vehicles/:id', DriverController.deleteVehicle);
router.get('/earnings', DriverController.getEarnings);
router.get('/earnings/daily', DriverController.getDailyEarnings);

module.exports = router;

