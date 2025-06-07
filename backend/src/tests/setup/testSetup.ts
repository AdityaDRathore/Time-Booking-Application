import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import originalLoggerInstance from '../../utils/logger'; // Import the actual logger instance

// Define an interface for the logger methods used in this file.
// This ensures that both the original Winston logger and the fallback are compatible.
interface TestSetupLogger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void; // Included for consistency with the fallback
}

// Type 'logger' with TestSetupLogger.
// The originalLoggerInstance (Winston logger) is compatible because it has these methods.
let logger: TestSetupLogger = originalLoggerInstance;

if (!logger || typeof logger.info !== 'function') {
  // Use console.warn directly here, as 'logger' might be null/undefined or not have a .warn method
  // eslint-disable-next-line no-console
  console.warn(
    'Original logger not found or not standard in testSetup.ts, using console fallback.',
  );
  // The fallback logger also conforms to TestSetupLogger.
  logger = {
    // eslint-disable-next-line no-console
    info: (...args: unknown[]): void => console.log(...args),
    // eslint-disable-next-line no-console
    warn: (...args: unknown[]): void => console.warn(...args),
    // eslint-disable-next-line no-console
    error: (...args: unknown[]): void => console.error(...args),
    // eslint-disable-next-line no-console
    debug: (...args: unknown[]): void => console.log(...args),
  };
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL,
    },
  },
  // log: ['query', 'info', 'warn', 'error'], // Optional: for more detailed logs during tests
});

let isConnected = false;

beforeAll(async () => {
  // Only attempt to connect if DATABASE_URL_TEST is explicitly set,
  // indicating a dedicated test database environment is intended.
  if (process.env.DATABASE_URL_TEST) {
    try {
      await prisma.$connect();
      isConnected = true;
      logger.info('Successfully connected to test database (DATABASE_URL_TEST).');
    } catch (error) {
      isConnected = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        `Failed to connect to test database (DATABASE_URL_TEST) in global setup: ${errorMessage}. Integration tests requiring DB will likely fail.`,
      );
      // Do not rethrow here, to allow tests that mock Prisma to run.
    }
  } else {
    logger.warn(
      'DATABASE_URL_TEST is not set. Global Prisma client in testSetup.ts will not attempt to connect. ' +
        'Database-dependent integration tests should ensure their own DB setup or use mocks. ' +
        'Operations in authTestUtils using this global prisma instance may fail if they expect a connection.',
    );
  }
});

afterAll(async () => {
  if (isConnected) {
    await prisma.$disconnect();
    isConnected = false; // Reset status
    logger.info('Disconnected from test database.');
  }
});

beforeEach(async () => {
  if (isConnected) {
    // Clean up database before each test only if connected to a test DB
    try {
      // Order of deletion matters due to foreign key constraints
      // Adjust order as per your actual schema dependencies
      await prisma.booking.deleteMany({});
      await prisma.waitlist.deleteMany({});
      await prisma.notification.deleteMany({});
      await prisma.timeSlot.deleteMany({});
      await prisma.lab.deleteMany({});
      await prisma.admin.deleteMany({});
      await prisma.superAdmin.deleteMany({});
      await prisma.user.deleteMany({});
      await prisma.organizationNotification.deleteMany({});
      await prisma.organization.deleteMany({});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to clean test database in beforeEach: ${errorMessage}`);
    }
  }
});

export { prisma };
