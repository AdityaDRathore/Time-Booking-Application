// src/validation/booking.validation.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid userId' }),
  timeSlotId: z.string().uuid({ message: 'Invalid timeSlotId' }),
  purpose: z.string().min(3, { message: 'Purpose must be at least 3 characters' }),
});
