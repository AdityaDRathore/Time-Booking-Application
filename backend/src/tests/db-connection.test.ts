import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
      console.warn('DATABASE_URL not found, skipping test');
      return;
    }

    // This simple query will throw if connection fails
    await prisma.$queryRaw`SELECT 1 as result`;
    expect(true).toBe(true);
  });
});
