import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { errorTypes } from '../utils/errors';

// ------------------ Validation Schemas ------------------
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
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

// ------------------ Controller Class ------------------
export class AuthController {
  // 👉 Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const userData = {
        user_email: validatedData.email,
        user_password: validatedData.password,
        user_name: `${validatedData.firstName} ${validatedData.lastName}`,
      };
      const user = await authService.register(userData);
      return sendSuccess(res, user, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          'Validation error',
          errorTypes.BAD_REQUEST,
          'VALIDATION_ERROR',
          error.errors
        );
      }
      next(error);
    }
  }

  // 👉 Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { accessToken, user } = await authService.login(email, password);
      return sendSuccess(res, { accessToken, user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          'Validation error',
          errorTypes.BAD_REQUEST,
          'VALIDATION_ERROR',
          error.errors
        );
      }
      next(error);
    }
  }

  // 👉 Super admin login
  async superAdminLogin(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { email, password } = superAdminLoginSchema.parse(req.body);
      const { accessToken, user: superAdmin } = await authService.superAdminLogin(email, password);
      return sendSuccess(res, { accessToken, superAdmin });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          'Validation error',
          errorTypes.BAD_REQUEST,
          'VALIDATION_ERROR',
          error.errors
        );
      }
      next(error);
    }
  }

  // 👉 Refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return sendError(res, 'No refresh token provided', errorTypes.UNAUTHORIZED);
      }
      const newAccessToken = await authService.refreshToken(refreshToken);
      return sendSuccess(res, { accessToken: newAccessToken });
    } catch (error) {
      next(error);
    }
  }

  // 👉 Logout
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

  // 👉 Request password reset
  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      await authService.requestPasswordReset(email);
      return sendSuccess(res, {
        message: 'If your email is registered, you will receive a password reset link',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          'Validation error',
          errorTypes.BAD_REQUEST,
          'VALIDATION_ERROR',
          error.errors
        );
      }
      next(error);
    }
  }

  // 👉 Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { token, newPassword } = passwordResetSchema.parse(req.body);
      await authService.resetPassword(token, newPassword);
      return sendSuccess(res, { message: 'Password has been reset successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          'Validation error',
          errorTypes.BAD_REQUEST,
          'VALIDATION_ERROR',
          error.errors
        );
      }
      next(error);
    }
  }
}

export default new AuthController();
