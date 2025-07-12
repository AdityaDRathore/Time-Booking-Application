/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',                            // Enable TypeScript support
  testEnvironment: 'node',                      // Use Node.js environment for backend
  rootDir: '.',                                 // Project root
  testMatch: ['**/__tests__/**/*.test.ts'],     // Match only .test.ts files in __tests__ folders
  moduleFileExtensions: ['ts', 'js', 'json'],   // File extensions to consider
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',             // Support for @/ alias (like @/tests or @/utils)
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',                     // Transform TypeScript files
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',                // Path to your tsconfig
    },
  },
  collectCoverage: true,                        // Optional: collect coverage
  coverageDirectory: 'coverage',                // Output folder
  coverageReporters: ['text', 'lcov'],          // Output formats
};
