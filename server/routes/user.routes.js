const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.get('/addresses', UserController.getSavedAddresses);
router.post('/addresses', UserController.addSavedAddress);
router.put('/addresses/:id', UserController.updateSavedAddress);
router.delete('/addresses/:id', UserController.deleteSavedAddress);
router.get('/notifications', UserController.getNotifications);
router.put('/notifications/:id/read', UserController.markNotificationRead);
router.put('/notifications/read-all', UserController.markAllNotificationsRead);

module.exports = router;

