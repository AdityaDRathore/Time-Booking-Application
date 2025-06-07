import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import originalLogger from '../../utils/logger'; // Assuming logger is available

// Attempt to create a logger mock/fallback if the real one isn't test-friendly or available
let logger = originalLogger;
if (!logger || typeof logger.info !== 'function') {
  console.warn("Original logger not found or not standard in testSetup.ts, using console fallback.");
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.log,
    // Add other methods if your logger interface has them and they are called
  } as any; // Use 'as any' for simplicity if logger structure varies
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
        `Failed to connect to test database (DATABASE_URL_TEST) in global setup: ${errorMessage}. Integration tests requiring DB will likely fail.`
      );
      // Do not rethrow here, to allow tests that mock Prisma to run.
    }
  } else {
    logger.warn(
      'DATABASE_URL_TEST is not set. Global Prisma client in testSetup.ts will not attempt to connect. ' +
      'Database-dependent integration tests should ensure their own DB setup or use mocks. ' +
      'Operations in authTestUtils using this global prisma instance may fail if they expect a connection.'
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
