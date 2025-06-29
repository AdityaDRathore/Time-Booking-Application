import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { errorTypes } from '../utils/errors';

// Validation Schemas
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

export class AuthController {
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
        return sendError(res, 'Validation error', errorTypes.BAD_REQUEST, 'VALIDATION_ERROR', error.errors);
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { accessToken, refreshToken, user } = await authService.login(email, password);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,       // ✅ must be false in dev over HTTP
        sameSite: 'lax',     // ✅ lax works with cross-origin GETs and POSTs
        path: '/',           // ✅ applies to all routes
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


      return sendSuccess(res, { accessToken, superAdmin });
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
