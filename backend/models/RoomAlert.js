const mongoose = require('mongoose');

const roomAlertSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'My Alert' },  // user-given name

  // Filter criteria
  maxRent: { type: Number },
  type: { type: String },  // room type
  gender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
  amenities: [String],
  area: { type: String },

  // Delivery
  notifyEmail: { type: Boolean, default: true },
  notifyPush: { type: Boolean, default: true },

  isActive: { type: Boolean, default: true },
  lastNotified: { type: Date },
  matchCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('RoomAlert', roomAlertSchema);
