const Room = require('../models/Room');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { sendBroadcast } = require('../utils/pushNotify');

exports.getRooms = async (req, res) => {
  try {
    const {
      type, minRent, maxRent, amenities, gender, page = 1, limit = 12,
      sort = '-createdAt', lat, lng, radius = 5, search, status
    } = req.query;

    const query = { status: status || 'approved' };
    if (!req.query.status) query.availability = true;

    if (type) query.type = type;
    if (minRent || maxRent) query.rent = {};
    if (minRent) query.rent.$gte = Number(minRent);
    if (maxRent) query.rent.$lte = Number(maxRent);
    if (amenities) query.amenities = { $all: amenities.split(',') };
    if (gender && gender !== 'any') query['rules.genderAllowed'] = { $in: [gender, 'any'] };
    if (search) query.$text = { $search: search };

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      };
    }

    const total = await Room.countDocuments(query);
    const rooms = await Room.find(query)
      .populate('owner', 'name avatar phone businessName avgResponseTime')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, rooms, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('owner', 'name avatar phone businessName isOwnerApproved avgResponseTime');
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

    await Room.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const reviews = await Review.find({ room: room._id, isApproved: true })
      .populate('student', 'name avatar')
      .sort('-createdAt')
      .limit(20);

    res.json({ success: true, room, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const roomData = { ...req.body, owner: req.user._id };

    if (req.files?.length) {
      roomData.images = req.files.map(f => ({ url: f.path, publicId: f.filename }));
    }

    if (req.body.location?.coordinates) {
      const [lng, lat] = req.body.location.coordinates;
      const R = 6371;
      const dLat = (22.7225 - lat) * Math.PI / 180;
      const dLng = (88.4821 - lng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180) * Math.cos(22.7225*Math.PI/180) * Math.sin(dLng/2)**2;
      roomData.distanceFromCollege = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    const room = await Room.create(roomData);

    // Push broadcast: new room alert to subscribers
    sendBroadcast('newRoomAlerts', {
      title: '🏠 New Room Listed!',
      body: `${room.title} — ₹${room.rent}/mo near BWU`,
      url: `/rooms/${room._id}`,
      tag: 'new-room',
    });

    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (req.files?.length) {
      updates.images = [...(room.images || []), ...req.files.map(f => ({ url: f.path, publicId: f.filename }))];
    }
    if (req.user.role !== 'admin') updates.status = 'pending';

    room = await Room.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await room.deleteOne();
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const existing = await Review.findOne({ room: req.params.id, student: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this room' });

    // Check if student had a confirmed booking (verified tenant badge)
    const confirmedBooking = await Booking.findOne({
      room: req.params.id,
      student: req.user._id,
      status: 'confirmed',
    });

    const reviewData = {
      room: req.params.id,
      student: req.user._id,
      rating: Number(rating),
      comment,
      isVerifiedTenant: !!confirmedBooking,
    };

    // Handle photo uploads
    if (req.files?.length) {
      reviewData.images = req.files.map(f => f.path);
    }

    const review = await Review.create(reviewData);

    // Update room rating
    const allReviews = await Review.find({ room: req.params.id, isApproved: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Room.findByIdAndUpdate(req.params.id, { rating: avgRating, reviewCount: allReviews.length });

    await review.populate('student', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNearbyRooms = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat) || 22.7225;
    const lng = parseFloat(req.query.lng) || 88.4821;
    const radius = parseFloat(req.query.radius) || 3;

    const rooms = await Room.find({
      status: 'approved', availability: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius * 1000,
        },
      },
    }).populate('owner', 'name avatar avgResponseTime').limit(20);

    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
