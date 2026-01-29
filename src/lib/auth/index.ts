// Nexorium Core - Authentication Module
// Re-exports for cleaner imports

export {
  getAuthenticatedUser,
  requireAuth,
  requirePermission,
  unauthorizedResponse,
  forbiddenResponse,
  type AuthenticatedUser,
  type AuthResult,
} from './api-auth';
