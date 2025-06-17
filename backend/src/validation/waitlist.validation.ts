import { z } from 'zod';

// POST /waitlist/join → validate req.body
export const joinWaitlistSchema = z.object({
  body: z.object({
    user_id: z.string().uuid({
      message: "Invalid user_id format. Must be a UUID.",
    }),
    slot_id: z.string().uuid({
      message: "Invalid slot_id format. Must be a UUID.",
    }),
  }),
});

// GET /waitlist/position?user_id=&slot_id= → validate req.query
export const getWaitlistPositionSchema = z.object({
  query: z.object({
    user_id: z.string().uuid({
      message: "Invalid user_id format. Must be a UUID.",
    }),
    slot_id: z.string().uuid({
      message: "Invalid slot_id format. Must be a UUID.",
    }),
  }),
});
