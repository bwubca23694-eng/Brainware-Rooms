// Called when a new room is approved — checks all active alerts and notifies matching students
const RoomAlert = require('../models/RoomAlert');
const User = require('../models/User');
const { sendToUser } = require('./pushNotify');
const { sendEmail } = require('./email');

exports.checkAlertsForRoom = async (room) => {
  try {
    const query = { isActive: true };
    if (room.rent) query.$or = [{ maxRent: { $gte: room.rent } }, { maxRent: { $exists: false } }];

    const alerts = await RoomAlert.find(query).populate('student', 'name email');

    for (const alert of alerts) {
      // Check filter criteria match
      if (alert.type && alert.type !== room.type) continue;
      if (alert.gender && alert.gender !== 'any' && room.rules?.genderAllowed !== 'any' && alert.gender !== room.rules?.genderAllowed) continue;
      if (alert.area && room.address?.area && !room.address.area.toLowerCase().includes(alert.area.toLowerCase())) continue;
      if (alert.amenities?.length && !alert.amenities.every(a => room.amenities?.includes(a))) continue;

      // Push notification
      if (alert.notifyPush) {
        sendToUser(alert.student._id, {
          title: '🔔 Room Alert Match!',
          body: `"${room.title}" matches your alert "${alert.name}" — ₹${room.rent}/mo`,
          url: `/rooms/${room._id}`,
          tag: 'room-alert',
        });
      }

      // Email notification
      if (alert.notifyEmail && alert.student.email) {
        try {
          await sendEmail({
            to: alert.student.email,
            subject: `🏠 New Room Match: "${room.title}"`,
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
                <h2 style="color:#ff6b2b">New Room Matches Your Alert!</h2>
                <p>Hi ${alert.student.name},</p>
                <p>A new room matching your alert <strong>"${alert.name}"</strong> was just listed:</p>
                <div style="background:#f8f9ff;border-left:4px solid #ff6b2b;padding:16px;border-radius:8px;margin:16px 0">
                  <h3 style="margin:0 0 8px">${room.title}</h3>
                  <p style="margin:4px 0">📍 ${room.address?.area}, ${room.address?.city}</p>
                  <p style="margin:4px 0">💰 ₹${room.rent?.toLocaleString()}/month</p>
                  <p style="margin:4px 0">🏠 ${room.type}</p>
                </div>
                <a href="${process.env.FRONTEND_URL}/rooms/${room._id}"
                   style="display:inline-block;background:#ff6b2b;color:white;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:700">
                  View Room →
                </a>
                <p style="color:#888;font-size:12px;margin-top:24px">
                  You're receiving this because you set up a room alert on BWU Rooms.
                  <a href="${process.env.FRONTEND_URL}/dashboard">Manage alerts</a>
                </p>
              </div>
            `,
          });
        } catch (e) {}
      }

      // Update alert stats
      await RoomAlert.findByIdAndUpdate(alert._id, {
        lastNotified: new Date(),
        $inc: { matchCount: 1 }
      });
    }
  } catch (err) {
    console.error('Alert check error:', err.message);
  }
};
