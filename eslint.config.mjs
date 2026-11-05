// Nexorium Core - ESLint flat config
// `next lint` was removed in Next.js 16; linting runs through the ESLint CLI (`npm run lint`).

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // React Compiler rules introduced by eslint-config-next 16. The codebase has
      // ~60 pre-existing findings for these three; they are reported as warnings until
      // they are cleaned up in a dedicated change, after which they move back to 'error'.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated test output
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    // Third-party evaluation library and its scratch app (also excluded in tsconfig.json)
    'yFiles-for-HTML-Complete-*/**',
    '_app-yfiles-test/**',
  ]),
]);
