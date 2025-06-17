// src/routes/index.ts

import { Router } from 'express';

// Route Modules
import superadminRoutes from './superadmin';
import userRoutes from './user.routes';
import labRoutes from './lab.routes';
import timeslotRoutes from './timeslot.routes';
import bookingRoutes from './booking.routes';
import waitlistRoutes from './waitlist.routes';
import notificationRoutes from '@/routes/notification.routes';

// Middleware
import { authenticate, checkRole, loginRateLimiter } from '../middleware/auth.middleware';
import { notFoundHandler, globalErrorHandler } from '../middleware/errorHandler';

const router = Router();
const v1 = Router();

/**
 * Apply global middlewares for v1 if needed
 * Example: Authentication middleware
 * You can also apply per-route inside each route file instead.
 */
v1.use('/labs', authenticate, labRoutes); // Apply auth

/**
 * Versioned API Routes: /api/v1/*
 */
v1.use('/superadmin', superadminRoutes);
v1.use('/users', userRoutes);
v1.use('/labs', labRoutes);
v1.use('/timeslots', timeslotRoutes);
v1.use('/bookings', bookingRoutes);
v1.use('/waitlist', waitlistRoutes);
v1.use('/notifications', notificationRoutes);

// Mount v1 routes under /api/v1
router.use('/api/v1', v1);

// 404 Not Found Handler for unmatched routes
router.use(notFoundHandler);

// Global Error Handler
router.use(globalErrorHandler);

export default router;
