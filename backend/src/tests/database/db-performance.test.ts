import { createPerformanceTest, DatabasePerformance } from '../../utils/db-performance';
import fs from 'fs';
import { createMockPrismaClient } from '../prisma-mock';

// Mock logger to avoid file system operations
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// More complete fs mock including stat function needed by Winston
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  stat: jest.fn().mockImplementation((path, callback) => {
    callback(null, { isDirectory: () => true });
  }),
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    once: jest.fn(),
  }),
}));

describe('Database Performance Baseline', () => {
  let prisma: ReturnType<typeof createMockPrismaClient>;
  let performanceMonitor: DatabasePerformance;

  beforeEach(() => {
    prisma = createMockPrismaClient();
    performanceMonitor = new DatabasePerformance(prisma, 'test');
  });

  it('should establish performance baseline for key queries', async () => {
    // Mock necessary Prisma methods
    prisma.user.findMany.mockResolvedValue([]);
    prisma.lab.findFirst.mockResolvedValue(null);

    // Mock fs methods
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const report = await createPerformanceTest(prisma);

    // Basic assertions to ensure the test ran
    expect(report.queries.length).toBeGreaterThan(0);
    expect(report.summary.totalQueries).toBeGreaterThan(0);
  });

  // Add tests for specific high-impact queries
  it('should measure lab booking query performance', async () => {
    prisma.lab.findMany.mockResolvedValue([]);

    const result = await performanceMonitor.measureQuery('Find available labs', async () => {
      return prisma.lab.findMany({
        where: { status: 'ACTIVE' },
        include: {
          timeSlots: {
            where: {
              bookings: {
                some: {
                  booking_status: 'CONFIRMED',
                },
              },
            },
          },
        },
      });
    });

    expect(result).toBeDefined();
  });
});
