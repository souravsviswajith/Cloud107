import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MockWorkspaceProvider } from '../MockWorkspaceProvider';
import { WorkspaceState } from '../../../../types';

describe('MockWorkspaceProvider', () => {
  let provider: MockWorkspaceProvider;
  let mockRepo: unknown;

  beforeEach(() => {
    provider = new MockWorkspaceProvider();

    mockRepo = {
      findAllByUserId: vi.fn().mockResolvedValue([]),
      findByIdAndUserId: vi.fn().mockImplementation(async (id, userId) => ({
        id,
        name: 'Mock WS',
        userId,
        state: WorkspaceState.Offline,
        createdAt: '',
        updatedAt: '',
      })),
      create: vi.fn().mockImplementation(async (id, name, userId, state) => ({
        id,
        name,
        userId,
        state,
        createdAt: '',
        updatedAt: '',
      })),
      updateState: vi.fn().mockImplementation(async (id, userId, state) => ({
        id,
        name: 'Mock WS',
        userId,
        state,
        createdAt: '',
        updatedAt: '',
      })),
    };

    // Inject the mock repo
    (provider as unknown as { workspaceRepository: unknown }).workspaceRepository = mockRepo;

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should create a workspace', async () => {
    const ws = await provider.create('Test WS', 1);
    expect(ws.name).toBe('Test WS');
    expect(ws.userId).toBe(1);
    expect(ws.state).toBe(WorkspaceState.Offline);

    const fetched = await provider.get(ws.id, 1);
    expect(fetched?.id).toBe(ws.id);
  });

  it('should list workspaces', async () => {
    const list = await provider.list(1);
    expect(Array.isArray(list)).toBe(true);
  });

  it('should simulate start operation', async () => {
    const ws = await provider.create('Test WS', 1);
    const started = await provider.start(ws.id, 1);
    expect(started.state).toBe(WorkspaceState.Starting);
  });

  it('should return mock metrics', async () => {
    const metrics = await provider.getMetrics('any-id', 1);
    expect(metrics).toHaveProperty('cpuUsage');
    expect(metrics).toHaveProperty('memoryUsage');
    expect(metrics.status).toBe('simulated');
  });
});
