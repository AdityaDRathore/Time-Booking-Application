// src/utils/email.ts
import nodemailer from 'nodemailer';

export const sendResetEmail = async (to: string, resetLink: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Lab Booking Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your password',
    html: `
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" style="padding:10px 15px;background:#f97316;color:white;border-radius:4px;text-decoration:none;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  });

  console.log('📧 Reset password email sent: %s', info.messageId);
};
