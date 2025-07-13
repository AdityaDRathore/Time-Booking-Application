import { z } from 'zod';

export const CreateBookingSchema = z.object({
  slot_id: z.string().uuid({ message: 'Invalid slot ID' }),
  purpose: z.string().min(3, { message: 'Purpose must be at least 3 characters' }),
});

// Don't include userId in schema
export const UpdateBookingSchema = CreateBookingSchema.partial();

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;
