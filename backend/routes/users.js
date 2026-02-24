const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/saved-rooms', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedRooms');
    res.json({ success: true, rooms: user.savedRooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
