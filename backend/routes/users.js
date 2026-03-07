const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Toggle save/unsave a room
router.post('/saved-rooms/:roomId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const roomId = req.params.roomId;
    const idx = user.savedRooms.findIndex(id => id.toString() === roomId);
    let saved;
    if (idx === -1) {
      user.savedRooms.push(roomId);
      saved = true;
    } else {
      user.savedRooms.splice(idx, 1);
      saved = false;
    }
    await user.save();
    res.json({ success: true, saved, count: user.savedRooms.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/saved-rooms', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedRooms');
    res.json({ success: true, rooms: user.savedRooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
