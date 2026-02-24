const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalRooms, totalBookings, pendingRooms, pendingOwners] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments(),
      Booking.countDocuments(),
      Room.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'owner', isOwnerApproved: false }),
    ]);

    const recentRooms = await Room.find({ status: 'pending' })
      .populate('owner', 'name email')
      .sort('-createdAt')
      .limit(5);
    
    const recentBookings = await Booking.find()
      .populate('room', 'title')
      .populate('student', 'name')
      .sort('-createdAt')
      .limit(5);

    const monthlyStats = await Booking.aggregate([
      { $group: { 
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.json({ success: true, stats: { totalUsers, totalRooms, totalBookings, pendingRooms, pendingOwners }, recentRooms, recentBookings, monthlyStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip((page-1)*limit).limit(Number(limit));
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

exports.getPendingRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'pending' })
      .populate('owner', 'name email phone businessName isOwnerApproved')
      .sort('-createdAt');
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Room.countDocuments(query);
    const rooms = await Room.find(query).populate('owner', 'name email').sort('-createdAt').skip((page-1)*limit).limit(Number(limit));
    res.json({ success: true, rooms, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reviewRoom = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, { status, adminNote }, { new: true }).populate('owner', 'name email');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveOwner = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isOwnerApproved: req.body.approved }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room', 'title rent')
      .populate('student', 'name email')
      .populate('owner', 'name email')
      .sort('-createdAt')
      .limit(100);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
