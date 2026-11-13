const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/rating.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', RatingController.submitRating);
router.get('/:userId', RatingController.getUserRatings);

module.exports = router;

