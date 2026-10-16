import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        logger: 'readonly',
        // ⚡ DAY 34 FIX: Jest environment keywords configuration
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        setTimeout: 'readonly'
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-console': 'off'
    }
  }
];
