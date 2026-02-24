const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getRooms, getRoom, createRoom, updateRoom, deleteRoom, addReview, getNearbyRooms
} = require('../controllers/roomController');

router.get('/', getRooms);
router.get('/nearby', getNearbyRooms);
router.get('/:id', getRoom);

router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 10), createRoom);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 10), updateRoom);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteRoom);
router.post('/:id/reviews', protect, authorize('student'), addReview);

module.exports = router;
