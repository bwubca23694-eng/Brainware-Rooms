const Room = require('../models/Room');
const Booking = require('../models/Booking');

exports.getDashboard = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user._id });
    const roomIds = rooms.map(r => r._id);
    
    const [totalBookings, pendingBookings, confirmedBookings] = await Promise.all([
      Booking.countDocuments({ owner: req.user._id }),
      Booking.countDocuments({ owner: req.user._id, status: 'pending' }),
      Booking.countDocuments({ owner: req.user._id, status: 'confirmed' }),
    ]);

    const totalViews = rooms.reduce((sum, r) => sum + r.views, 0);
    const totalRent = rooms.reduce((sum, r) => sum + r.rent, 0);
    const approvedRooms = rooms.filter(r => r.status === 'approved').length;
    const pendingRooms = rooms.filter(r => r.status === 'pending').length;

    res.json({ 
      success: true, 
      stats: { totalRooms: rooms.length, approvedRooms, pendingRooms, totalBookings, pendingBookings, confirmedBookings, totalViews },
      rooms 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user._id }).sort('-createdAt');
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, owner: req.user._id });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    room.availability = !room.availability;
    await room.save();
    res.json({ success: true, availability: room.availability });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
