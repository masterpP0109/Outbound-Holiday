import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', '.kilo/**', 'assets/**', 'public/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'scripts/**/*.{ts,tsx,mjs}', 'server/**/*.ts', 'api/**/*.ts', 'shared/**/*.ts', 'prisma/**/*.ts', 'tests/**/*.{ts,tsx}', 'vite.config.ts', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'no-undef': 'off', // TypeScript checks identifier resolution.
      '@typescript-eslint/no-explicit-any': 'off', // Tighten existing models incrementally.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
