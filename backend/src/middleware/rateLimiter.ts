// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Global rate limiter
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// User-specific rate limiter
export const userRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  keyGenerator: (req: Request): string => {
    return String(req.user?.id ?? req.ip);
  },
  message: 'Too many requests from this user, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});
