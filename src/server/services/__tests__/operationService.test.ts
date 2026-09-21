import { describe, it, expect, beforeEach } from 'vitest';
import { NodeOperation, NodeState } from '../../../types';
import { OperationService } from '../operationService';
import { OperationRepository } from '../../repositories/operationRepository';
import { NodeRepository } from '../../repositories/nodeRepository';
import { AuthPrincipal } from '../../policies/capabilityPolicy';

function makeOperation(id: string, userId: number, nodeId: string | null): NodeOperation {
  const now = new Date().toISOString();
  return {
    id,
    nodeId,
    userId,
    type: 'start',
    status: 'completed',
    payload: null,
    result: null,
    error: null,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
  };
}

const owner: AuthPrincipal = { id: 1, uid: 'u1', email: 'o@c107.local', roles: [] };
const stranger: AuthPrincipal = { id: 2, uid: 'u2', email: 's@c107.local', roles: [] };
const admin: AuthPrincipal = { id: 9, uid: 'u9', email: 'a@c107.local', roles: ['admin'] };

const NODE_ID = '11111111-1111-4111-8111-111111111111';

describe('OperationService', () => {
  let operationStore: NodeOperation[];
  let service: OperationService;

  beforeEach(() => {
    operationStore = [
      makeOperation('op-owner', owner.id, NODE_ID),
      makeOperation('op-stranger', stranger.id, NODE_ID),
    ];
    const operationRepo = {
      findById: async (id: string) => operationStore.find((o) => o.id === id) ?? null,
      findByIdAndUserId: async (id: string, userId: number) =>
        operationStore.find((o) => o.id === id && o.userId === userId) ?? null,
      findByUserId: async (userId: number) => operationStore.filter((o) => o.userId === userId),
      findAll: async () => [...operationStore],
      findByNodeId: async (nodeId: string) => operationStore.filter((o) => o.nodeId === nodeId),
      findByNodeIdAndUserId: async (nodeId: string, userId: number) =>
        operationStore.filter((o) => o.nodeId === nodeId && o.userId === userId),
    } as unknown as OperationRepository;
    const nodeRepo = {
      findById: async () => ({
        id: NODE_ID,
        name: 'n',
        providerId: 'local-unix',
        state: NodeState.Running,
        userId: owner.id,
        vcpuCount: 1,
        memoryBytes: 1,
        diskSizeBytes: 1,
        primaryIpAddress: null,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startedAt: null,
      }),
      findByIdAndUserId: async (id: string, userId: number) =>
        userId === owner.id ? await nodeRepo.findById(id) : null,
    } as unknown as NodeRepository;
    service = new OperationService(operationRepo, nodeRepo);
  });

  it('returns owned operations and 404s foreign ones for non-admins', async () => {
    expect((await service.getOperation('op-owner', owner)).id).toBe('op-owner');
    await expect(service.getOperation('op-owner', stranger)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect((await service.getOperation('op-owner', admin)).id).toBe('op-owner');
  });

  it('404s unknown operations', async () => {
    await expect(service.getOperation('missing', owner)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('scopes listings and gates cross-user reads', async () => {
    expect(await service.listOperations({}, owner)).toHaveLength(1);
    await expect(service.listOperations({ all: true }, owner)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(await service.listOperations({ all: true }, admin)).toHaveLength(2);
  });

  it('rejects invalid query input with 400', async () => {
    await expect(service.listOperations({ limit: -1 }, owner)).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(service.listOperations({ nodeId: 'not-a-uuid' }, owner)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
