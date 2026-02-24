const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createBooking, getMyBookings, cancelBooking, getOwnerBookings, updateBookingStatus } = require('../controllers/bookingController');

router.post('/room/:roomId', protect, authorize('student'), createBooking);
router.get('/my', protect, authorize('student'), getMyBookings);
router.put('/:id/cancel', protect, authorize('student'), cancelBooking);
router.get('/owner', protect, authorize('owner'), getOwnerBookings);
router.put('/:id/status', protect, authorize('owner'), updateBookingStatus);

module.exports = router;
