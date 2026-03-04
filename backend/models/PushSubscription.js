const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscription: {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: String,
      auth: String,
    },
  },
  // What events this user wants notified about
  preferences: {
    bookingUpdates: { type: Boolean, default: true },
    newRoomAlerts: { type: Boolean, default: true },
    roommateMatches: { type: Boolean, default: true },
  },
}, { timestamps: true });

// One subscription per user per endpoint
pushSubscriptionSchema.index({ user: 1, 'subscription.endpoint': 1 }, { unique: true });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
