import { PrismaClient } from '@prisma/client';
import { withErrorHandling, handlePrismaError } from '../../utils/db-errors';
import { AppError } from '../../utils/errors';

describe('Database Error Handling', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should handle record not found errors', async () => {
    try {
      await withErrorHandling(async () => {
        return await prisma.user.findUniqueOrThrow({
          where: { id: 'non-existent-id' },
        });
      });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(404);
    }
  });

  it('should handle unique constraint errors', async () => {
    // This test requires existing data or setup
    // For now, we'll just mock the error
    const mockPrismaError = {
      code: 'P2002',
      clientVersion: '4.5.0',
      meta: { target: ['user_email'] },
      message: 'Unique constraint failed on the fields: (`user_email`)',
    };

    const error = handlePrismaError(mockPrismaError);
    expect(error.statusCode).toBe(409); // Conflict
    expect(error.message).toContain('already exists');
  });

  it('should pass through successful operations', async () => {
    // Test with a query that should succeed
    const result = await withErrorHandling(async () => {
      return 'success';
    });

    expect(result).toBe('success');
  });
});
