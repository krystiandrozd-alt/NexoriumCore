// Nexorium Core - Neon Auth (server side)
// Single server-side entry point for authentication: Route Handlers, Server Components
// and the proxy all go through here. See README, section "Authentication".
//
// Everything is created lazily so that `next build` works without auth environment
// variables; the first request that needs auth reports a missing variable instead.

import { createNeonAuth } from '@neon/auth/next/server';

export const LOGIN_PATH = '/login';
export const DEFAULT_AFTER_LOGIN_PATH = '/dashboard/environments';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}

type NeonAuth = ReturnType<typeof createNeonAuth>;

let authInstance: NeonAuth | undefined;
let handlersInstance: ReturnType<NeonAuth['handler']> | undefined;
let proxyInstance: ReturnType<NeonAuth['middleware']> | undefined;

/** Neon Auth server instance (Better Auth server methods, `getSession()`, …). */
export function getAuth(): NeonAuth {
  if (!authInstance) {
    authInstance = createNeonAuth({
      baseUrl: requiredEnv('NEON_AUTH_BASE_URL'),
      cookies: {
        secret: requiredEnv('NEON_AUTH_COOKIE_SECRET'),
      },
    });
  }
  return authInstance;
}

/** Route handlers for `app/api/auth/[...path]`. */
export function getAuthHandlers() {
  if (!handlersInstance) {
    handlersInstance = getAuth().handler();
  }
  return handlersInstance;
}

/** Session-checking proxy used by `proxy.ts` for protected routes. */
export function getAuthProxy() {
  if (!proxyInstance) {
    proxyInstance = getAuth().middleware({ loginUrl: LOGIN_PATH });
  }
  return proxyInstance;
}
