import { Request, Response } from 'express';
import { prisma } from '@/repository/base/transaction';
import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/response';
import bcrypt from 'bcrypt';
import { sendResetEmail } from '@/utils/email'; // adjust path if needed

const TOKEN_EXPIRY_HOURS = 1;

export const sendResetLink = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Clean up expired tokens
  await prisma.passwordResetToken.deleteMany({
    where: {
      expires_at: { lt: new Date() },
    },
  });

  try {
    const user = await prisma.user.findUnique({ where: { user_email: email } });
    if (!user) return sendError(res, 'User not found', 404);

    // Optional: prevent frequent reset link requests
    const existing = await prisma.passwordResetToken.findFirst({
      where: {
        user_id: user.id,
        expires_at: { gt: new Date() },
      },
    });
    // if (existing) return sendError(res, 'Reset link already sent. Try again later.', 429);

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Save token in DB
    await prisma.passwordResetToken.create({
      data: {
        token,
        user_id: user.id,
        expires_at,
      },
    });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendResetEmail(user.user_email, resetUrl);

    return sendSuccess(res, 'Reset link sent to your email');
  } catch (error) {
    console.error('Error in sendResetLink:', error);
    return sendError(res, 'Failed to send reset link', 500);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, new_password } = req.body;

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expires_at < new Date()) {
      return sendError(res, 'Token expired or invalid', 400);
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: resetToken.user_id },
      data: {
        user_password: hashedPassword,
      },
    });

    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return sendSuccess(res, 'Password reset successful');
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return sendError(res, 'Failed to reset password', 500);
  }
};
