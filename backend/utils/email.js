// ✅ Gmail API via OAuth2 — works on Render (no SMTP port needed)
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

/**
 * Creates a fresh Nodemailer transporter using Gmail OAuth2.
 * Fetches a new access token from the refresh token on every call,
 * so it never expires and works reliably on Render / serverless hosting.
 */
const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.error('❌ Gmail OAuth2 - failed to get access token:', err);
        reject(err);
      } else {
        resolve(token);
      }
    });
  });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = await createTransporter();
  return transporter.sendMail({
    from: `"Brainware Rooms" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
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
          <a href="${url}" style="display:inline-block; background:#e94560; color:white; padding:12px 30px; border-radius:6px; text-decoration:none; font-weight:bold;">Verify Email</a>
          <p style="margin-top:20px; color:#666; font-size:12px;">Link expires in 24 hours. If you didn't register, ignore this email.</p>
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
          <a href="${url}" style="display:inline-block; background:#e94560; color:white; padding:12px 30px; border-radius:6px; text-decoration:none; font-weight:bold;">Reset Password</a>
          <p style="margin-top:20px; color:#666; font-size:12px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  });
};

exports.sendBookingNotification = async (email, name, type, details) => {
  const messages = {
    new_booking: { subject: 'New Booking Request', body: `You have a new booking request from ${details.studentName} for ${details.roomTitle}.` },
    booking_confirmed: { subject: 'Booking Confirmed!', body: `Your booking for ${details.roomTitle} has been confirmed by the owner.` },
    booking_rejected: { subject: 'Booking Update', body: `Your booking request for ${details.roomTitle} was not accepted. ${details.note || ''}` },
  };
  const msg = messages[type];
  return sendEmail({
    to: email,
    subject: msg.subject,
    html: `<div style="font-family:Arial,sans-serif;padding:20px;"><h2>Hi ${name},</h2><p>${msg.body}</p><p>Login to <a href="${process.env.FRONTEND_URL}">Brainware Rooms</a> for details.</p></div>`,
  });
};
