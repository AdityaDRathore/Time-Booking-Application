/**
 * Frontend ESLint Configuration
 * 
 * Extends the base configuration with React and frontend-specific rules.
 * Uses ESM module format as standard for modern frontend applications.
 * 
 * Note: Using .cjs extension because package.json has "type": "module"
 */

module.exports = {
  // Extend base configuration
  extends: [
    '../eslint-config-base',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  
  // Frontend-specific parser options
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  
  // Frontend-specific settings
  settings: {
    react: {
      version: 'detect',
    },
  },
  
  // Frontend-specific environment
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  
  // Frontend-specific plugins
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  
  // Frontend-specific rules
  rules: {
    // React-specific rules
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // We use TypeScript
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import ordering
    'import/order': [
      'error',
      {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        'alphabetize': { 'order': 'asc', 'caseInsensitive': true }
      }
    ],
    
    // Accessibility
    'jsx-a11y/anchor-is-valid': ['error', {
      'components': ['Link'],
      'specialLink': ['to']
    }],
  },
  
  // Ignore patterns specific to frontend
  ignorePatterns: [
    '.eslintrc.cjs',
    'build',
    'dist',
    'node_modules', 
    'coverage',
    'public',
  ],
};