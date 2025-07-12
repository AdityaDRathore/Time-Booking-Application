//-------------------------------- Configuration System --------------------------------//

import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// ✅ Utility: Convert comma-separated string to trimmed string array
const parseCorsOrigin = (input?: string): string[] => {
  if (!input) return ['*'];
  return input.split(',').map(origin => origin.trim()).filter(Boolean);
};

// ✅ Define environment schema (mark secrets as optional for initial validation)
const rawSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),

  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().optional(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().optional(),
  CORS_ORIGIN: z.string().optional().default('*'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

// ✅ Validate schema
const parsed = rawSchema.safeParse(process.env);

// ✅ Handle validation result
if (!parsed.success) {
  if (process.env.NODE_ENV === 'test') {
    console.warn('⚠️ Running with incomplete environment in test mode, using fallbacks.');
  } else {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 4));
    process.exit(1);
  }
}

// ✅ Extract or fallback to base environment config
const base = parsed.success ? parsed.data : {
  NODE_ENV: process.env.NODE_ENV ?? 'test',
  PORT: process.env.PORT ?? '4000',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '15m',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',
  REDIS_URL: process.env.REDIS_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
  LOG_LEVEL: (process.env.LOG_LEVEL as z.infer<typeof rawSchema.shape.LOG_LEVEL>) ?? 'error',
};

// ✅ Ensure critical secrets exist (JWT & refresh)
if (!base.JWT_SECRET) {
  throw new Error('❌ JWT_SECRET is required but not set in environment variables.');
}
if (!base.REFRESH_TOKEN_SECRET) {
  throw new Error('❌ REFRESH_TOKEN_SECRET is required but not set in environment variables.');
}

// ✅ Final typed and safe config object
export const config = {
  ...base,
  JWT_SECRET: base.JWT_SECRET as string,
  REFRESH_TOKEN_SECRET: base.REFRESH_TOKEN_SECRET as string,
  CORS_ORIGIN: parseCorsOrigin(base.CORS_ORIGIN),
};
