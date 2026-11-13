const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/methods', PaymentController.getPaymentMethods);
router.post('/initiate', PaymentController.initiatePayment);
router.post('/verify', PaymentController.verifyPayment);
router.post('/process', PaymentController.verifyPayment);
router.get('/history', PaymentController.getHistory);
router.get('/:id', PaymentController.getPaymentById);

module.exports = router;

