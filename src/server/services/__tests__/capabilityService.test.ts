import { describe, it, expect, beforeEach } from 'vitest';
import {
  ComputeNode,
  NodeOperation,
  NodeState,
  OperationStatus,
} from '../../../types';
import { CapabilityService } from '../capabilityService';
import { NodeRepository } from '../../repositories/nodeRepository';
import { OperationRepository } from '../../repositories/operationRepository';
import { ComputeProvider, NodeOperationOutcome } from '../../providers/compute/ComputeProvider';
import { AuthPrincipal } from '../../policies/capabilityPolicy';
import { ApiError } from '../../errors/ApiError';

/** In-memory node store standing in for PostgreSQL. */
class FakeNodeRepository {
  readonly store = new Map<string, ComputeNode>();

  async findAll(): Promise<ComputeNode[]> {
    return [...this.store.values()];
  }
  async findAllByUserId(userId: number): Promise<ComputeNode[]> {
    return [...this.store.values()].filter((n) => n.userId === userId);
  }
  async findAllByState(state: NodeState): Promise<ComputeNode[]> {
    return [...this.store.values()].filter((n) => n.state === state);
  }
  async findByUserIdAndState(userId: number, state: NodeState): Promise<ComputeNode[]> {
    return [...this.store.values()].filter((n) => n.userId === userId && n.state === state);
  }
  async findById(id: string): Promise<ComputeNode | null> {
    return this.store.get(id) ?? null;
  }
  async findByIdAndUserId(id: string, userId: number): Promise<ComputeNode | null> {
    const node = this.store.get(id);
    return node && node.userId === userId ? node : null;
  }
  async create(input: {
    id: string;
    name: string;
    providerId: string;
    state: NodeState;
    userId: number;
    vcpuCount: number;
    memoryBytes: number;
    diskSizeBytes: number;
  }): Promise<ComputeNode> {
    const now = new Date().toISOString();
    const node: ComputeNode = {
      ...input,
      primaryIpAddress: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      startedAt: null,
    };
    this.store.set(node.id, node);
    return node;
  }
  async update(
    id: string,
    userId: number,
    patch: Partial<ComputeNode>,
  ): Promise<ComputeNode | null> {
    const node = await this.findByIdAndUserId(id, userId);
    if (!node) {
      return null;
    }
    const updated: ComputeNode = {
      ...node,
      ...patch,
      id: node.id,
      userId: node.userId,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }
}

/**
 * In-memory operation ledger that enforces the same lifecycle as the SQL
 * conditional updates: pending -> running -> completed | failed.
 */
class FakeOperationRepository {
  readonly store = new Map<string, NodeOperation>();
  readonly transitions: OperationStatus[] = [];

  async create(input: {
    id: string;
    nodeId: string | null;
    userId: number;
    type: NodeOperation['type'];
    status: OperationStatus;
    payload?: Record<string, unknown> | null;
  }): Promise<NodeOperation> {
    const now = new Date().toISOString();
    const operation: NodeOperation = {
      id: input.id,
      nodeId: input.nodeId,
      userId: input.userId,
      type: input.type,
      status: input.status,
      payload: input.payload ?? null,
      result: null,
      error: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };
    this.store.set(operation.id, operation);
    this.transitions.push(operation.status);
    return operation;
  }
  async findById(id: string): Promise<NodeOperation | null> {
    return this.store.get(id) ?? null;
  }
  async findByIdAndUserId(id: string, userId: number): Promise<NodeOperation | null> {
    const operation = this.store.get(id);
    return operation && operation.userId === userId ? operation : null;
  }
  async findByUserId(userId: number): Promise<NodeOperation[]> {
    return [...this.store.values()].filter((o) => o.userId === userId);
  }
  async findAll(): Promise<NodeOperation[]> {
    return [...this.store.values()];
  }
  async findByNodeIdAndUserId(nodeId: string, userId: number): Promise<NodeOperation[]> {
    return [...this.store.values()].filter((o) => o.nodeId === nodeId && o.userId === userId);
  }
  async findByNodeId(nodeId: string): Promise<NodeOperation[]> {
    return [...this.store.values()].filter((o) => o.nodeId === nodeId);
  }
  async markRunning(id: string): Promise<NodeOperation | null> {
    const operation = this.store.get(id);
    if (!operation || operation.status !== 'pending') {
      return null;
    }
    return this.setStatus(operation, 'running');
  }
  async complete(id: string, result: Record<string, unknown>): Promise<NodeOperation | null> {
    const operation = this.store.get(id);
    if (!operation || operation.status !== 'running') {
      return null;
    }
    const completed: NodeOperation = {
      ...operation,
      status: 'completed',
      result,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, completed);
    this.transitions.push('completed');
    return completed;
  }
  async fail(id: string, error: string): Promise<NodeOperation | null> {
    const operation = this.store.get(id);
    if (!operation || operation.status !== 'running') {
      return null;
    }
    const failed: NodeOperation = {
      ...operation,
      status: 'failed',
      error,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, failed);
    this.transitions.push('failed');
    return failed;
  }
  private setStatus(operation: NodeOperation, status: OperationStatus): NodeOperation {
    const updated: NodeOperation = {
      ...operation,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(operation.id, updated);
    this.transitions.push(status);
    return updated;
  }
}

class FakeProvider implements ComputeProvider {
  readonly providerId = 'fake-test';
  readonly displayName = 'Fake Test Provider';
  readonly capabilities = {
    supportsHardwareGpuPassthrough: false,
    supportsLiveMigration: false,
    supportsNestedVirtualization: false,
    supportsEphemeralSnapshots: false,
    supportedGuestOperatingSystems: ['linux'],
    supportedArchitectures: ['x86_64'],
  };
  failNext: string | null = null;
  calls: string[] = [];

  async checkHealth() {
    this.calls.push('checkHealth');
    return { isHealthy: true, statusMessage: 'fake ok', subsystemChecks: { fake: true } };
  }
  async provision(): Promise<NodeOperationOutcome> {
    this.calls.push('provision');
    this.maybeFail();
    return {
      success: true,
      message: 'fake provisioned',
      durationMs: 1,
      resultingState: NodeState.Stopped,
      primaryIpAddress: '10.0.0.2',
      metadata: { host: 'fake-host' },
    };
  }
  async start(): Promise<NodeOperationOutcome> {
    this.calls.push('start');
    this.maybeFail();
    return { success: true, message: 'fake started', durationMs: 1, resultingState: NodeState.Running };
  }
  async stop(_node: ComputeNode, force: boolean): Promise<NodeOperationOutcome> {
    this.calls.push(`stop:${force}`);
    this.maybeFail();
    return { success: true, message: 'fake stopped', durationMs: 1, resultingState: NodeState.Stopped };
  }
  async terminate(): Promise<NodeOperationOutcome> {
    this.calls.push('terminate');
    this.maybeFail();
    return {
      success: true,
      message: 'fake terminated',
      durationMs: 1,
      resultingState: NodeState.Terminated,
    };
  }
  async attachNetwork() {
    this.calls.push('attachNetwork');
    this.maybeFail();
    return { success: true, interfaceId: 'fake-eth0', assignedIpAddress: '10.0.0.2' };
  }
  async getMetrics(node: ComputeNode) {
    this.calls.push('getMetrics');
    this.maybeFail();
    return {
      nodeId: node.id,
      cpuUsagePercentage: 10,
      memoryUsedBytes: 100,
      memoryTotalBytes: 1000,
      diskReadBytesPerSec: 0,
      diskWriteBytesPerSec: 0,
      networkRxBytesPerSec: 0,
      networkTxBytesPerSec: 0,
      sampledAt: new Date().toISOString(),
    };
  }
  private maybeFail(): void {
    if (this.failNext) {
      const message = this.failNext;
      this.failNext = null;
      throw new Error(message);
    }
  }
}

const owner: AuthPrincipal = { id: 1, uid: 'uid-owner', email: 'o@c107.local', roles: [] };
const stranger: AuthPrincipal = { id: 2, uid: 'uid-stranger', email: 's@c107.local', roles: [] };
const admin: AuthPrincipal = { id: 9, uid: 'uid-admin', email: 'a@c107.local', roles: ['admin'] };

const validSpec: Record<string, unknown> = {
  name: 'node-1',
  virtualCpuCount: 2,
  memoryBytes: 2 * 1024 * 1024 * 1024,
  diskSizeBytes: 20 * 1024 * 1024 * 1024,
};

describe('CapabilityService', () => {
  let nodes: FakeNodeRepository;
  let operations: FakeOperationRepository;
  let provider: FakeProvider;
  let service: CapabilityService;

  beforeEach(() => {
    nodes = new FakeNodeRepository();
    operations = new FakeOperationRepository();
    provider = new FakeProvider();
    service = new CapabilityService(
      nodes as unknown as NodeRepository,
      operations as unknown as OperationRepository,
      provider,
    );
  });

  it('provisions through pending -> running -> completed with provider facts', async () => {
    const { node, operation } = await service.provisionNode(validSpec, owner);

    expect(node.state).toBe(NodeState.Stopped);
    expect(node.userId).toBe(owner.id);
    expect(node.primaryIpAddress).toBe('10.0.0.2');
    expect(node.metadata.host).toBe('fake-host');
    expect(operation.status).toBe('completed');
    expect(operation.type).toBe('provision');
    expect(operation.nodeId).toBe(node.id);
    expect(operations.transitions).toEqual(['pending', 'running', 'completed']);
  });

  it('records failed operations and Error state when the provider fails', async () => {
    provider.failNext = 'disk exploded';
    try {
      await service.provisionNode(validSpec, owner);
      expect.unreachable('provision should have failed');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).message).toBe('Node provisioning failed');
      // Raw provider cause is preserved in details, not leaked as the message.
      expect((error as ApiError).details).toMatchObject({ cause: 'disk exploded' });
    }

    expect(operations.transitions).toEqual(['pending', 'running', 'failed']);
    const [node] = [...nodes.store.values()];
    expect(node.state).toBe(NodeState.Error);
    const [operation] = [...operations.store.values()];
    expect(operation.status).toBe('failed');
    expect(operation.error).toBe('disk exploded');
  });

  it('rejects unknown/invalid input with 400 before touching the provider', async () => {
    const badInputs: unknown[] = [
      null,
      {},
      { name: '', virtualCpuCount: 1, memoryBytes: 1024, diskSizeBytes: 1024 },
      { name: 'x', virtualCpuCount: 0, memoryBytes: 1024, diskSizeBytes: 1024 },
      { name: 'x', virtualCpuCount: 1, memoryBytes: 'lots', diskSizeBytes: 1024 },
      'provision plz',
    ];
    for (const input of badInputs) {
      try {
        await service.provisionNode(input, owner);
        expect.unreachable(`input should have been rejected: ${String(input)}`);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(400);
      }
    }
    expect(provider.calls).toEqual([]);
    expect(nodes.store.size).toBe(0);
  });

  it('starts a stopped node and records the transition', async () => {
    const { node } = await service.provisionNode(validSpec, owner);
    const result = await service.startNode(node.id, owner);
    expect(result.node.state).toBe(NodeState.Running);
    expect(result.node.startedAt).not.toBeNull();
    expect(result.operation.status).toBe('completed');
    expect(result.operation.type).toBe('start');
  });

  it('rejects start from illegal states with 409', async () => {
    const { node } = await service.provisionNode(validSpec, owner);
    await service.startNode(node.id, owner);
    await expect(service.startNode(node.id, owner)).rejects.toMatchObject({ statusCode: 409 });
  });

  it('stops a running node via Stopping -> Stopped', async () => {
    const { node } = await service.provisionNode(validSpec, owner);
    await service.startNode(node.id, owner);
    const result = await service.stopNode(node.id, { force: false }, owner);
    expect(result.node.state).toBe(NodeState.Stopped);
    expect(result.operation.status).toBe('completed');
    expect(provider.calls).toContain('stop:false');
  });

  it('rejects stop from illegal states with 409', async () => {
    const { node } = await service.provisionNode(validSpec, owner);
    await expect(service.stopNode(node.id, {}, owner)).rejects.toMatchObject({ statusCode: 409 });
  });

  it('terminates nodes and lands on Terminated', async () => {
    const { node } = await service.provisionNode(validSpec, owner);
    const result = await service.terminateNode(node.id, owner);
    expect(result.node.state).toBe(NodeState.Terminated);
    expect(result.operation.type).toBe('terminate');
  });

  it('hides foreign nodes from non-owners (404) but not from admins', async () => {
    const { node } = await service.provisionNode(validSpec, owner);
    await expect(service.getNode(node.id, stranger)).rejects.toMatchObject({ statusCode: 404 });
    await expect(service.startNode(node.id, stranger)).rejects.toMatchObject({ statusCode: 404 });
    const asAdmin = await service.getNode(node.id, admin);
    expect(asAdmin.id).toBe(node.id);
  });

  it('scopes listings to the caller unless admin requests all', async () => {
    await service.provisionNode(validSpec, owner);
    expect(await service.listNodes({}, owner)).toHaveLength(1);
    expect(await service.listNodes({}, stranger)).toHaveLength(0);
    await expect(service.listNodes({ all: true }, stranger)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(await service.listNodes({ all: true }, admin)).toHaveLength(1);
  });

  it('audits metric reads on the operation ledger', async () => {
    const { node } = await service.provisionNode(validSpec, owner);
    const { metrics, operation } = await service.getNodeMetrics(node.id, owner);
    expect(metrics.nodeId).toBe(node.id);
    expect(operation.type).toBe('metrics');
    expect(operation.status).toBe('completed');
  });

  it('audits health checks on the operation ledger', async () => {
    const { health, operation } = await service.getHealth(owner);
    expect(health.isHealthy).toBe(true);
    expect(operation.type).toBe('health_check');
    expect(operation.status).toBe('completed');
    expect(operation.nodeId).toBeNull();
  });
});
