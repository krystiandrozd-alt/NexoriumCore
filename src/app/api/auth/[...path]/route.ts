// Nexorium Core - Neon Auth API route
// Proxies /api/auth/* to Neon Auth and manages the session cookie.
//
// Access is invite-only: self-service sign-up is not exposed through the app. Users are
// created by an administrator in the Neon Console. Everything under `sign-up/` returns 404.

import { NextResponse } from 'next/server';
import { getAuthHandlers } from '@/lib/auth/server';

type AuthHandlers = ReturnType<typeof getAuthHandlers>;
type Method = keyof AuthHandlers;
type Handler = AuthHandlers[Method];

const AUTH_ROUTE_PREFIX = '/api/auth/';
const BLOCKED_PATH_PREFIXES = ['sign-up'];

function isBlocked(request: Request): boolean {
  const { pathname } = new URL(request.url);
  const authPath = pathname.startsWith(AUTH_ROUTE_PREFIX)
    ? pathname.slice(AUTH_ROUTE_PREFIX.length)
    : pathname;
  const firstSegment = authPath.split('/')[0];
  return BLOCKED_PATH_PREFIXES.includes(firstSegment);
}

function guarded(method: Method): Handler {
  return async (request, context) => {
    if (isBlocked(request)) {
      return NextResponse.json(
        { error: 'Sign-up is disabled. Ask an administrator for access.' },
        { status: 404 }
      );
    }
    return getAuthHandlers()[method](request, context);
  };
}

export const GET = guarded('GET');
export const POST = guarded('POST');
export const PUT = guarded('PUT');
export const PATCH = guarded('PATCH');
export const DELETE = guarded('DELETE');
