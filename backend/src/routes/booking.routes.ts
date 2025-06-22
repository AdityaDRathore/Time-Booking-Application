import { Router } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/booking.controller';
import { authenticate, checkRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import validate from '@src/middleware/validate.middleware';
import { createBookingSchema } from '@src/validation/booking.validation';

const router = Router();

// ✅ Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBooking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', checkRole([UserRole.USER]), validate(createBookingSchema), createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings (Admin or Superadmin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 *       403:
 *         description: Forbidden
 */
router.get('/', checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), getAllBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 */
router.get('/:id', getBookingById);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', cancelBooking);

export default router;
