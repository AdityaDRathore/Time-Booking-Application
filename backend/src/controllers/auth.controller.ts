//------------------Authentication endpoints--------------------------------

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { errorTypes } from '../utils/errors'; // Changed from 'src/utils/errors'

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8), // Added min length for password
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  organizationId: z.string().uuid().optional(), // Added organizationId, assuming UUID
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string(),
});

export class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const userData = {
        user_email: validatedData.email,
        user_password: validatedData.password,
        user_name: `${validatedData.firstName} ${validatedData.lastName}`,
        organizationId: validatedData.organizationId,
      };

      const user = await authService.register(userData);
      sendSuccess(res, { user }, 201);
    } catch (error) {
      if (error instanceof z.ZodError) { // Handle ZodError specifically
        return sendError(
          res,
          'Validation error',
          errorTypes.BAD_REQUEST,
          'VALIDATION_ERROR',
          error.errors, // Pass Zod issues for detailed error response
        );
      }
      next(error); // Pass other errors to the global error handler
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { accessToken, user, refreshToken } = await authService.login(email, password);

      if (refreshToken) {
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/api/auth/refresh-token', // Ensure this path is correct
          // maxAge: parseDurationToSeconds(config.REFRESH_TOKEN_EXPIRES_IN) * 1000, // Use your helper
        });
      }
      sendSuccess(res, { user, accessToken }); // Send user and accessToken
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          'Validation error',
          errorTypes.BAD_REQUEST,
          'VALIDATION_ERROR',
          error.errors,
        );
      }
      next(error);
    }
  }

  // Refresh access token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return sendError(res, 'No refresh token provided', errorTypes.UNAUTHORIZED);
      }

      const newAccessToken = await authService.refreshToken(refreshToken);
      sendSuccess(res, { accessToken: newAccessToken });
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  async logout(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      // Add type assertion since user comes from auth middleware
      const userId = (req as Request & { user: { id: string } }).user.id;
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await authService.logout(userId, refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Request password reset
  async requestPasswordReset(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      await authService.requestPasswordReset(email);

      // Don't reveal if email exists or not for security
      sendSuccess(res, {
        message: 'If your email is registered, you will receive a password reset link',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          'Validation error',
          errorTypes.BAD_REQUEST,
          'VALIDATION_ERROR',
          error.errors,
        );
      }
      next(error);
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
    try {
      const { token, newPassword } = passwordResetSchema.parse(req.body);
      await authService.resetPassword(token, newPassword);

      sendSuccess(res, { message: 'Password has been reset successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(
          res,
          'Validation error',
          errorTypes.BAD_REQUEST,
          'VALIDATION_ERROR',
          error.errors,
        );
      }
      next(error);
    }
  }
}

export default new AuthController();
