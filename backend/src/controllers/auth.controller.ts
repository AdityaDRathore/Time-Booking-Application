import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { errorTypes } from '../utils/errors';
import { prisma } from '@/repository/base/transaction';
import { NotificationType } from '@prisma/client';

// Validation Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
  org_name: z.string().optional(),
  org_type: z.string().optional(),
  org_location: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'ADMIN') {
    if (!data.org_name) {
      ctx.addIssue({ path: ['org_name'], message: 'Organization name is required', code: z.ZodIssueCode.custom });
    }
    if (!data.org_type) {
      ctx.addIssue({ path: ['org_type'], message: 'Organization type is required', code: z.ZodIssueCode.custom });
    }
    if (!data.org_location) {
      ctx.addIssue({ path: ['org_location'], message: 'Organization location is required', code: z.ZodIssueCode.custom });
    }
  }
});


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const superAdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const data = registerSchema.parse(req.body);

      const result = await authService.register({
        user_email: data.email,
        user_password: data.password,
        user_name: `${data.firstName} ${data.lastName}`,
        user_role: data.role,
        org_name: data.org_name,
        org_type: data.org_type,
        org_location: data.org_location,
      });

      return sendSuccess(res, result, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', errorTypes.BAD_REQUEST, 'VALIDATION_ERROR', error.errors);
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { accessToken, refreshToken, user } = await authService.login(email, password);

      // ✅ First-time login check
      if (!user.has_logged_in) {
        await prisma.notification.create({
          data: {
            user_id: user.id,
            notification_type: NotificationType.GENERAL_ANNOUNCEMENT,
            notification_message: `🎉 Welcome ${user.user_name || 'User'}! Thanks for joining Time-Booking.`,
          },
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { has_logged_in: true },
        });

        // Optional: update in-memory user object
        user.has_logged_in = true;
      }

      // ✅ Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(res, { accessToken, user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', errorTypes.BAD_REQUEST, 'VALIDATION_ERROR', error.errors);
      }
      next(error);
    }
  }

  async superAdminLogin(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { email, password } = superAdminLoginSchema.parse(req.body);
      const { accessToken, refreshToken, user: superAdmin } = await authService.superAdminLogin(email, password);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,       // ✅ must be false in dev over HTTP
        sameSite: 'lax',     // ✅ lax works with cross-origin GETs and POSTs
        path: '/',           // ✅ applies to all routes
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });


      return sendSuccess(res, { accessToken, user: superAdmin });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', errorTypes.BAD_REQUEST, 'VALIDATION_ERROR', error.errors);
      }
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return sendError(res, 'No refresh token provided', errorTypes.UNAUTHORIZED);
      }

      // 🔁 AuthService should return both new accessToken and user
      const { accessToken, user } = await authService.refreshToken(refreshToken);

      return sendSuccess(res, { accessToken, user });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const userId = (req as Request & { user: { id: string } }).user.id;
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await authService.logout(userId, refreshToken);
      }
      res.clearCookie('refreshToken');
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      await authService.requestPasswordReset(email);
      return sendSuccess(res, {
        message: 'If your email is registered, you will receive a password reset link',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', errorTypes.BAD_REQUEST, 'VALIDATION_ERROR', error.errors);
      }
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { token, newPassword } = passwordResetSchema.parse(req.body);
      await authService.resetPassword(token, newPassword);
      return sendSuccess(res, { message: 'Password has been reset successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, 'Validation error', errorTypes.BAD_REQUEST, 'VALIDATION_ERROR', error.errors);
      }
      next(error);
    }
  }
}

export default new AuthController();
