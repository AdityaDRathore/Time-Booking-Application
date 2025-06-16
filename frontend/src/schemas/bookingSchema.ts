import { z } from 'zod';

export const bookingSchema = z.object({
  userId: z.string(),
  slotId: z.string(),
  userBookingsThisWeek: z.number().max(3, "You can only book 3 slots per week"),
  isSlotAlreadyBookedByUser: z.boolean().refine((val) => val === false, {
    message: "You already booked this time slot.",
  }),
});
