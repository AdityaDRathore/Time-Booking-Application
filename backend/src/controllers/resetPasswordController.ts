import { Request, Response } from 'express';
import { prisma } from '@/repository/base/transaction';
import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/response';
import bcrypt from 'bcrypt';

const TOKEN_EXPIRY_HOURS = 1;

export const sendResetLink = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { user_email: email } });
    if (!user) return sendError(res, 'User not found', 404);

    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        user_id: user.id,
        expires_at,
      },
    });

    // TODO: Replace with actual email logic
    console.log(`Reset Link: http://localhost:3000/reset-password?token=${token}`);

    return sendSuccess(res, 'Reset link sent');
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

    const hashed = await bcrypt.hash(new_password, 10);
    await prisma.user.update({
      where: { id: resetToken.user_id },
      data: { user_password: hashed },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return sendSuccess(res, 'Password reset successful');
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return sendError(res, 'Failed to reset password', 500);
  }
};
