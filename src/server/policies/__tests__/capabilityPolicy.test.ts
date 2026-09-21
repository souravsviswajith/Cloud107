import { describe, it, expect } from 'vitest';
import { NodeState, ComputeNode, NodeOperation } from '../../../types';
import { ApiError } from '../../errors/ApiError';
import {
  AuthPrincipal,
  assertCanAccessNode,
  assertCanAccessOperation,
  assertCanListAll,
  assertCanManageNode,
  assertCanProvisionNode,
  canAccessNode,
  canAccessOperation,
  canListAll,
  canManageNode,
  canProvisionNode,
  isAdmin,
} from '../capabilityPolicy';

const owner: AuthPrincipal = { id: 1, uid: 'uid-owner', email: 'owner@c107.local', roles: [] };
const stranger: AuthPrincipal = { id: 2, uid: 'uid-stranger', email: 'x@c107.local', roles: [] };
const admin: AuthPrincipal = { id: 9, uid: 'uid-admin', email: 'a@c107.local', roles: ['admin'] };

function makeNode(userId: number): ComputeNode {
  return {
    id: 'node-1',
    name: 'n1',
    providerId: 'local-unix',
    state: NodeState.Stopped,
    userId,
    vcpuCount: 2,
    memoryBytes: 1024,
    diskSizeBytes: 2048,
    primaryIpAddress: null,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: null,
  };
}

function makeOperation(userId: number): NodeOperation {
  return {
    id: 'op-1',
    nodeId: 'node-1',
    userId,
    type: 'start',
    status: 'completed',
    payload: null,
    result: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

describe('capabilityPolicy', () => {
  it('identifies admins by role', () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(owner)).toBe(false);
  });

  it('allows any authenticated principal to provision', () => {
    expect(canProvisionNode(owner)).toBe(true);
    expect(canProvisionNode(stranger)).toBe(true);
    expect(() => assertCanProvisionNode(owner)).not.toThrow();
  });

  it('grants node access to owners and admins only', () => {
    const node = makeNode(owner.id);
    expect(canAccessNode(owner, node)).toBe(true);
    expect(canAccessNode(admin, node)).toBe(true);
    expect(canAccessNode(stranger, node)).toBe(false);
    expect(canManageNode(owner, node)).toBe(true);
    expect(canManageNode(admin, node)).toBe(true);
    expect(canManageNode(stranger, node)).toBe(false);
  });

  it('throws ApiError 403 when node access is denied', () => {
    const node = makeNode(owner.id);
    expect(() => assertCanAccessNode(stranger, node)).toThrow(ApiError);
    expect(() => assertCanManageNode(stranger, node)).toThrow(ApiError);
    try {
      assertCanAccessNode(stranger, node);
      expect.unreachable();
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).statusCode).toBe(403);
    }
  });

  it('grants operation access to owners and admins only', () => {
    const operation = makeOperation(owner.id);
    expect(canAccessOperation(owner, operation)).toBe(true);
    expect(canAccessOperation(admin, operation)).toBe(true);
    expect(canAccessOperation(stranger, operation)).toBe(false);
    expect(() => assertCanAccessOperation(stranger, operation)).toThrow(ApiError);
  });

  it('restricts cross-user listing to admins', () => {
    expect(canListAll(admin)).toBe(true);
    expect(canListAll(owner)).toBe(false);
    expect(() => assertCanListAll(owner)).toThrow(ApiError);
    expect(() => assertCanListAll(admin)).not.toThrow();
  });
});
