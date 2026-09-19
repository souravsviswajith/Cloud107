import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HyperVWorkspaceProvider } from '../HyperVWorkspaceProvider';
import { WorkspaceState } from '../../../../types';

describe('HyperVWorkspaceProvider', () => {
  let provider: HyperVWorkspaceProvider;
  let mockRepo: unknown;

  beforeEach(() => {
    provider = new HyperVWorkspaceProvider();
    
    mockRepo = {
      findAllByUserId: vi.fn().mockResolvedValue([]),
      findByIdAndUserId: vi.fn().mockImplementation(async (id, userId) => ({
        id, name: 'Mock WS', userId, state: WorkspaceState.Offline, createdAt: '', updatedAt: ''
      })),
      create: vi.fn().mockImplementation(async (id, name, userId, state) => ({
        id, name, userId, state, createdAt: '', updatedAt: ''
      })),
      updateState: vi.fn().mockImplementation(async (id, userId, state) => ({
        id, name: 'Mock WS', userId, state, createdAt: '', updatedAt: ''
      })),
    };
    
    (provider as unknown as { workspaceRepository: unknown, executor: unknown }).workspaceRepository = mockRepo;
    
    vi.spyOn((provider as unknown as { workspaceRepository: unknown, executor: unknown }).executor, 'execute').mockResolvedValue('');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a workspace', async () => {
    const ws = await provider.create('HyperV WS', 1);
    expect(ws.name).toBe('HyperV WS');
    expect(ws.userId).toBe(1);
    expect(ws.state).toBe(WorkspaceState.Offline);
    expect((provider as unknown as { workspaceRepository: unknown, executor: unknown }).executor.execute).toHaveBeenCalled();
  });

  it('should list workspaces', async () => {
    const list = await provider.list(1);
    expect(Array.isArray(list)).toBe(true);
  });

  it('should start a workspace', async () => {
    const ws = await provider.create('HyperV WS', 1);
    const started = await provider.start(ws.id, 1);
    expect(started.state).toBe(WorkspaceState.Running);
    expect((provider as unknown as { workspaceRepository: unknown, executor: unknown }).executor.execute).toHaveBeenCalledWith(expect.stringContaining('Start-VM'));
  });

  it('should get metrics', async () => {
    const ws = await provider.create('HyperV WS', 1);
    // Mock the metrics output
    (provider as unknown as { workspaceRepository: unknown, executor: unknown }).executor.execute.mockResolvedValueOnce(JSON.stringify({ AverageProcessorUsage: 10, AverageMemoryUsage: 1024 }))
                                       .mockResolvedValueOnce(JSON.stringify({ State: 'Running' }));
    
    const metrics = await provider.getMetrics(ws.id, 1);
    expect(metrics.cpuUsage).toBe(10);
    expect(metrics.memoryUsage).toBe(1024);
    expect(metrics.status).toBe(WorkspaceState.Running.toString());
  });
});
