//--------------------Authentication middleware-------------------------------

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { AppError, errorTypes } from '../utils/errors';
import { sendError } from '../utils/response';
import rateLimit from 'express-rate-limit';

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
      return sendError(res, 'Authentication required', errorTypes.UNAUTHORIZED);
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyAccessToken(token);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, user_role: true, user_email: true, organizationId: true }, // Added user_email and organizationId to select
    });

    if (!user) {
      return sendError(res, 'User not found', errorTypes.UNAUTHORIZED);
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
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, 'Authentication failed', errorTypes.UNAUTHORIZED);
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
