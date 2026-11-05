// Nexorium Core - Next.js Proxy
// Protects the application routes: requests without a valid Neon Auth session are sent to
// the login page and come back to the page they asked for after signing in.
//
// This file must live next to `app/` (inside `src/`), otherwise Next.js does not run it.

import { type NextRequest, NextResponse } from 'next/server';
import { getAuthProxy, LOGIN_PATH } from '@/lib/auth/server';

// Routes that require authentication (the path itself and everything below it)
const protectedRoutes = [
  '/dashboard',
  '/environments',
  '/governance',
  '/impact',
  '/insight',
  '/organisation',
  '/configuration',
];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Validates (and refreshes) the session; without one it redirects to LOGIN_PATH.
  const response = await getAuthProxy()(request);

  // Neon Auth redirects to the login URL and copies the request's query string onto it.
  // Replace that with a single `redirect` parameter carrying the requested page, so the
  // login page can return the user there afterwards.
  const location = response.headers.get('location');
  if (location) {
    const target = new URL(location, request.url);
    if (target.origin === request.nextUrl.origin && target.pathname === LOGIN_PATH) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      response.headers.set('location', loginUrl.toString());
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - handled separately)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
