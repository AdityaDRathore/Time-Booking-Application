import { Router } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/booking.controller';
import { authenticate, checkRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';
// ✅ Use this import
import validate from '@/middleware/validate.middleware';
import { createBookingSchema } from '@/validation/booking.validation';

const router = Router();

// Authentication for all routes
router.use(authenticate);

// Create a booking (Only User role)
router.post('/', checkRole([UserRole.USER]), validate(createBookingSchema), createBooking);

// Get all bookings (Admin or Superadmin can view all)
router.get('/', checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), getAllBookings);

// Get specific booking by ID
router.get('/:id', getBookingById);

// Cancel a booking
router.delete('/:id', cancelBooking);

export default router;
