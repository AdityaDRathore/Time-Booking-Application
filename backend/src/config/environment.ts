//--------------------------------Configuration system--------------------------------

import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: process.env.NODE_ENV === 'test' ? z.string().optional() : z.string(),
  JWT_SECRET: process.env.NODE_ENV === 'test' ? z.string().optional() : z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: process.env.NODE_ENV === 'test' ? z.string().optional() : z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

// Parse and validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  if (process.env.NODE_ENV === 'test') {
    console.warn('⚠️ Running with incomplete environment in test mode');
  } else {
    console.error('❌ Invalid environment variables:', JSON.stringify(env.error.format(), null, 4));
    process.exit(1);
  }
}

// Export validated config or fallbacks for test environment
export const config = env.success
  ? env.data
  : {
    NODE_ENV: process.env.NODE_ENV || 'test',
    PORT: process.env.PORT || '4000',
    LOG_LEVEL: process.env.LOG_LEVEL || 'error',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db',
    JWT_SECRET: process.env.JWT_SECRET || 'test_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'test_refresh_secret',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  };
