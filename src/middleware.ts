// Nexorium Core - Next.js Middleware
// Protects routes and handles session refresh

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/environments',
  '/governance',
  '/impact',
  '/insight',
  '/organisation',
  '/configuration',
];

// Routes that are always public
const publicRoutes = ['/', '/login'];

// Local demo only (see DEMO.md): NEXORIUM_DEMO_MODE=true skips the Supabase sign-in
// check so the app can be explored without a Supabase project. It never applies to a
// production build, where NODE_ENV is always "production".
const demoMode =
  process.env.NEXORIUM_DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production';

export async function middleware(request: NextRequest) {
  if (demoMode) {
    // There is nothing to sign in to in demo mode, so send /login to the app.
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard/overview', request.url));
    }
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route
  );

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login page with a valid session, redirect to dashboard
  if (pathname === '/login' && user) {
    const redirect = request.nextUrl.searchParams.get('redirect');
    const redirectUrl = new URL(redirect || '/dashboard/environments', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
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
