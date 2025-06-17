import { Router } from 'express';
import {
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  deleteTimeSlot,
} from '../controllers/timeslot.controller';
import { validateRequest } from '../middleware/validateRequest';
import { timeSlotSchema } from '../validators/timeslot.validator';

const router = Router();

router.post('/', validateRequest(timeSlotSchema), createTimeSlot);
router.get('/', getAllTimeSlots);
router.get('/:id', getTimeSlotById);
router.delete('/:id', deleteTimeSlot);

export default router;
