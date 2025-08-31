import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const CreateUserSchema = z.object({
  user_name: z.string().min(1),
  user_email: z.string().email(),
  user_password: z.string().min(6),
  user_role: z.nativeEnum(UserRole),
});

export const UpdateUserSchema = z.object({
  user_name: z.string().min(1).optional(),
  user_email: z.string().email().optional(),
  user_password: z.string().min(6).optional(),
  user_role: z.nativeEnum(UserRole).optional(),
});
