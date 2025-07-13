// frontend/src/schemas/bookingSchema.ts
import { z } from 'zod';

export const bookingSchema = z.object({
  slot_id: z.string().uuid({ message: 'Invalid slot ID' }),
  purpose: z.string().min(3, { message: 'Purpose must be at least 3 characters' }),
});

