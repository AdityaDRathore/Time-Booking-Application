import { Router } from 'express';
import { authenticate, checkRole } from '@src/middleware/auth.middleware';
import { UserRole } from '@prisma/client';
import {
  getAdminLabs,
  createAdminLab,
  createTimeSlotForLab,
  createBulkTimeSlots,
  updateTimeSlot,     // ✅
  getAdminBookings,
  getAdminUsers,
  createBookingForUser,
  getWaitlistForSlot,
  getTimeSlotsForLab,
  getAdminUserDetails,
  getAdminLabWaitlist,
  updateBookingStatus,
  getAdminReports,
  deleteAdminLab,
  deleteTimeSlot,
  removeWaitlistEntry,
  promoteWaitlistEntry,
} from '@src/controllers/admin.controller';

const router = Router();

router.use(authenticate);
router.use(checkRole([UserRole.ADMIN]));

// Labs
router.get('/labs', getAdminLabs);
router.post('/labs', createAdminLab); // ✅ Added route
router.delete('/labs/:labId', deleteAdminLab); // ✅ add this line
router.get('/labs/:labId/time-slots', getTimeSlotsForLab);
router.post('/labs/:labId/time-slots', createTimeSlotForLab);
router.post('/labs/:labId/time-slots/bulk', createBulkTimeSlots);
router.put('/time-slots/:id', updateTimeSlot); // ✅ Add this
router.delete('/time-slots/:id', deleteTimeSlot);

// Bookings
router.get('/bookings', getAdminBookings);
router.post('/bookings', createBookingForUser);
router.patch('/bookings/:bookingId/status', updateBookingStatus);

// Users
router.get('/users', getAdminUsers);
router.get('/users/:userId', getAdminUserDetails);

// Waitlist
router.get('/waitlists/:slotId', getWaitlistForSlot);
router.get('/labs/:labId/waitlist', getAdminLabWaitlist); // ✅ NEW
router.delete('/waitlists/:waitlistId', removeWaitlistEntry); // ✅ NEW
router.post('/waitlists/:slotId/promote', promoteWaitlistEntry);

// Reports
router.get('/reports', getAdminReports);

export default router;
