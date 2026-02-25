const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const msg = {
    to,
    from: {
      email: process.env.SMTP_FROM, // verified sender in SendGrid
      name: "Brainware Rooms"
    },
    subject,
    html,
  };

  return sgMail.send(msg);
};

// ================= VERIFICATION EMAIL =================
exports.sendVerificationEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  return sendEmail({
    to: user.email,
    subject: "Verify your Brainware Rooms account",
    html: `
      <div style="font-family: Arial; max-width:600px; margin:auto;">
        <h2>Hi ${user.name},</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${url}" 
           style="display:inline-block;padding:10px 20px;background:#e94560;color:#fff;text-decoration:none;border-radius:5px;">
           Verify Email
        </a>
        <p style="margin-top:20px;font-size:12px;color:#666;">
          This link expires in 24 hours.
        </p>
      </div>
    `,
  });
};

// ================= PASSWORD RESET =================
exports.sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  return sendEmail({
    to: user.email,
    subject: "Reset your Brainware Rooms password",
    html: `
      <div style="font-family: Arial; max-width:600px; margin:auto;">
        <h2>Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>Click below to reset your password:</p>
        <a href="${url}" 
           style="display:inline-block;padding:10px 20px;background:#e94560;color:#fff;text-decoration:none;border-radius:5px;">
           Reset Password
        </a>
        <p style="margin-top:20px;font-size:12px;color:#666;">
          This link expires in 1 hour.
        </p>
      </div>
    `,
  });
};

// ================= BOOKING NOTIFICATION =================
exports.sendBookingNotification = async (email, name, type, details) => {
  const messages = {
    new_booking: {
      subject: "New Booking Request",
      body: `You have a new booking request from ${details.studentName} for ${details.roomTitle}.`
    },
    booking_confirmed: {
      subject: "Booking Confirmed!",
      body: `Your booking for ${details.roomTitle} has been confirmed.`
    },
    booking_rejected: {
      subject: "Booking Update",
      body: `Your booking for ${details.roomTitle} was not accepted. ${details.note || ''}`
    },
  };

  const msg = messages[type];

  return sendEmail({
    to: email,
    subject: msg.subject,
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2>Hi ${name},</h2>
        <p>${msg.body}</p>
        <p>
          <a href="${process.env.FRONTEND_URL}">
            Login to Brainware Rooms
          </a>
        </p>
      </div>
    `,
  });
};
