import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files run before each test file
    setupFiles: ['./tests/setup.ts'],

    // Global test utilities (describe, it, expect, vi)
    globals: true,

    // Include patterns
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'tests/e2e/**', // E2E tests use Playwright
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        'src/app/**/layout.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
      ],
    },

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporter
    reporters: ['verbose'],

    // Mock reset between tests for isolation
    mockReset: true,
    restoreMocks: true,

    // Deterministic test ordering
    sequence: {
      shuffle: false,
    },

    // Pool configuration (Vitest 4 format)
    pool: 'forks',
    isolate: true,

    // @neon/auth is ESM and imports extension-less Next subpaths (next/headers);
    // let Vite transform it instead of handing it to Node as an external module.
    server: {
      deps: {
        inline: ['@neon/auth'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
