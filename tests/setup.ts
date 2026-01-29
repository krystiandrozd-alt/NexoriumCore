// Nexorium Core - Test Setup
// Global setup for Vitest tests

import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// ============================================
// DETERMINISTIC TIME CONTROL
// ============================================

// Fixed timestamp for all tests: 2026-01-15T10:00:00.000Z
export const FIXED_DATE = new Date('2026-01-15T10:00:00.000Z');
export const FIXED_TIMESTAMP = FIXED_DATE.getTime();

// Mock Date globally for deterministic tests
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_DATE);
});

afterAll(() => {
  vi.useRealTimers();
});

// ============================================
// DETERMINISTIC RANDOM (SEEDED RNG)
// ============================================

// Simple seeded PRNG for deterministic "random" values
let seed = 12345;

export function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

export function resetSeed(newSeed = 12345): void {
  seed = newSeed;
}

// Reset seed before each test
beforeAll(() => {
  resetSeed();
});

// ============================================
// REACT TESTING LIBRARY CLEANUP
// ============================================

afterEach(() => {
  cleanup();
});

// ============================================
// STABLE UUID GENERATION FOR TESTS
// ============================================

let uuidCounter = 0;

export function generateStableUUID(): string {
  uuidCounter++;
  return `test-uuid-${String(uuidCounter).padStart(8, '0')}`;
}

export function resetUUIDCounter(): void {
  uuidCounter = 0;
}

beforeEach(() => {
  resetUUIDCounter();
});

// ============================================
// MOCK FETCH FOR API TESTS
// ============================================

// Default mock fetch that throws if called without setup
const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = vi.fn().mockImplementation(() => {
    throw new Error(
      'Fetch was called without being mocked. Use vi.mocked(fetch).mockResolvedValue() or MSW.'
    );
  });
});

afterAll(() => {
  global.fetch = originalFetch;
});

// ============================================
// CONSOLE ERROR/WARN TRACKING
// ============================================

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Track console errors during tests
let consoleErrors: string[] = [];
let consoleWarns: string[] = [];

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    consoleErrors.push(args.map(String).join(' '));
    // Still log for debugging
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    consoleWarns.push(args.map(String).join(' '));
    originalConsoleWarn.apply(console, args);
  };
});

afterEach(() => {
  consoleErrors = [];
  consoleWarns = [];
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

export function getConsoleErrors(): string[] {
  return [...consoleErrors];
}

export function getConsoleWarns(): string[] {
  return [...consoleWarns];
}

// ============================================
// ENVIRONMENT VARIABLES FOR TESTS
// ============================================

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';

// ============================================
// PRISMA MOCKING HELPER
// ============================================

// Will be set up in integration tests that need real DB
export const TEST_DB_URL = 'file:./tests/test.db';

// ============================================
// MSW SERVER SETUP (for API mocking)
// ============================================

// MSW server will be configured in individual test files or test-specific setup
// This allows flexibility for different test scenarios

// ============================================
// TYPE AUGMENTATION
// ============================================

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    interface JestAssertion<T = unknown> {
      toBeInTheDocument(): void;
      toHaveTextContent(text: string | RegExp): void;
      toBeVisible(): void;
      toBeDisabled(): void;
      toHaveClass(className: string): void;
      toHaveAttribute(attr: string, value?: string): void;
      toHaveStyle(style: Record<string, unknown>): void;
    }
  }
}
