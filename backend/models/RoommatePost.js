const mongoose = require('mongoose');

const roommatePostSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },

  // What they're looking for
  lookingFor: { type: String, enum: ['roommate', 'room'], default: 'roommate' }, // want roommate OR have a room
  preferredArea: { type: String, required: true },
  budget: { type: Number, required: true }, // max budget per person
  roomType: { type: String, enum: ['single', 'double', 'triple', '1bhk', '2bhk', 'hostel', 'any'], default: 'any' },

  // About themselves
  gender: { type: String, enum: ['male', 'female', 'any'], required: true },
  genderPreference: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
  semester: { type: String },  // e.g. "3rd Semester"
  department: { type: String },
  moveInDate: { type: Date },

  // Lifestyle tags
  lifestyle: [{ type: String, enum: ['vegetarian', 'non-veg', 'early-riser', 'night-owl', 'studious', 'social', 'quiet', 'non-smoker', 'smoker'] }],

  // Contact
  whatsapp: { type: String },
  contactEmail: { type: String },

  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
}, { timestamps: true });

roommatePostSchema.index({ preferredArea: 'text', description: 'text', title: 'text' });
roommatePostSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model('RoommatePost', roommatePostSchema);
