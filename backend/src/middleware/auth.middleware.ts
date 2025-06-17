// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { AppError, errorTypes } from '../utils/errors';
import { sendError } from '../utils/response';
import rateLimit from 'express-rate-limit';

const prisma = new PrismaClient();

// Extend Express Request interface to include user
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: UserRole;
    };
  }
}

// Middleware: Authenticate JWT Token
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, user_role: true },
    });

    if (!user) {
      return sendError(res, 'User not found', errorTypes.UNAUTHORIZED);
    }

    req.user = {
      id: user.id,
      role: user.user_role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, 'Authentication failed', errorTypes.UNAUTHORIZED);
  }
};

// Middleware: Role-Based Access Control
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

// Middleware: Login Rate Limiter
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later',
  handler: (req, res) => {
    sendError(res, 'Too many login attempts, please try again later', errorTypes.TOO_MANY_REQUESTS);
  },
});
