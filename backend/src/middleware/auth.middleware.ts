import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { AppError, errorTypes } from '../utils/errors';
import { sendError } from '../utils/response';
import { config } from '../config/environment';
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger';

const prisma = new PrismaClient();

/* ─────────────────────────────────────────────
   🔐 Authenticate JWT Access Token
────────────────────────────────────────────── */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    if (process.env.NODE_ENV === 'test') {
      const testUserId = req.headers['x-test-user-id'] as string | undefined;
      const testUserRole = req.headers['x-test-user-role'] as UserRole | undefined;

      if (testUserId && testUserRole) {
        req.user = {
          id: testUserId,
          role: testUserRole,
          email: 'test@example.com', // dummy email
        };
        return next();
      }
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return sendError(res, 'Authentication required', errorTypes.UNAUTHORIZED);
    }

    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyAccessToken(token, config.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        user_role: true,
        user_email: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', errorTypes.UNAUTHORIZED);
    }

    req.user = {
      id: user.id,
      role: user.user_role,
      email: user.user_email, // ✅ Pass email to req.user
    };

    next();
  } catch (error) {
    logger.warn('❌ JWT auth failed', error);
    return sendError(res, 'Authentication failed', errorTypes.UNAUTHORIZED);
  }
};

/* ─────────────────────────────────────────────
   👮 Role-Based Access Control Middleware
────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   🚨 Login Rate Limiter Middleware
────────────────────────────────────────────── */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later',
  handler: (req, res) => {
    logger.warn('🚨 Too many login attempts from:', req.ip);
    sendError(res, 'Too many login attempts, please try again later', errorTypes.TOO_MANY_REQUESTS);
  },
});
