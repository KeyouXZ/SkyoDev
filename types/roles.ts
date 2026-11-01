/**
 * Bitwise Role and Permission System
 *
 * Each role and permission is represented as a bit flag (power of 2).
 * This allows a user to hold multiple roles and permissions simultaneously
 * inside a single integer field in PostgreSQL.
 */

export const Role = {
  NONE: 0,
  USER: 1 << 0,         // 1  (0b00000001) - Base authenticated user
  VIEWER: 1 << 1,       // 2  (0b00000010) - Read-only inventory viewer
  STAFF: 1 << 2,        // 4  (0b00000100) - Inventory / sales operator
  MANAGER: 1 << 3,      // 8  (0b00001000) - Stock manager & supplier liaison
  ADMIN: 1 << 4,        // 16 (0b00010000) - Full inventory & user administrator
  SUPER_ADMIN: 1 << 5,  // 32 (0b00100000) - System owner & root permissions
} as const;

export type RoleKey = keyof typeof Role;
export type RoleValue = (typeof Role)[RoleKey];

export const Permission = {
  NONE: 0,
  VIEW_PRODUCTS: 1 << 0,        // 1
  MANAGE_PRODUCTS: 1 << 1,      // 2
  VIEW_SALES: 1 << 2,           // 4
  RECORD_SALES: 1 << 3,         // 8
  MANAGE_SUPPLIERS: 1 << 4,     // 16
  MANAGE_ORDERS: 1 << 5,        // 32
  VIEW_AI_SUGGESTIONS: 1 << 6,  // 64
  MANAGE_BOM: 1 << 7,           // 128
  MANAGE_USERS: 1 << 8,         // 256
  SYSTEM_CONFIG: 1 << 9,        // 512
} as const;

export type PermissionKey = keyof typeof Permission;
export type PermissionValue = (typeof Permission)[PermissionKey];

/**
 * Common Role presets
 */
export const ROLE_PRESETS = {
  USER: Role.USER,
  VIEWER: Role.USER | Role.VIEWER,
  STAFF: Role.USER | Role.STAFF,
  MANAGER: Role.USER | Role.STAFF | Role.MANAGER,
  ADMIN: Role.USER | Role.STAFF | Role.MANAGER | Role.ADMIN,
  SUPER_ADMIN: Role.USER | Role.STAFF | Role.MANAGER | Role.ADMIN | Role.SUPER_ADMIN,
} as const;

/**
 * Maps Roles to their granted granular permissions
 */
export const ROLE_DEFAULT_PERMISSIONS: Record<RoleKey, number> = {
  NONE: Permission.NONE,
  USER: Permission.VIEW_PRODUCTS,
  VIEWER: Permission.VIEW_PRODUCTS | Permission.VIEW_SALES | Permission.VIEW_AI_SUGGESTIONS,
  STAFF:
    Permission.VIEW_PRODUCTS |
    Permission.MANAGE_PRODUCTS |
    Permission.VIEW_SALES |
    Permission.RECORD_SALES |
    Permission.VIEW_AI_SUGGESTIONS,
  MANAGER:
    Permission.VIEW_PRODUCTS |
    Permission.MANAGE_PRODUCTS |
    Permission.VIEW_SALES |
    Permission.RECORD_SALES |
    Permission.MANAGE_SUPPLIERS |
    Permission.MANAGE_ORDERS |
    Permission.VIEW_AI_SUGGESTIONS |
    Permission.MANAGE_BOM,
  ADMIN:
    Permission.VIEW_PRODUCTS |
    Permission.MANAGE_PRODUCTS |
    Permission.VIEW_SALES |
    Permission.RECORD_SALES |
    Permission.MANAGE_SUPPLIERS |
    Permission.MANAGE_ORDERS |
    Permission.VIEW_AI_SUGGESTIONS |
    Permission.MANAGE_BOM |
    Permission.MANAGE_USERS,
  SUPER_ADMIN:
    Permission.VIEW_PRODUCTS |
    Permission.MANAGE_PRODUCTS |
    Permission.VIEW_SALES |
    Permission.RECORD_SALES |
    Permission.MANAGE_SUPPLIERS |
    Permission.MANAGE_ORDERS |
    Permission.VIEW_AI_SUGGESTIONS |
    Permission.MANAGE_BOM |
    Permission.MANAGE_USERS |
    Permission.SYSTEM_CONFIG,
};

/**
 * Check if the bitmask includes all specified role flags.
 */
export function hasRole(userRole: number, requiredRole: number): boolean {
  if (requiredRole === Role.NONE) return true;
  return (userRole & requiredRole) === requiredRole;
}

/**
 * Check if the bitmask contains at least one of the specified roles.
 */
export function hasAnyRole(userRole: number, ...roles: number[]): boolean {
  return roles.some((role) => (userRole & role) === role);
}

/**
 * Add one or more role flags to an existing role bitmask.
 */
export function addRole(userRole: number, ...rolesToAdd: number[]): number {
  return rolesToAdd.reduce((acc, r) => acc | r, userRole);
}

/**
 * Remove one or more role flags from an existing role bitmask.
 */
export function removeRole(userRole: number, ...rolesToRemove: number[]): number {
  return rolesToRemove.reduce((acc, r) => acc & ~r, userRole);
}

/**
 * Toggle a role flag.
 */
export function toggleRole(userRole: number, role: number): number {
  return userRole ^ role;
}

/**
 * Returns an array of string names for all active roles in the bitmask.
 */
export function getRoleNames(userRole: number): RoleKey[] {
  return (Object.entries(Role) as [RoleKey, number][])
    .filter(([, val]) => val !== 0 && (userRole & val) === val)
    .map(([key]) => key);
}

/**
 * Create a bitmask integer from a list of role names.
 */
export function createRoleBitmask(roleNames: (keyof typeof Role)[]): number {
  return roleNames.reduce((acc, name) => acc | (Role[name] ?? 0), 0);
}

/**
 * Check if user permissions satisfy a required permission.
 */
export function hasPermission(userPermissions: number, requiredPermission: number): boolean {
  if (requiredPermission === Permission.NONE) return true;
  return (userPermissions & requiredPermission) === requiredPermission;
}

/**
 * Calculate total permissions for a given user role bitmask.
 */
export function calculatePermissions(userRole: number): number {
  let permissions = Permission.NONE;
  for (const [roleKey, roleVal] of Object.entries(Role) as [RoleKey, number][]) {
    if (roleVal !== 0 && (userRole & roleVal) === roleVal) {
      permissions |= ROLE_DEFAULT_PERMISSIONS[roleKey];
    }
  }
  return permissions;
}
