import { z } from 'zod';

export const timeSlotSchema = z.object({
  startTime: z.string().datetime({ message: 'Invalid startTime' }),
  endTime: z.string().datetime({ message: 'Invalid endTime' }),
  labId: z.string().uuid({ message: 'Invalid labId' }),
});
