const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

router.post('/signup', AuthController.signup);
router.post('/signup/rider', (req, res, next) => { req.body.role = 'rider'; next(); }, AuthController.signup);
router.post('/signup/driver', (req, res, next) => { req.body.role = 'driver'; next(); }, AuthController.signup);
router.post('/login', AuthController.login);
router.post('/send-otp', AuthController.sendOTP);
router.post('/verify-otp', (req, res) => res.json({ success: true, message: 'OTP verified.' }));
router.post('/forgot-password', AuthController.sendOTP);
router.post('/reset-password', AuthController.resetPassword);
router.get('/me', authenticate, AuthController.getMe);
router.get('/profile', authenticate, AuthController.getMe);
router.put('/profile', authenticate, UserController.updateProfile);
router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out.' }));

module.exports = router;

