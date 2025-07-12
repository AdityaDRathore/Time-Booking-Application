import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
