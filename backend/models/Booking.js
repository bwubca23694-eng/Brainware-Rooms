const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  moveInDate: { type: Date, required: true },
  duration: { type: Number, required: true }, // months
  totalAmount: { type: Number },
  message: String,
  ownerNote: String,
  visitDate: Date,
  visitConfirmed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
