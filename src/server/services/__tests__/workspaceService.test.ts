import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest';
import { WorkspaceService } from '../workspaceService';
import { WorkspaceState } from '../../../types';
import { WorkspaceProvider } from '../../providers/workspace';

describe('WorkspaceService', () => {
  let workspaceService: WorkspaceService;
  let mockProvider: Mocked<WorkspaceProvider>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockProvider = {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      restart: vi.fn(),
      suspend: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      getMetrics: vi.fn(),
      getStatus: vi.fn(),
    } as unknown as Mocked<WorkspaceProvider>;

    workspaceService = new WorkspaceService(mockProvider);
  });

  it('should list workspaces for a user', async () => {
    const mockWorkspaces = [
      {
        id: '1',
        name: 'WS1',
        userId: 1,
        state: WorkspaceState.Offline,
        createdAt: '',
        updatedAt: '',
      },
    ];
    mockProvider.list.mockResolvedValue(mockWorkspaces);

    const result = await workspaceService.listWorkspaces(1);

    expect(mockProvider.list).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockWorkspaces);
  });

  it('should create a workspace', async () => {
    const mockWorkspace = {
      id: 'uuid-1',
      name: 'New WS',
      userId: 1,
      state: WorkspaceState.Offline,
      createdAt: '',
      updatedAt: '',
    };
    mockProvider.create.mockResolvedValue(mockWorkspace);

    const result = await workspaceService.createWorkspace('New WS', 1);

    expect(mockProvider.create).toHaveBeenCalledWith('New WS', 1);
    expect(result).toEqual(mockWorkspace);
  });

  it('should start a workspace', async () => {
    const mockWorkspace = {
      id: '1',
      name: 'WS1',
      userId: 1,
      state: WorkspaceState.Starting,
      createdAt: '',
      updatedAt: '',
    };
    mockProvider.start.mockResolvedValue(mockWorkspace);

    const result = await workspaceService.startWorkspace('1', 1);

    expect(mockProvider.start).toHaveBeenCalledWith('1', 1);
    expect(result).toEqual(mockWorkspace);
  });

  it('should throw if starting an unauthorized or non-existent workspace', async () => {
    mockProvider.start.mockRejectedValue(new Error('Workspace not found or unauthorized'));

    await expect(workspaceService.startWorkspace('1', 1)).rejects.toThrow(
      'Workspace not found or unauthorized',
    );
  });
});
