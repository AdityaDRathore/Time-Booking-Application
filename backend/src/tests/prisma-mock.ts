import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Create a mock instance of the Prisma client
export const prisma = mockDeep<PrismaClient>();

// Factory for creating a fresh mock for each test
export const createMockPrismaClient = (): DeepMockProxy<PrismaClient> => {
  mockReset(prisma);
  return prisma;
};
