import { z } from 'zod';

export const createSlotSchema = z.object({
  lab_id: z.string().uuid({ message: 'Invalid lab_id' }),
  start_time: z.string().datetime({ message: 'Invalid ISO start_time' }),
  end_time: z.string().datetime({ message: 'Invalid ISO end_time' }),
});
