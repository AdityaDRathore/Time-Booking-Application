import { Router } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
  getUserBookings, // ✅ NEW
} from '@src/controllers/booking.controller';
import { authenticate, checkRole } from '@src/middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/bookings/me:
 *   get:
 *     summary: Get bookings for current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *       401:
 *         description: Unauthorized
 */
router.get('/me', checkRole([UserRole.USER, UserRole.SUPER_ADMIN]), getUserBookings);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management and operations
 */

/**
 * @swagger
 * /api/v1/bookings:
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
 *             type: object
 *             properties:
 *               timeSlotId:
 *                 type: string
 *                 example: "slot123"
 *               purpose:
 *                 type: string
 *                 example: "Lab Work"
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error or active booking exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', checkRole([UserRole.USER]), createBooking);

/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get all bookings (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', checkRole([UserRole.ADMIN]), getAllBookings);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking found
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.get('/:id', getBookingById);

/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   delete:
 *     summary: Cancel a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking canceled successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', cancelBooking);

export default router;
