// ✅ Brevo HTTP API — works on Render (uses port 443, never blocked)
const https = require('https');

/**
 * Send email via Brevo Transactional Email HTTP API.
 * No SMTP, no port issues — pure HTTPS POST to api.brevo.com
 */
const sendEmail = ({ to, subject, html }) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender: {
        name: 'Brainware Rooms',
        email: process.env.SMTP_FROM,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Email sent to ${to}`);
          resolve(JSON.parse(data));
        } else {
          console.error(`❌ Brevo API error ${res.statusCode}:`, data);
          reject(new Error(`Brevo API error: ${res.statusCode} — ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Failed to send email to ${to}:`, err.message);
      reject(err);
    });

    req.write(body);
    req.end();
  });
};

exports.sendVerificationEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify your Brainware Rooms account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: #e94560; margin: 0;">Brainware Rooms</h1>
          <p style="color: #a8a8b3; margin: 5px 0 0;">Room Finder for Brainware University Students</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1a1a2e;">Hi ${user.name},</h2>
          <p>Please verify your email address to get started:</p>
          <a href="${url}" style="display:inline-block; background:#e94560; color:white; padding:12px 30px; border-radius:6px; text-decoration:none; font-weight:bold;">
            Verify Email
          </a>
          <p style="margin-top:20px; color:#666; font-size:12px;">
            Link expires in 24 hours. If you didn't register, ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

exports.sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset your Brainware Rooms password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: #e94560; margin: 0;">Brainware Rooms</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1a1a2e;">Password Reset</h2>
          <p>Hi ${user.name}, click below to reset your password:</p>
          <a href="${url}" style="display:inline-block; background:#e94560; color:white; padding:12px 30px; border-radius:6px; text-decoration:none; font-weight:bold;">
            Reset Password
          </a>
          <p style="margin-top:20px; color:#666; font-size:12px;">
            Link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

exports.sendBookingNotification = async (email, name, type, details) => {
  const messages = {
    new_booking: {
      subject: 'New Booking Request',
      body: `You have a new booking request from <strong>${details.studentName}</strong> for <strong>${details.roomTitle}</strong>.`,
    },
    booking_confirmed: {
      subject: '🎉 Booking Confirmed!',
      body: `Your booking for <strong>${details.roomTitle}</strong> has been confirmed by the owner.`,
    },
    booking_rejected: {
      subject: 'Booking Update',
      body: `Your booking request for <strong>${details.roomTitle}</strong> was not accepted. ${details.note ? `<br>Owner note: ${details.note}` : ''}`,
    },
  };
  const msg = messages[type];
  if (!msg) return;
  return sendEmail({
    to: email,
    subject: msg.subject,
    html: `
      <div style="font-family:Arial,sans-serif; max-width:500px; margin:0 auto; padding:20px;">
        <h2 style="color:#e94560;">Brainware Rooms</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>${msg.body}</p>
        <a href="${process.env.FRONTEND_URL}" style="display:inline-block;margin-top:16px;background:#e94560;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          Open Dashboard
        </a>
      </div>
    `,
  });
};