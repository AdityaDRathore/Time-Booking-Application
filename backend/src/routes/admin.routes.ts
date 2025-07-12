import { Router } from 'express';
import { authenticate, checkRole } from '@src/middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  getAdminLabs,
  createAdminLab,       // ✅
  getAdminBookings,
  getAdminUsers,
  createBookingForUser,
  getWaitlistForSlot,
  getTimeSlotsForLab,
  getAdminUserDetails,
  updateBookingStatus,
  getAdminReports,
  deleteAdminLab,
} from '@src/controllers/admin.controller';

const router = Router();

router.use(authenticate);
router.use(checkRole([UserRole.ADMIN]));

// Labs
router.get('/labs', getAdminLabs);
router.post('/labs', createAdminLab); // ✅ Added route
router.delete('/labs/:labId', deleteAdminLab); // ✅ add this line
router.get('/labs/:labId/time-slots', getTimeSlotsForLab);

// Bookings
router.get('/bookings', getAdminBookings);
router.post('/bookings', createBookingForUser);
router.patch('/bookings/:bookingId/status', updateBookingStatus);

// Users
router.get('/users', getAdminUsers);
router.get('/users/:userId', getAdminUserDetails);

// Waitlist
router.get('/waitlists/:slotId', getWaitlistForSlot);

// Reports
router.get('/reports', getAdminReports);

export default router;
