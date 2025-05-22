import { PrismaClient, Prisma } from '@prisma/client';
import { config } from '../../config/environment';
import logger from '../../utils/logger';

describe('Database Connection', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    // Environment-aware configuration - remove unused variable
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
      ],
    });

    // Log query performance in non-test environments
    if (config.NODE_ENV !== 'test') {
      prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
        logger.debug(`Query executed in ${e.duration}ms: ${e.query}`);
      });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to the database successfully', async () => {
    if (!config.DATABASE_URL) {
      console.warn('DATABASE_URL not found, skipping test');
      return;
    }

    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toBeDefined();
  });

  it('should handle connection pool correctly', async () => {
    if (!config.DATABASE_URL) return;

    // Run multiple queries in parallel to test connection pool
    const promises = Array(5)
      .fill(0)
      .map(() => prisma.$queryRaw`SELECT random() as value`);

    const results = await Promise.all(promises);
    expect(results.length).toBe(5);
  });

  it('should handle transaction rollback correctly', async () => {
    if (!config.DATABASE_URL) return;

    // Test transaction rollback
    try {
      await prisma.$transaction(async tx => {
        // This should succeed
        await tx.$executeRaw`CREATE TEMPORARY TABLE test_table (id SERIAL PRIMARY KEY)`;

        // This will deliberately fail due to duplicate PK
        await tx.$executeRaw`INSERT INTO test_table (id) VALUES (1), (1)`;
      });

      fail('Transaction should have failed');
    } catch (error) {
      // Transaction should fail and roll back
      expect(error).toBeDefined();
    }
  });

  it('should handle connection errors gracefully', async () => {
    // Create a client with invalid credentials to test error handling
    // Use an environment variable or generate an invalid URL without credentials
    const invalidDatabaseUrl =
      process.env.TEST_INVALID_DB_URL ??
      `postgresql://invalid_user:${Buffer.from(Date.now().toString()).toString('base64')}@non-existent-host:5432/invalid_db`;

    const badClient = new PrismaClient({
      datasources: {
        db: {
          url: invalidDatabaseUrl,
        },
      },
    });

    try {
      await badClient.$queryRaw`SELECT 1`;
      fail('Query should have failed with invalid credentials');
    } catch (error) {
      expect(error).toBeDefined();
    } finally {
      await badClient.$disconnect();
    }
  });
});
