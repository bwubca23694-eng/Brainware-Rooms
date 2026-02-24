const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { sendBookingNotification } = require('../utils/email');

exports.createBooking = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId).populate('owner');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (!room.availability) return res.status(400).json({ success: false, message: 'Room not available' });

    const existing = await Booking.findOne({ room: room._id, student: req.user._id, status: { $in: ['pending', 'confirmed'] } });
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

    try {
      await sendBookingNotification(room.owner.email, room.owner.name, 'new_booking', {
        studentName: req.user.name, roomTitle: room.title
      });
    } catch (e) {}

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

    booking.status = req.body.status;
    booking.ownerNote = req.body.note;
    if (req.body.visitDate) booking.visitDate = req.body.visitDate;
    await booking.save();

    const type = req.body.status === 'confirmed' ? 'booking_confirmed' : 'booking_rejected';
    try {
      await sendBookingNotification(booking.student.email, booking.student.name, type, {
        roomTitle: booking.room.title, note: req.body.note
      });
    } catch (e) {}

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
