/**
 * Backend ESLint Configuration
 * 
 * Extends the base configuration with Node.js and backend-specific rules.
 * Uses CommonJS module format as standard for Node.js backends.
 */

module.exports = {
  // Extend base configuration
  extends: [
    '../eslint-config-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],

  // Backend-specific parser options
  parserOptions: {
    project: 'tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
  },

  // Backend-specific environment
  env: {
    node: true,
    jest: true,
  },

  // Backend-specific rules
  rules: {
    // Security best practices for Node.js
    'no-buffer-constructor': 'error',
    'no-path-concat': 'error',
    // Additional backend-specific rules can be added here
  },

  // Ignore patterns specific to backend
  ignorePatterns: [
    '.eslintrc.js',
    'dist',
    'node_modules',
    'coverage',
    'prisma',
  ],
};