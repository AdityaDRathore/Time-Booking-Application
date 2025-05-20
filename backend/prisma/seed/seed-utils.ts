import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

/**
 * Logs a seed operation with timing information
 * @param operationName Name of the seed operation
 * @param operation The async function to execute
 * @returns The result of the operation
 */
export async function logSeedOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
  console.log(`\n📋 Starting seed operation: ${operationName}`);
  const startTime = performance.now();

  try {
    const result = await operation();
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ Completed seed operation: ${operationName} (${duration}s)`);
    return result;
  } catch (error) {
    console.error(`❌ Failed seed operation: ${operationName}`);
    console.error(error);
    throw error; // Re-throw to halt the main seed process
  }
}

/**
 * Verifies data exists before proceeding with dependent seeds
 * @param prisma PrismaClient instance
 * @param model Model name to check
 * @param errorMessage Custom error message to display
 */
export async function verifyDataExists(
  prisma: PrismaClient,
  model: string,
  errorMessage?: string
): Promise<void> {
  // @ts-ignore - Dynamic property access
  const count = await prisma[model].count();
  if (count === 0) {
    throw new Error(errorMessage || `No ${model} found. Please seed ${model} first.`);
  }
  console.log(`✓ Verified ${count} ${model} records exist`);
}

/**
 * Determines if we're running in a test environment
 * @returns boolean
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Gets the seed data size based on environment
 * For test environments, we use minimal data
 * For development, we use more comprehensive data
 */
export function getSeedDataSize(): {
  users: number;
  orgs: number;
  labs: number;
  timeSlots: number;
  bookingsPerUser: number;
} {
  if (isTestEnvironment()) {
    return {
      users: 2,
      orgs: 1,
      labs: 1,
      timeSlots: 5,
      bookingsPerUser: 1
    };
  }

  return {
    users: 5,
    orgs: 3,
    labs: 5,
    timeSlots: 20,
    bookingsPerUser: 2
  };
}