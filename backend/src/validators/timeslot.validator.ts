import { z } from 'zod';

export const timeSlotSchema = z.object({
  startTime: z.string({ required_error: 'Start time is required' }),
  endTime: z.string({ required_error: 'End time is required' }),
  labId: z.string({ required_error: 'Lab ID is required' }),
});
