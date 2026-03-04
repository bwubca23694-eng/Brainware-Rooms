const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const { protect } = require('../middleware/auth');

// Subscribe to push notifications
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { subscription, preferences } = req.body;
    if (!subscription?.endpoint) {
      return res.status(400).json({ success: false, message: 'Invalid subscription' });
    }
    await PushSubscription.findOneAndUpdate(
      { user: req.user._id, 'subscription.endpoint': subscription.endpoint },
      { user: req.user._id, subscription, preferences: preferences || {} },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Push subscription saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Unsubscribe
router.delete('/unsubscribe', protect, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await PushSubscription.deleteMany({
      user: req.user._id,
      ...(endpoint ? { 'subscription.endpoint': endpoint } : {}),
    });
    res.json({ success: true, message: 'Unsubscribed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get VAPID public key (needed by frontend to subscribe)
router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

// Update preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    await PushSubscription.updateMany(
      { user: req.user._id },
      { preferences: req.body }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
