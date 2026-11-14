const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate, roleCheck('admin'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id/status', AdminController.toggleUserStatus);
router.get('/rides', AdminController.getRides);
router.get('/vehicles', AdminController.getVehicles);
router.get('/revenue', AdminController.getRevenue);
router.get('/transactions', AdminController.getRevenue);
router.get('/promos', AdminController.getPromos);
router.post('/promos', AdminController.createPromo);
router.delete('/promos/:id', AdminController.deletePromo);

module.exports = router;

