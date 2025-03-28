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
    if (!process.env.DATABASE_URL) {
      // Remove console.log and use return to skip test
      return;
    }

    // This simple query will throw if connection fails
    await prisma.$queryRaw`SELECT 1 as result`;
    expect(true).toBe(true);
  });
});
