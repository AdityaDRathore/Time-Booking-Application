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
    // Skip test if DATABASE_URL is not set (in CI environment)
    if (!process.env.DATABASE_URL) {
      console.log('Skipping database test - DATABASE_URL not set');
      return;
    }

    // This simple query will throw if connection fails
    await prisma.$queryRaw`SELECT 1 as result`;
    expect(true).toBe(true);
  });
});