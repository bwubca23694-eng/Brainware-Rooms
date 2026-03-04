const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { sendBookingNotification } = require('../utils/email');
const { sendToUser } = require('../utils/pushNotify');

exports.createBooking = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate('owner');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (!room.availability) return res.status(400).json({ success: false, message: 'Room not available' });

    const existing = await Booking.findOne({
      room: room._id, student: req.user._id,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (existing) return res.status(400).json({ success: false, message: 'Already have an active booking for this room' });

    const booking = await Booking.create({
      room: room._id,
      student: req.user._id,
      owner: room.owner._id,
      moveInDate: req.body.moveInDate,
      duration: req.body.duration,
      message: req.body.message,
      totalAmount: room.rent * req.body.duration,
    });

    await booking.populate([
      { path: 'room', select: 'title rent images' },
      { path: 'student', select: 'name email phone' },
    ]);

    // Email notification to owner
    try {
      await sendBookingNotification(room.owner.email, room.owner.name, 'new_booking', {
        studentName: req.user.name, roomTitle: room.title
      });
    } catch (e) {}

    // Push notification to owner
    sendToUser(room.owner._id, {
      title: '📋 New Booking Request',
      body: `${req.user.name} wants to book "${room.title}"`,
      url: '/owner/bookings',
      tag: 'new-booking',
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate('room', 'title rent images address type')
      .populate('owner', 'name phone avatar')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('room', 'title rent images')
      .populate('student', 'name email phone avatar studentId')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room student');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const prevStatus = booking.status;
    booking.status = req.body.status;
    booking.ownerNote = req.body.note;
    if (req.body.visitDate) booking.visitDate = req.body.visitDate;

    // Track owner response time (first response only)
    if (prevStatus === 'pending' && !booking.respondedAt) {
      booking.respondedAt = new Date();
      // Update owner avg response time
      const User = require('../models/User');
      const allBookings = await Booking.find({
        owner: req.user._id,
        respondedAt: { $exists: true }
      });
      if (allBookings.length > 0) {
        const avgMs = allBookings.reduce((sum, b) => {
          return sum + (b.respondedAt - b.createdAt);
        }, 0) / allBookings.length;
        await User.findByIdAndUpdate(req.user._id, { avgResponseTime: Math.round(avgMs / 60000) }); // in minutes
      }
    }

    await booking.save();

    // Email to student
    const type = req.body.status === 'confirmed' ? 'booking_confirmed' : 'booking_rejected';
    try {
      await sendBookingNotification(booking.student.email, booking.student.name, type, {
        roomTitle: booking.room.title, note: req.body.note
      });
    } catch (e) {}

    // Push notification to student
    const isConfirmed = req.body.status === 'confirmed';
    sendToUser(booking.student._id, {
      title: isConfirmed ? '🎉 Booking Confirmed!' : '📋 Booking Update',
      body: isConfirmed
        ? `Your booking for "${booking.room.title}" is confirmed!`
        : `Your booking for "${booking.room.title}" was not accepted.`,
      url: '/dashboard',
      tag: 'booking-update',
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
