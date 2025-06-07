//--------------------Authentication middleware-------------------------------

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { AppError, errorTypes } from '../utils/errors';
import { sendError } from '../utils/response';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken'; // Ensure jwt is imported for specific error types

const prisma = new PrismaClient();

// Use module augmentation instead of namespace
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: UserRole;
      email?: string; // Added email
      organizationId?: string | null; // Added organizationId
    };
  }
}

// Authenticate JWT token middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // Corrected: Pass the errorCode 'AUTH_REQUIRED'
      return sendError(res, 'Authentication required', errorTypes.UNAUTHORIZED, 'AUTH_REQUIRED');
    }

    const token = extractTokenFromHeader(authHeader); // This might throw if header is malformed
    const decoded = verifyAccessToken(token); // This will throw if token is invalid/expired

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, user_role: true, user_email: true, organizationId: true },
    });

    if (!user) {
      // Corrected: Pass the errorCode 'USER_NOT_FOUND'
      return sendError(res, 'User not found', errorTypes.UNAUTHORIZED, 'USER_NOT_FOUND');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      role: user.user_role,
      email: user.user_email, // Added email
      organizationId: user.organizationId, // Added organizationId
    };

    next();
  } catch (error) {
    // Log the error for debugging purposes
    // console.error('Authentication error details:', error);

    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode, error.errorCode);
    }
    // Handle specific JWT errors to provide clearer messages
    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 'Invalid token', errorTypes.UNAUTHORIZED, 'INVALID_TOKEN');
    }
    if (error instanceof jwt.TokenExpiredError) {
      return sendError(res, 'Token expired', errorTypes.UNAUTHORIZED, 'TOKEN_EXPIRED');
    }
    // Fallback for other unexpected errors
    return sendError(res, 'Authentication failed due to an unexpected server error', errorTypes.INTERNAL_SERVER, 'AUTH_UNEXPECTED_ERROR');
  }
};

// Check role middleware
export const checkRole = (
  roles: UserRole[],
): ((req: Request, res: Response, next: NextFunction) => Response | void) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return sendError(res, 'Authentication required', errorTypes.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', errorTypes.FORBIDDEN);
    }

    next();
  };
};

// Rate limiting for login attempts
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later',
  handler: (req, res) => {
    sendError(res, 'Too many login attempts, please try again later', errorTypes.TOO_MANY_REQUESTS);
  },
});
