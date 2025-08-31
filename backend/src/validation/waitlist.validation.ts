import { z } from 'zod';

export const joinWaitlistSchema = z.object({
  user_id: z.string().uuid({
    message: "Invalid user_id format. Must be a UUID.",
  }),
  slot_id: z.string().uuid({
    message: "Invalid slot_id format. Must be a UUID.",
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
