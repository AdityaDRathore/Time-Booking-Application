import { Prisma } from '@prisma/client';
import { withErrorHandling, handlePrismaError } from '../../utils/db-errors';
import { AppError } from '../../utils/errors';
import { createMockPrismaClient } from '../prisma-mock';

describe('Database Error Handling', () => {
  let prisma: ReturnType<typeof createMockPrismaClient>;

  beforeEach(() => {
    prisma = createMockPrismaClient();
  });

  it('should handle record not found errors', async () => {
    // Mock a record not found error
    const notFoundError = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2001',
      clientVersion: '4.5.0',
    });

    prisma.user.findUniqueOrThrow.mockRejectedValueOnce(notFoundError);

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
    // Create a proper PrismaClientKnownRequestError for unique constraint
    const uniqueError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`user_email`)',
      {
        code: 'P2002',
        clientVersion: '4.5.0',
        meta: { target: ['user_email'] },
      },
    );

    const error = handlePrismaError(uniqueError);
    expect(error.statusCode).toBe(409); // Conflict
    expect(error.message).toContain('already exists');
  });

  it('should pass through successful operations', async () => {
    const result = await withErrorHandling(async () => {
      return 'success';
    });

    expect(result).toBe('success');
  });
});
