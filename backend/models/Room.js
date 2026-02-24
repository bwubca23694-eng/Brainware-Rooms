const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['single', 'double', 'triple', 'dormitory', 'studio', 'hostel', '1bhk', '2bhk'],
    required: true 
  },
  rent: { type: Number, required: true },
  deposit: { type: Number, default: 0 },
  address: {
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, default: 'Barasat' },
    state: { type: String, default: 'West Bengal' },
    pincode: { type: String, required: true },
    landmark: String,
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [88.4821, 22.7225] }, // [lng, lat] near Brainware Univ
  },
  distanceFromCollege: { type: Number }, // in km
  images: [{ url: String, publicId: String }],
  amenities: [{
    type: String,
    enum: ['wifi', 'ac', 'parking', 'laundry', 'mess', 'security', 'cctv', 'gym', 'lift', 'powerbackup', 'furnished', 'semifurnished', 'kitchen', 'bathroom', 'balcony', 'tv', 'geyser', 'purifier']
  }],
  rules: {
    genderAllowed: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
    nonVeg: { type: Boolean, default: true },
    smoking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    visitors: { type: Boolean, default: true },
  },
  availability: { type: Boolean, default: true },
  availableFrom: { type: Date, default: Date.now },
  totalRooms: { type: Number, default: 1 },
  availableRooms: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'inactive'], default: 'pending' },
  adminNote: String,
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  contactPhone: String,
  contactWhatsapp: String,
}, { timestamps: true });

roomSchema.index({ location: '2dsphere' });
roomSchema.index({ status: 1, availability: 1 });
roomSchema.index({ rent: 1 });

module.exports = mongoose.model('Room', roomSchema);
