const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { listProperties, createBooking } = require('../controllers/bookingController');

router.get('/', listProperties);
router.post('/', authMiddleware('guest'), createBooking);

module.exports = router;