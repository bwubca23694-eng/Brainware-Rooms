const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard, getMyRooms, toggleAvailability } = require('../controllers/ownerController');

router.use(protect, authorize('owner'));
router.get('/dashboard', getDashboard);
router.get('/rooms', getMyRooms);
router.put('/rooms/:id/toggle-availability', toggleAvailability);

module.exports = router;
