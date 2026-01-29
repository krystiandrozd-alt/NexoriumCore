// Nexorium Core - Roles Service
// RBAC foundation for future role-based access control

import type { Environment } from '@/types';

// Role definitions
export enum Role {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
  DATA_STEWARD = 'DATA_STEWARD',
  SECURITY_ADMIN = 'SECURITY_ADMIN',
}

// Permission definitions
export enum Permission {
  // Environment permissions
  VIEW_ENVIRONMENT = 'VIEW_ENVIRONMENT',
  EDIT_ENVIRONMENT = 'EDIT_ENVIRONMENT',
  DELETE_ENVIRONMENT = 'DELETE_ENVIRONMENT',
  MANAGE_OWNERSHIP = 'MANAGE_OWNERSHIP',

  // Node permissions
  VIEW_NODES = 'VIEW_NODES',
  EDIT_NODES = 'EDIT_NODES',
  ENRICH_NODES = 'ENRICH_NODES',
  REVERT_ENRICHMENTS = 'REVERT_ENRICHMENTS',

  // Data governance permissions
  VIEW_CLASSIFICATIONS = 'VIEW_CLASSIFICATIONS',
  EDIT_CLASSIFICATIONS = 'EDIT_CLASSIFICATIONS',
  APPROVE_PROD_CLONES = 'APPROVE_PROD_CLONES',
  REVOKE_APPROVALS = 'REVOKE_APPROVALS',

  // Policy permissions
  VIEW_VIOLATIONS = 'VIEW_VIOLATIONS',
  RESOLVE_VIOLATIONS = 'RESOLVE_VIOLATIONS',
  ACKNOWLEDGE_VIOLATIONS = 'ACKNOWLEDGE_VIOLATIONS',

  // Connector permissions
  VIEW_CONNECTORS = 'VIEW_CONNECTORS',
  MANAGE_CONNECTORS = 'MANAGE_CONNECTORS',
  RUN_DISCOVERY = 'RUN_DISCOVERY',

  // Credential permissions
  VIEW_CREDENTIALS = 'VIEW_CREDENTIALS',
  MANAGE_CREDENTIALS = 'MANAGE_CREDENTIALS',

  // Audit permissions
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  VERIFY_AUDIT_CHAIN = 'VERIFY_AUDIT_CHAIN',

  // Governance permissions
  VIEW_GOVERNANCE = 'VIEW_GOVERNANCE',
  MANAGE_GOVERNANCE = 'MANAGE_GOVERNANCE',

  // Organisation permissions
  VIEW_ORGANISATION = 'VIEW_ORGANISATION',
  MANAGE_ORGANISATION = 'MANAGE_ORGANISATION',

  // Data permissions (test data, datasets)
  VIEW_DATA = 'VIEW_DATA',
  MANAGE_DATA = 'MANAGE_DATA',

  // Configuration permissions
  VIEW_CONFIGURATION = 'VIEW_CONFIGURATION',
  MANAGE_CONFIGURATION = 'MANAGE_CONFIGURATION',

  // Admin permissions
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
}

// Role to permission mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.VIEWER]: [
    Permission.VIEW_ENVIRONMENT,
    Permission.VIEW_NODES,
    Permission.VIEW_CLASSIFICATIONS,
    Permission.VIEW_VIOLATIONS,
    Permission.VIEW_CONNECTORS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_GOVERNANCE,
    Permission.VIEW_ORGANISATION,
    Permission.VIEW_DATA,
    Permission.VIEW_CONFIGURATION,
  ],

  [Role.EDITOR]: [
    Permission.VIEW_ENVIRONMENT,
    Permission.EDIT_ENVIRONMENT,
    Permission.VIEW_NODES,
    Permission.EDIT_NODES,
    Permission.ENRICH_NODES,
    Permission.VIEW_CLASSIFICATIONS,
    Permission.VIEW_VIOLATIONS,
    Permission.ACKNOWLEDGE_VIOLATIONS,
    Permission.VIEW_CONNECTORS,
    Permission.RUN_DISCOVERY,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_GOVERNANCE,
    Permission.MANAGE_GOVERNANCE,
    Permission.VIEW_ORGANISATION,
    Permission.MANAGE_ORGANISATION,
    Permission.VIEW_DATA,
    Permission.MANAGE_DATA,
    Permission.VIEW_CONFIGURATION,
  ],

  [Role.DATA_STEWARD]: [
    Permission.VIEW_ENVIRONMENT,
    Permission.VIEW_NODES,
    Permission.ENRICH_NODES,
    Permission.VIEW_CLASSIFICATIONS,
    Permission.EDIT_CLASSIFICATIONS,
    Permission.APPROVE_PROD_CLONES,
    Permission.VIEW_VIOLATIONS,
    Permission.RESOLVE_VIOLATIONS,
    Permission.ACKNOWLEDGE_VIOLATIONS,
    Permission.VIEW_CONNECTORS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VERIFY_AUDIT_CHAIN,
    Permission.VIEW_GOVERNANCE,
    Permission.MANAGE_GOVERNANCE,
    Permission.VIEW_ORGANISATION,
    Permission.VIEW_DATA,
    Permission.MANAGE_DATA,
    Permission.VIEW_CONFIGURATION,
  ],

  [Role.SECURITY_ADMIN]: [
    Permission.VIEW_ENVIRONMENT,
    Permission.VIEW_NODES,
    Permission.VIEW_CLASSIFICATIONS,
    Permission.EDIT_CLASSIFICATIONS,
    Permission.APPROVE_PROD_CLONES,
    Permission.REVOKE_APPROVALS,
    Permission.VIEW_VIOLATIONS,
    Permission.RESOLVE_VIOLATIONS,
    Permission.ACKNOWLEDGE_VIOLATIONS,
    Permission.VIEW_CONNECTORS,
    Permission.VIEW_CREDENTIALS,
    Permission.MANAGE_CREDENTIALS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VERIFY_AUDIT_CHAIN,
    Permission.VIEW_GOVERNANCE,
    Permission.MANAGE_GOVERNANCE,
    Permission.VIEW_ORGANISATION,
    Permission.VIEW_DATA,
    Permission.VIEW_CONFIGURATION,
    Permission.MANAGE_CONFIGURATION,
  ],

  [Role.ADMIN]: [
    ...Object.values(Permission),
  ],
};

// User context for permission checking
export interface UserContext {
  userId: string;
  roles: Role[];
  environmentAccess?: Map<string, Role[]>; // Environment-specific role overrides
}

// Check if user has a specific permission
export function hasPermission(user: UserContext, permission: Permission): boolean {
  for (const role of user.roles) {
    if (ROLE_PERMISSIONS[role]?.includes(permission)) {
      return true;
    }
  }
  return false;
}

// Check if user has permission for a specific environment
export function hasEnvironmentPermission(
  user: UserContext,
  environmentId: string,
  permission: Permission
): boolean {
  // Check environment-specific roles first
  const envRoles = user.environmentAccess?.get(environmentId);
  if (envRoles) {
    for (const role of envRoles) {
      if (ROLE_PERMISSIONS[role]?.includes(permission)) {
        return true;
      }
    }
  }

  // Fall back to global roles
  return hasPermission(user, permission);
}

// Get all permissions for a user
export function getUserPermissions(user: UserContext): Permission[] {
  const permissions = new Set<Permission>();

  for (const role of user.roles) {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    for (const perm of rolePerms) {
      permissions.add(perm);
    }
  }

  return Array.from(permissions);
}

// Check if user can access an environment
export function canAccessEnvironment(
  user: UserContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  environment: Environment
): boolean {
  // For now, all authenticated users can view environments
  // In a full implementation, this would check user assignments
  return hasPermission(user, Permission.VIEW_ENVIRONMENT);
}

// Authorization decorator helper
export function requirePermission(permission: Permission) {
  return function checkPermission(user: UserContext): boolean {
    if (!hasPermission(user, permission)) {
      throw new Error(`Permission denied: ${permission} required`);
    }
    return true;
  };
}

// Get role display name
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    [Role.VIEWER]: 'Viewer',
    [Role.EDITOR]: 'Editor',
    [Role.ADMIN]: 'Administrator',
    [Role.DATA_STEWARD]: 'Data Steward',
    [Role.SECURITY_ADMIN]: 'Security Administrator',
  };
  return displayNames[role] || role;
}

// Get permission display name
export function getPermissionDisplayName(permission: Permission): string {
  return permission
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
