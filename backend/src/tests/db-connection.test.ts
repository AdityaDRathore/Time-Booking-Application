//----------------------Database Connection Test----------------------

import { PrismaClient } from '@prisma/client';

describe('Database Connection', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to the database successfully', async () => {
    // This simple query will throw if connection fails
    await prisma.$queryRaw`SELECT 1 as result`;
    expect(true).toBe(true);
  });
});