import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    userId: z.string().uuid({ message: 'Invalid user ID format' }),
    labId: z.string().uuid({ message: 'Invalid lab ID format' }),
    timeSlotId: z.string().uuid({ message: 'Invalid time slot ID format' }),
  }),
});
