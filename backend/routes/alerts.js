const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const RoomAlert = require('../models/RoomAlert');

// Get my alerts
router.get('/', protect, authorize('student'), async (req, res) => {
  try {
    const alerts = await RoomAlert.find({ student: req.user._id }).sort('-createdAt');
    res.json({ success: true, alerts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Create alert
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const count = await RoomAlert.countDocuments({ student: req.user._id, isActive: true });
    if (count >= 5) return res.status(400).json({ success: false, message: 'Max 5 active alerts allowed' });
    const alert = await RoomAlert.create({ ...req.body, student: req.user._id });
    res.status(201).json({ success: true, alert });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Toggle alert on/off
router.patch('/:id/toggle', protect, authorize('student'), async (req, res) => {
  try {
    const alert = await RoomAlert.findOne({ _id: req.params.id, student: req.user._id });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    alert.isActive = !alert.isActive;
    await alert.save();
    res.json({ success: true, alert });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete alert
router.delete('/:id', protect, authorize('student'), async (req, res) => {
  try {
    await RoomAlert.findOneAndDelete({ _id: req.params.id, student: req.user._id });
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
