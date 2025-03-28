//---------------------Routes for authentication---------------------

import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate, loginRateLimiter } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', loginRateLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);

export default router;