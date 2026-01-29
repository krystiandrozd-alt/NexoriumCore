// Nexorium Core - API Authentication Utility
// Provides authentication and authorization for API routes

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Role, Permission, hasPermission, type UserContext } from '@/lib/services/security/roles';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  roles: Role[];
}

export interface AuthResult {
  user: AuthenticatedUser | null;
  error: NextResponse | null;
}

/**
 * Get the authenticated user from the Supabase session.
 * Returns the user or an error response if not authenticated.
 * In development mode, returns a mock user to bypass auth.
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  // Bypass auth in development mode
  if (process.env.NODE_ENV === 'development') {
    const devUser: AuthenticatedUser = {
      id: 'dev-user-id',
      email: 'dev@nexorium.local',
      name: 'Dev User',
      roles: [Role.ADMIN], // Full permissions in dev
    };
    return { user: devUser, error: null };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        ),
      };
    }

    // Extract user info - in production, roles would come from DB or JWT claims
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
      // Default role - in production, fetch from database based on user ID
      roles: [Role.EDITOR],
    };

    return { user: authenticatedUser, error: null };
  } catch (err) {
    console.error('Auth error:', err);
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Require authentication for an API route.
 * Returns the user or sends a 401 response.
 */
export async function requireAuth(): Promise<AuthResult> {
  return getAuthenticatedUser();
}

/**
 * Require a specific permission for an API route.
 * Returns the user or sends a 401/403 response.
 */
export async function requirePermission(permission: Permission): Promise<AuthResult> {
  const authResult = await getAuthenticatedUser();

  if (authResult.error) {
    return authResult;
  }

  const userContext: UserContext = {
    userId: authResult.user!.id,
    roles: authResult.user!.roles,
  };

  if (!hasPermission(userContext, permission)) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: 'Forbidden: insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

/**
 * Create an unauthorized response.
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

/**
 * Create a forbidden response.
 */
export function forbiddenResponse(message = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}
