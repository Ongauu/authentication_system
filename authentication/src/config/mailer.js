// src/config/mailer.js
// ---------------------------------------------------------------------------
// Creates and exports a reusable Nodemailer transporter.
//
// In development: point SMTP_* env vars at Ethereal (https://ethereal.email)
//   — a free fake SMTP server that captures emails without delivering them.
// In production:  swap in real credentials (SendGrid, AWS SES, Mailgun …).
// ---------------------------------------------------------------------------

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  // secure: true uses port 465 (TLS), false uses STARTTLS on 587
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection on startup (helpful for catching misconfigured env vars)
transporter.verify((error) => {
  if (error) {
    console.error('❌ Mailer configuration error:', error.message);
  } else {
    console.log('✅ Mailer ready');
  }
});

module.exports = transporter;
