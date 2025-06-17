import { Router } from 'express';
import * as waitlistController from '../controllers/waitlist.controller';
import validate from '../middleware/validate.middleware';
import {
  joinWaitlistSchema,
  getWaitlistPositionSchema,
} from '@/validation/waitlist.validation';

const router = Router();

// Join the waitlist
router.post('/join', validate(joinWaitlistSchema), waitlistController.joinWaitlist);

// Get position in waitlist (add validation here!)
router.get('/position', validate(getWaitlistPositionSchema), waitlistController.getWaitlistPosition);

export default router;
