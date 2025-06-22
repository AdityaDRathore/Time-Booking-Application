import { z } from 'zod';

export const joinWaitlistSchema = z.object({
  userId: z.string().uuid({
    message: "Invalid userId format. Must be a UUID.",
  }),
  slotId: z.string().uuid({
    message: "Invalid slotId format. Must be a UUID.",
  }),
});

export const getWaitlistPositionSchema = z.object({
  userId: z.string().uuid({
    message: "Invalid userId format. Must be a UUID.",
  }),
  slotId: z.string().uuid({
    message: "Invalid slotId format. Must be a UUID.",
  }),
});
