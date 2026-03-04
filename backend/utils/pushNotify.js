const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// Lazy-configure: called on first use, after dotenv has loaded
let configured = false;
function ensureConfigured() {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT || 'mailto:admin@bwurooms.com';
  if (!pub || !priv) return false;
  webpush.setVapidDetails(sub, pub, priv);
  configured = true;
  return true;
}

/**
 * Send push to a single user (all their subscribed devices)
 */
exports.sendToUser = async (userId, payload) => {
  if (!ensureConfigured()) return; // silently skip — VAPID not set yet
  try {
    const subs = await PushSubscription.find({ user: userId });
    if (!subs.length) return;
    await Promise.allSettled(
      subs.map(s =>
        webpush.sendNotification(s.subscription, JSON.stringify(payload))
          .catch(async err => {
            if (err.statusCode === 410) {
              await PushSubscription.deleteOne({ _id: s._id });
            }
          })
      )
    );
  } catch (err) {
    console.error('Push sendToUser error:', err.message);
  }
};

/**
 * Broadcast push to all subscribers with a preference enabled
 */
exports.sendBroadcast = async (preference, payload) => {
  if (!ensureConfigured()) return;
  try {
    const subs = await PushSubscription.find({ [`preferences.${preference}`]: true });
    for (const s of subs) {
      try {
        await webpush.sendNotification(s.subscription, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 410) await PushSubscription.deleteOne({ _id: s._id });
      }
    }
  } catch (err) {
    console.error('Push broadcast error:', err.message);
  }
};
