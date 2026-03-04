const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { checkAlertsForRoom } = require('../utils/checkAlerts');
const { sendToUser } = require('../utils/pushNotify');

// getDashboard (also exported as getDashboardStats for compatibility)
exports.getDashboard = exports.getDashboardStats = async (req, res) => {
  try {
    const [users, rooms, bookings, pendingRooms] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments({ status: 'approved' }),
      Booking.countDocuments(),
      Room.countDocuments({ status: 'pending' }),
    ]);
    res.json({ success: true, stats: { users, rooms, bookings, pendingRooms } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// getUsers (also getAllUsers)
exports.getUsers = exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveOwner = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isOwnerApproved: true },
      { new: true }
    ).select('-password');
    // Notify owner via push
    sendToUser(req.params.id, {
      title: '🎉 Owner Account Approved!',
      body: 'You can now list rooms on BWU Rooms',
      url: '/owner/dashboard',
      tag: 'owner-approved',
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPendingRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'pending' })
      .populate('owner', 'name email businessName')
      .sort('-createdAt');
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('owner', 'name email')
      .sort('-createdAt');
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// reviewRoom (approve/reject) — also exported as updateRoomStatus
exports.reviewRoom = exports.updateRoomStatus = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('owner', 'name email');

    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    // When approved — check saved alerts & notify owner
    if (req.body.status === 'approved') {
      checkAlertsForRoom(room); // non-blocking, no await
      sendToUser(room.owner._id, {
        title: '🎉 Room Approved!',
        body: `"${room.title}" is now live on BWU Rooms`,
        url: '/owner/rooms',
        tag: 'room-approved',
      });
    }

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room', 'title')
      .populate('student', 'name email')
      .populate('owner', 'name email')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
