import { PrismaClient, Prisma } from '@prisma/client';
import logger from './logger';

interface QueryPerformance {
  name: string;
  executionTimeMs: number;
  queryCount: number;
  avgExecutionTimeMs: number;
}

interface PerformanceReport {
  timestamp: Date;
  environment: string;
  queries: QueryPerformance[];
  summary: {
    totalQueries: number;
    totalTimeMs: number;
    avgTimePerQueryMs: number;
  };
}

export class DatabasePerformance {
  private readonly prisma: PrismaClient;
  private readonly queryLogs: Map<string, QueryPerformance> = new Map();
  private readonly environment: string;

  constructor(prisma: PrismaClient, environment: string) {
    this.prisma = prisma;
    this.environment = environment;

    // Listen to query events if available
    if (typeof this.prisma.$on === 'function') {
      this.prisma.$on('query' as never, this.logQueryPerformance.bind(this));
    }
  }

  private logQueryPerformance(event: Prisma.QueryEvent): void {
    // Extract query type for grouping (SELECT, INSERT, etc.)
    const queryType = event.query.trim().split(' ')[0].toUpperCase();
    const key = `${queryType}`;

    const existing = this.queryLogs.get(key) || {
      name: key,
      executionTimeMs: 0,
      queryCount: 0,
      avgExecutionTimeMs: 0,
    };

    existing.executionTimeMs += event.duration;
    existing.queryCount += 1;
    existing.avgExecutionTimeMs = existing.executionTimeMs / existing.queryCount;

    this.queryLogs.set(key, existing);
  }

  async measureQuery<T>(name: string, queryFn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    try {
      return await queryFn();
    } finally {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const existing = this.queryLogs.get(name) || {
        name,
        executionTimeMs: 0,
        queryCount: 0,
        avgExecutionTimeMs: 0,
      };

      existing.executionTimeMs += duration;
      existing.queryCount += 1;
      existing.avgExecutionTimeMs = existing.executionTimeMs / existing.queryCount;

      this.queryLogs.set(name, existing);
    }
  }

  generateReport(): PerformanceReport {
    const queries = Array.from(this.queryLogs.values());

    const totalQueries = queries.reduce((sum, q) => sum + q.queryCount, 0);
    const totalTimeMs = queries.reduce((sum, q) => sum + q.executionTimeMs, 0);

    return {
      timestamp: new Date(),
      environment: this.environment,
      queries,
      summary: {
        totalQueries,
        totalTimeMs,
        avgTimePerQueryMs: totalQueries > 0 ? totalTimeMs / totalQueries : 0,
      },
    };
  }

  logReport(): void {
    const report = this.generateReport();
    logger.info('Database Performance Report', report);
  }

  reset(): void {
    this.queryLogs.clear();
  }
}

// Example usage in a test file
export const createPerformanceTest = async (prisma: PrismaClient): Promise<PerformanceReport> => {
  const performanceMonitor = new DatabasePerformance(prisma, process.env.NODE_ENV ?? 'development');

  // Run standard performance tests
  await performanceMonitor.measureQuery('Find all users', () =>
    prisma.user.findMany({ take: 100 }),
  );

  await performanceMonitor.measureQuery('Find lab with bookings', () =>
    prisma.lab.findFirst({
      include: {
        timeSlots: {
          include: {
            bookings: true,
          },
        },
      },
    }),
  );

  const report = performanceMonitor.generateReport();
  performanceMonitor.reset();
  return report;
};
