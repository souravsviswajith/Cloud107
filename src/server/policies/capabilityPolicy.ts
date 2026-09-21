import { ApiError, ErrorCode } from '../errors/ApiError';
import type { ComputeNode, NodeOperation } from '../../types';

/**
 * Resolved authorization principal: persistent DB identity plus the roles
 * verified on the request token. Services authorize every capability call
 * against this principal — never against raw request state.
 */
export interface AuthPrincipal {
  id: number;
  uid: string;
  email: string;
  roles: string[];
}

const ADMIN_ROLE = 'admin';

/** Platform administrators bypass ownership checks. */
export function isAdmin(principal: AuthPrincipal): boolean {
  return principal.roles.includes(ADMIN_ROLE);
}

/** Any authenticated principal may inspect provider capabilities/health. */
export function canReadCapabilities(principal: AuthPrincipal): boolean {
  return principal.id > 0;
}

/** Any authenticated principal may provision nodes under their own identity. */
export function canProvisionNode(principal: AuthPrincipal): boolean {
  return principal.id > 0 && principal.uid.length > 0;
}

/** Owners and admins may read a node. */
export function canAccessNode(principal: AuthPrincipal, node: ComputeNode): boolean {
  return isAdmin(principal) || node.userId === principal.id;
}

/** Owners and admins may mutate node lifecycle state. */
export function canManageNode(principal: AuthPrincipal, node: ComputeNode): boolean {
  return isAdmin(principal) || node.userId === principal.id;
}

/** Owners and admins may read an operation from the ledger. */
export function canAccessOperation(principal: AuthPrincipal, operation: NodeOperation): boolean {
  return isAdmin(principal) || operation.userId === principal.id;
}

/** Only admins may list nodes/operations across all users. */
export function canListAll(principal: AuthPrincipal): boolean {
  return isAdmin(principal);
}

export function assertCanProvisionNode(principal: AuthPrincipal): void {
  if (!canProvisionNode(principal)) {
    throw new ApiError('Forbidden: cannot provision nodes', 403, ErrorCode.FORBIDDEN);
  }
}

export function assertCanAccessNode(principal: AuthPrincipal, node: ComputeNode): void {
  if (!canAccessNode(principal, node)) {
    throw new ApiError('Forbidden: node access denied', 403, ErrorCode.FORBIDDEN);
  }
}

export function assertCanManageNode(principal: AuthPrincipal, node: ComputeNode): void {
  if (!canManageNode(principal, node)) {
    throw new ApiError('Forbidden: node mutation denied', 403, ErrorCode.FORBIDDEN);
  }
}

export function assertCanAccessOperation(principal: AuthPrincipal, operation: NodeOperation): void {
  if (!canAccessOperation(principal, operation)) {
    throw new ApiError('Forbidden: operation access denied', 403, ErrorCode.FORBIDDEN);
  }
}

export function assertCanListAll(principal: AuthPrincipal): void {
  if (!canListAll(principal)) {
    throw new ApiError(
      'Forbidden: cross-user listing requires admin role',
      403,
      ErrorCode.FORBIDDEN,
    );
  }
}
