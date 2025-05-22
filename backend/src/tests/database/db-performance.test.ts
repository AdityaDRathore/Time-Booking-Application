import { PrismaClient } from '@prisma/client';
import { createPerformanceTest, DatabasePerformance } from '../../utils/db-performance';
import fs from 'fs';
import path from 'path';
import logger from '../../utils/logger';

describe('Database Performance Baseline', () => {
  let prisma: PrismaClient;
  let performanceMonitor: DatabasePerformance;

  beforeAll(() => {
    prisma = new PrismaClient();
    performanceMonitor = new DatabasePerformance(prisma, 'test');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should establish performance baseline for key queries', async () => {
    // Skip in CI environments
    if (process.env.CI === 'true') {
      logger.info('Skipping performance test in CI environment');
      return;
    }

    const report = await createPerformanceTest(prisma);

    // Save the report to a file for historical comparison
    const reportsDir = path.join(__dirname, '../../../performance-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    fs.writeFileSync(
      path.join(reportsDir, `performance-baseline-${timestamp}.json`),
      JSON.stringify(report, null, 2),
    );

    // Basic assertions to ensure the test ran
    expect(report.queries.length).toBeGreaterThan(0);
    expect(report.summary.totalQueries).toBeGreaterThan(0);
  });

  // Add tests for specific high-impact queries
  it('should measure lab booking query performance', async () => {
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
