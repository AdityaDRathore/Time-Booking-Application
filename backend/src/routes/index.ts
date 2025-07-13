// src/routes/index.ts

import { Router } from 'express';

// Route Modules
import superAdminRoutes from './superadmin.routes';
import adminRoutes from './admin.routes';
import adminLabRoutes from './adminLab.routes';
import userRoutes from './user.routes';
import labRoutes from './lab.routes';
import timeslotRoutes from './timeslot.routes';
import bookingRoutes from './booking.routes';
import waitlistRoutes from './waitlist.routes';
import notificationRoutes from './notification.routes';
import testRoutes from './test.routes'; // ✅ add this

// Middleware
import { authenticate } from '../middleware/auth.middleware';
import { notFoundHandler, globalErrorHandler } from '../middleware/errorHandler';
import authRoutes from './auth.routes';

const router = Router();
const v1 = Router();

/**
 * Apply per-route middlewares (e.g., authentication, role check)
 */
v1.use('/auth', authRoutes);
v1.use('/superadmin', superAdminRoutes);
v1.use('/admin', adminRoutes);
v1.use('/users', authenticate, userRoutes);
v1.use('/labs', authenticate, labRoutes);
v1.use('/admin/labs', authenticate, adminLabRoutes);
v1.use('/timeslots', authenticate, timeslotRoutes);
v1.use('/bookings', authenticate, bookingRoutes);
v1.use('/waitlist', authenticate, waitlistRoutes);
v1.use('/notifications', authenticate, notificationRoutes);
v1.use('/test', testRoutes); // ✅ mount here


/**
 * Mount versioned routes
 */
router.use('/api/v1', v1);

// 404 Not Found Handler
router.use(notFoundHandler);

// Global Error Handler
router.use(globalErrorHandler);

export default router;
