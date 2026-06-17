
const fs = require('fs');
const path = require('path');
const transporter = require('../config/mailer');

// Cache the template in memory after first read
let templateCache = null;


const loadTemplate = () => {
  if (!templateCache) {
    templateCache = fs.readFileSync(
      path.join(__dirname, '../templates/resetPassword.html'),
      'utf8'
    );
  }
  return templateCache;
};


const sendPasswordResetEmail = async ({ to, name, resetLink, expiryMins = 15 }) => {
  const html = loadTemplate()
    .replace(/{{name}}/g, name)
    .replace(/{{resetLink}}/g, resetLink)
    .replace(/{{expiryMins}}/g, expiryMins)
    .replace(/{{supportEmail}}/g, process.env.SMTP_USER || 'support@yourapp.com');

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Auth App" <noreply@yourapp.com>',
    to,
    subject: 'Reset Your Password — expires in 15 minutes',
    html,
    // Plain-text fallback for email clients that don't render HTML
    text: `Hi ${name},\n\nReset your password here (valid for ${expiryMins} minutes):\n${resetLink}\n\nIf you did not request this, ignore this email.`,
  });

  // In development, Ethereal shows a preview URL in the console
  if (process.env.NODE_ENV !== 'production') {
    const nodemailer = require('nodemailer');
    console.log('📧 Email preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
};

module.exports = { sendPasswordResetEmail };
