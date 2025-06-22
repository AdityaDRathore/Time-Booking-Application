// ✅ Load environment variables from .env.test before running tests
require('dotenv').config({ path: '.env.test' });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  roots: ['<rootDir>/src'],

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$', // ✅ Matches *.test.ts

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**', // Optional: ignore test files from coverage
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',                     // ✅ Kept
    '^@src/(.*)$': '<rootDir>/src/$1',                  // ✅ Kept
    '^@repository/(.*)$': '<rootDir>/src/repository/$1',// ✅ Kept

    // ✅ Newly added safe aliases
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },

  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },

  forceExit: true,
  detectOpenHandles: true,
};
