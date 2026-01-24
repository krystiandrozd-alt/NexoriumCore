// TelEnvIQ - Test Helpers
// Utilities for writing deterministic, maintainable tests

import { vi, type Mock } from 'vitest';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';

// ============================================
// STABLE ID GENERATORS
// ============================================

/**
 * Generate a stable, predictable UUID for tests.
 * Format: {prefix}-{padded-counter}
 */
let idCounters: Record<string, number> = {};

export function stableId(prefix = 'id'): string {
  if (!idCounters[prefix]) {
    idCounters[prefix] = 0;
  }
  idCounters[prefix]++;
  return `${prefix}-${String(idCounters[prefix]).padStart(4, '0')}`;
}

export function resetIdCounters(): void {
  idCounters = {};
}

/**
 * Generate a stable UUID in the standard format.
 */
export function stableUUID(index: number): string {
  const hex = index.toString(16).padStart(8, '0');
  return `${hex}-0000-4000-8000-000000000000`;
}

// ============================================
// DATE/TIME HELPERS
// ============================================

export const FIXED_NOW = new Date('2026-01-15T10:00:00.000Z');
export const FIXED_TIMESTAMP = FIXED_NOW.getTime();

/**
 * Create a date offset from the fixed test date.
 */
export function offsetDate(days: number, hours = 0, minutes = 0): Date {
  const date = new Date(FIXED_NOW);
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

/**
 * Create an ISO date string offset from fixed date.
 */
export function offsetDateISO(days: number, hours = 0, minutes = 0): string {
  return offsetDate(days, hours, minutes).toISOString();
}

// ============================================
// API RESPONSE HELPERS
// ============================================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a mock successful API response.
 */
export function mockApiSuccess<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return { success: true, data, message };
}

/**
 * Create a mock error API response.
 */
export function mockApiError(error: string, details?: string): ApiErrorResponse {
  return { success: false, error, details };
}

/**
 * Create a mock fetch response.
 */
export function mockFetchResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ============================================
// FETCH MOCKING HELPERS
// ============================================

type FetchMock = Mock<typeof fetch>;

/**
 * Set up fetch to return a specific response for a URL pattern.
 */
export function mockFetch(
  urlPattern: string | RegExp,
  response: unknown,
  options: { status?: number; method?: string } = {}
): void {
  const { status = 200, method } = options;
  const fetchMock = vi.mocked(global.fetch) as FetchMock;

  fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const reqMethod = init?.method || 'GET';

    const matches =
      typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);

    if (matches && (!method || reqMethod === method)) {
      return mockFetchResponse(response, status);
    }

    throw new Error(`Unexpected fetch call: ${reqMethod} ${url}`);
  });
}

/**
 * Set up fetch to return different responses based on URL.
 */
export function mockFetchMultiple(
  handlers: Array<{
    url: string | RegExp;
    response: unknown;
    status?: number;
    method?: string;
  }>
): void {
  const fetchMock = vi.mocked(global.fetch) as FetchMock;

  fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const reqMethod = init?.method || 'GET';

    for (const handler of handlers) {
      const matches =
        typeof handler.url === 'string' ? url.includes(handler.url) : handler.url.test(url);

      if (matches && (!handler.method || reqMethod === handler.method)) {
        return mockFetchResponse(handler.response, handler.status || 200);
      }
    }

    throw new Error(`Unexpected fetch call: ${reqMethod} ${url}`);
  });
}

// ============================================
// REACT RENDERING HELPERS
// ============================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add provider wrappers here if needed
  initialRoute?: string;
}

/**
 * Custom render function with common providers.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const { ...renderOptions } = options;

  function Wrapper({ children }: { children: ReactNode }) {
    // Add providers here (e.g., ReactFlowProvider, etc.)
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// ============================================
// WAIT HELPERS
// ============================================

/**
 * Wait for a condition to be true (with timeout).
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Wait for a specific number of milliseconds (advances fake timers).
 */
export async function advanceTime(ms: number): Promise<void> {
  vi.advanceTimersByTime(ms);
  await vi.runAllTimersAsync();
}

// ============================================
// ASSERTION HELPERS
// ============================================

/**
 * Assert that an array has exactly the expected items (order-independent).
 */
export function expectArrayToContainExactly<T>(actual: T[], expected: T[]): void {
  expect(actual).toHaveLength(expected.length);
  for (const item of expected) {
    expect(actual).toContainEqual(item);
  }
}

/**
 * Assert that an object has the expected shape (partial match).
 */
export function expectObjectToMatch<T extends object>(
  actual: T,
  expected: Partial<T>
): void {
  for (const [key, value] of Object.entries(expected)) {
    expect(actual).toHaveProperty(key, value);
  }
}

// ============================================
// ERROR HELPERS
// ============================================

/**
 * Expect a function to throw with a specific message.
 */
export function expectToThrow(fn: () => unknown, message: string | RegExp): void {
  expect(fn).toThrow(message);
}

/**
 * Expect an async function to reject with a specific message.
 */
export async function expectToReject(
  fn: () => Promise<unknown>,
  message: string | RegExp
): Promise<void> {
  await expect(fn()).rejects.toThrow(message);
}
