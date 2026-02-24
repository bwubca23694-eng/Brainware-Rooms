const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [String],
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ room: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
