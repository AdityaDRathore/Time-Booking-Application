import { z } from 'zod';

export const CreateBookingSchema = z.object({
  lab_id: z.string(),
  user_id: z.string(),
  slot_id: z.string(),
  purpose: z.string().min(3),
});

export const UpdateBookingSchema = CreateBookingSchema.partial();
