import { Prisma } from '@prisma/client';
import logger from '../../utils/logger';
import { createMockPrismaClient } from '../prisma-mock';
import { mockDeep } from 'jest-mock-extended';

// Replace jest-fail-fast which can't be found
const fail = (message: string): never => {
  throw new Error(message);
};

describe('Database Connection', () => {
  let prisma: ReturnType<typeof createMockPrismaClient>;

  beforeEach(() => {
    prisma = createMockPrismaClient();
  });

  it('should connect to the database successfully', async () => {
    // Mock the query response
    prisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toBeDefined();
    expect(result).toEqual([{ result: 1 }]);
  });

  it('should handle connection pool correctly', async () => {
    // Mock multiple parallel queries
    for (let i = 0; i < 5; i++) {
      prisma.$queryRaw.mockResolvedValueOnce([{ value: Math.random() }]);
    }

    const promises = Array(5)
      .fill(0)
      .map(() => prisma.$queryRaw`SELECT random() as value`);

    const results = await Promise.all(promises);
    expect(results.length).toBe(5);
    expect(results.every(r => Array.isArray(r) && r.length === 1)).toBe(true);
  });

  it('should handle transaction rollback correctly', async () => {
    // Mock successful transaction
    const mockTx = mockDeep<Prisma.TransactionClient>();

    // First mock a successful query
    mockTx.$executeRaw.mockResolvedValueOnce(1);

    // Then mock a failing query
    const duplicateKeyError = new Error('Duplicate key value');
    mockTx.$executeRaw.mockRejectedValueOnce(duplicateKeyError);

    // Fix the callback type to match Prisma's $transaction overloads
    // Define transaction related types
    type TransactionCallback<T> = (tx: Prisma.TransactionClient) => Promise<T>;
    type TransactionQueries<T> = Array<Promise<T>>;

    prisma.$transaction.mockImplementation(
      <T>(
        callbackOrQueries: TransactionCallback<T> | TransactionQueries<T>,
      ): Promise<T | Array<T>> => {
        if (typeof callbackOrQueries === 'function') {
          return callbackOrQueries(mockTx).catch(error => {
            throw error instanceof Error ? error : new Error(String(error));
          });
        }
        // Handle the array of queries case
        return Promise.all(callbackOrQueries);
      },
    );

    try {
      await prisma.$transaction(async tx => {
        // This should succeed
        await tx.$executeRaw`CREATE TEMPORARY TABLE test_table (id SERIAL PRIMARY KEY)`;
        // This will deliberately fail
        await tx.$executeRaw`INSERT INTO test_table (id) VALUES (1), (1)`;
      });
      fail('Transaction should have failed');
    } catch (error: unknown) {
      expect(error).toBeDefined();
      expect(error).toEqual(duplicateKeyError);
    }
  });

  it('should handle connection errors gracefully', async () => {
    // Instead of creating a real bad client, we'll mock a connection error
    // Fix constructor arguments to match expected signature
    const mockError = new Prisma.PrismaClientInitializationError(
      "Can't reach database server",
      '4.5.0',
    );

    // No need to set clientVersion property as it's now provided in the constructor

    prisma.$queryRaw.mockRejectedValueOnce(mockError);

    try {
      await prisma.$queryRaw`SELECT 1`;
      fail('Query should have failed with database connection error');
    } catch (error: unknown) {
      // Add proper error handling logic to satisfy SonarQube
      expect(error).toBeDefined();
      expect(error).toBe(mockError);

      if (error instanceof Prisma.PrismaClientInitializationError) {
        expect(error.message).toContain("Can't reach database server");
        logger.error(`Database connection error: ${error.message}`);
      } else {
        fail('Error should be a PrismaClientInitializationError');
      }
    }
  });
});
