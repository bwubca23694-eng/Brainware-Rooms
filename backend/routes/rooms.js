const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadVideo } = require('../config/cloudinary');
const {
  getRooms, getRoom, createRoom, updateRoom, deleteRoom, addReview, getNearbyRooms, addVideo
} = require('../controllers/roomController');

router.get('/', getRooms);
router.get('/nearby', getNearbyRooms);
router.get('/:id', getRoom);

// Handle images + optional single video
const uploadFields = upload.fields([{ name: 'images', maxCount: 10 }]);
const handleUploads = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    // Flatten req.files.images into req.files array for backward compat
    req.files = req.files?.images || [];
    next();
  });
};

router.post('/', protect, authorize('owner', 'admin'), handleUploads, createRoom);
router.put('/:id', protect, authorize('owner', 'admin'), handleUploads, updateRoom);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteRoom);
router.post('/:id/video', protect, authorize('owner', 'admin'), uploadVideo.single('video'), addVideo);
router.post('/:id/reviews', protect, authorize('student'), upload.array('images', 3), addReview);

module.exports = router;
