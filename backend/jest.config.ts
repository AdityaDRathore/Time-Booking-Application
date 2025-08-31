import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  rootDir: '.',

  roots: ['<rootDir>/src', '<rootDir>/src/tests'],

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
    }],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  testMatch: ['**/?(*.)+(test|spec).[jt]s?(x)'],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@repository/(.*)$': '<rootDir>/src/repository/$1',
    '^@tests/(.*)$': '<rootDir>/src/tests/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@prisma/seed/(.*)$': '<rootDir>/prisma/seed/$1',
  },

  // globalSetup: './jest.setup.ts', // ✅ this replaces setupFiles
  // globalTeardown: './jest.teardown.ts', // ✅ optional
  forceExit: true,
  detectOpenHandles: true,
};

export default config;
