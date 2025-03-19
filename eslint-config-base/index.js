/**
 * Shared ESLint Base Configuration
 * 
 * This configuration contains common rules used across both frontend and backend.
 * It provides consistency in code style while allowing each environment to
 * extend with its specific requirements.
 */

module.exports = {
  // Base parser for TypeScript
  parser: '@typescript-eslint/parser',
  
  // Common parser options
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    warnOnUnsupportedTypeScriptVersion: false,
  },
  
  // Plugins used across all projects
  plugins: ['@typescript-eslint', 'prettier'],
  
  // Base rule extensions
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  
  // Common environment settings
  env: {
    node: true,
    es6: true,
  },
  
  // Ignore patterns for all projects
  ignorePatterns: ['dist', 'build', 'node_modules', 'coverage'],
  
  // Shared rules across all TypeScript code
  rules: {
    // Consistent TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    
    // Consistent code style rules
    'prettier/prettier': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'eqeqeq': ['error', 'always'],
  }
};