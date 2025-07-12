// src/schema/lab.schema.ts
import { z } from 'zod';

// Use the same field names as your Prisma model
export const CreateLabSchema = z.object({
  lab_name: z.string().min(1, "Lab name is required"),
  location: z.string().min(1, "Location is required"),
  lab_capacity: z.number().int().positive("Capacity must be a positive integer"),
  description: z.string().optional(), // if your schema allows it
  organizationId: z.string().uuid("Organization ID must be a valid UUID"),
  adminId: z.string().uuid("Admin ID must be a valid UUID"),
});

export const UpdateLabSchema = CreateLabSchema.partial();
