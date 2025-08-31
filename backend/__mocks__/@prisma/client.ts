// __mocks__/@prisma/client.ts

export enum LabStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// Create mock functions for all lab operations
const labMocks = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Export the mock object for use in tests
export const mocks = {
  lab: labMocks,
};

// PrismaClient mock returns the above mocked lab model
export class PrismaClient {
  lab = labMocks;
}
