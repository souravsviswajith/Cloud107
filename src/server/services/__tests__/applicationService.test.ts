import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationService } from '../applicationService';
import { WorkspaceState, Application, ApplicationSession } from '../../../types';
import { ApplicationRepository } from '../../repositories/applicationRepository';
import { WorkspaceRepository } from '../../repositories/workspaceRepository';
import { WorkspaceProvider } from '../../providers/workspace';

describe('ApplicationService', () => {
  let applicationService: ApplicationService;
  let mockAppRepo: vi.Mocked<ApplicationRepository>;
  let mockWorkspaceRepo: vi.Mocked<WorkspaceRepository>;
  let mockProvider: vi.Mocked<WorkspaceProvider>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAppRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      createSession: vi.fn(),
      updateSessionStatus: vi.fn(),
      findSessionById: vi.fn(),
      findActiveSession: vi.fn(),
    } as unknown as vi.Mocked<ApplicationRepository>;

    mockWorkspaceRepo = {
      findByIdAndUserId: vi.fn(),
    } as unknown as vi.Mocked<WorkspaceRepository>;

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
      metrics: vi.fn(),
    } as unknown as vi.Mocked<WorkspaceProvider>;

    applicationService = new ApplicationService(mockAppRepo, mockWorkspaceRepo, mockProvider);
  });

  it('should list applications', async () => {
    const mockApps = [{ id: '1', name: 'VS Code' }] as Application[];
    mockAppRepo.findAll.mockResolvedValue(mockApps);

    const result = await applicationService.listApplications();

    expect(mockAppRepo.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockApps);
  });

  it('should throw if launching on a non-existent workspace', async () => {
    mockWorkspaceRepo.findByIdAndUserId.mockResolvedValue(null);
    await expect(applicationService.launchApplication('app-1', 'ws-1', 1)).rejects.toThrow(
      'Workspace not found or unauthorized',
    );
  });

  it('should throw if launching on a non-running workspace', async () => {
    mockWorkspaceRepo.findByIdAndUserId.mockResolvedValue({
      state: WorkspaceState.Offline,
    } as Partial<Workspace>);
    await expect(applicationService.launchApplication('app-1', 'ws-1', 1)).rejects.toThrow(
      /Cannot launch application/,
    );
  });

  it('should throw if application not found', async () => {
    mockWorkspaceRepo.findByIdAndUserId.mockResolvedValue({
      state: WorkspaceState.Running,
    } as Partial<Workspace>);
    mockAppRepo.findById.mockResolvedValue(null);
    await expect(applicationService.launchApplication('app-1', 'ws-1', 1)).rejects.toThrow(
      'Application not found',
    );
  });

  it('should throw if application is disabled', async () => {
    mockWorkspaceRepo.findByIdAndUserId.mockResolvedValue({
      state: WorkspaceState.Running,
    } as Partial<Workspace>);
    mockAppRepo.findById.mockResolvedValue({
      enabled: false,
      installed: true,
    } as Partial<Workspace>);
    await expect(applicationService.launchApplication('app-1', 'ws-1', 1)).rejects.toThrow(
      'Application is currently disabled',
    );
  });

  it('should launch an application successfully', async () => {
    mockWorkspaceRepo.findByIdAndUserId.mockResolvedValue({
      state: WorkspaceState.Running,
    } as Partial<Workspace>);
    mockAppRepo.findById.mockResolvedValue({
      enabled: true,
      installed: true,
    } as Partial<Workspace>);
    mockAppRepo.findActiveSession.mockResolvedValue(null);

    const mockSession = { id: 'session-1' } as ApplicationSession;
    mockAppRepo.createSession.mockResolvedValue(mockSession);

    const result = await applicationService.launchApplication('app-1', 'ws-1', 1);

    expect(mockAppRepo.createSession).toHaveBeenCalled();
    expect(result).toEqual(mockSession);
  });
});
