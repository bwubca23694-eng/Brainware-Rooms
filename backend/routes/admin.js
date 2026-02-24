const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard, getUsers, updateUser, deleteUser, getPendingRooms, getAllRooms, reviewRoom, approveOwner, getAllBookings } = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/approve-owner', approveOwner);
router.get('/rooms/pending', getPendingRooms);
router.get('/rooms', getAllRooms);
router.put('/rooms/:id/review', reviewRoom);
router.get('/bookings', getAllBookings);

module.exports = router;
