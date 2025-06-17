// src/validation/lab.validation.ts

import { z } from 'zod';
import { LabStatus } from '@prisma/client';

// 🧪 Zod schema for creating a lab
export const createLabSchema = z.object({
  lab_name: z.string().min(1, 'Lab name is required'),
  lab_capacity: z.number().int().positive('Capacity must be positive'),
  organizationId: z.string().uuid('Invalid organizationId'),
  adminId: z.string().uuid('Invalid adminId'),
  status: z.nativeEnum(LabStatus).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

// 🧪 Zod schema for updating a lab
export const updateLabSchema = z.object({
  lab_name: z.string().min(1).optional(),
  lab_capacity: z.number().int().positive().optional(),
  organizationId: z.string().uuid().optional(),
  adminId: z.string().uuid().optional(),
  status: z.nativeEnum(LabStatus).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});
