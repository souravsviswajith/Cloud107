import { WorkspaceProvider, WorkspaceMetrics } from './WorkspaceProvider';
import { Workspace, WorkspaceState } from '../../../types';
import { WorkspaceRepository } from '../../repositories/workspaceRepository';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';

export class MockWorkspaceProvider implements WorkspaceProvider {
  private workspaceRepository: WorkspaceRepository;

  constructor() {
    this.workspaceRepository = new WorkspaceRepository();
  }

  async list(userId: number): Promise<Workspace[]> {
    return this.workspaceRepository.findAllByUserId(userId);
  }

  async get(id: string, userId: number): Promise<Workspace | null> {
    return this.workspaceRepository.findByIdAndUserId(id, userId);
  }

  async create(name: string, userId: number): Promise<Workspace> {
    const id = uuidv4();
    return this.workspaceRepository.create(id, name, userId, WorkspaceState.Offline);
  }

  async start(id: string, userId: number): Promise<Workspace> {
    return this._transitionState(id, userId, WorkspaceState.Starting);
  }

  async stop(id: string, userId: number): Promise<Workspace> {
    return this._transitionState(id, userId, WorkspaceState.Stopping);
  }

  async restart(id: string, userId: number): Promise<Workspace> {
    return this._transitionState(id, userId, WorkspaceState.Starting);
  }

  async suspend(id: string, userId: number): Promise<Workspace> {
    return this._transitionState(id, userId, WorkspaceState.Stopped);
  }

  async connect(id: string, userId: number): Promise<Workspace> {
    return this._transitionState(id, userId, WorkspaceState.Connecting);
  }

  async disconnect(id: string, userId: number): Promise<Workspace> {
    return this._transitionState(id, userId, WorkspaceState.Disconnected);
  }

  async delete(id: string, userId: number): Promise<void> {
    await this.workspaceRepository.delete(id, userId);
  }

  async getStatus(id: string, userId: number): Promise<WorkspaceState> {
    const workspace = await this.get(id, userId);
    if (!workspace) throw new Error('Workspace not found');
    return workspace.state;
  }

  getCapabilities(): import("./WorkspaceProvider").WorkspaceProviderCapabilities {
    return { supportsSuspend: true, supportsMetrics: true, supportsDynamicResize: true };
  }

  async getMetrics(id: string, userId: number): Promise<WorkspaceMetrics> {
    logger.debug(`Fetching mock metrics for workspace ${id}, user ${userId}`);
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      uptime: 3600,
      status: 'simulated'
    };
  }

  private async _transitionState(id: string, userId: number, newState: WorkspaceState): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findByIdAndUserId(id, userId);
    if (!workspace) {
      throw new Error('Workspace not found or unauthorized');
    }
    const updated = await this.workspaceRepository.updateState(id, userId, newState);
    if (!updated) {
      throw new Error('Failed to update workspace state');
    }
    this._simulateOrchestratorCallback(updated, newState);
    return updated;
  }

  private _simulateOrchestratorCallback(workspace: Workspace, state: WorkspaceState) {
    let nextState: WorkspaceState | null = null;
    if (state === WorkspaceState.Starting) {
      nextState = WorkspaceState.Running;
    } else if (state === WorkspaceState.Stopping) {
      nextState = WorkspaceState.Offline;
    } else if (state === WorkspaceState.Connecting) {
      nextState = WorkspaceState.Streaming;
    } else if (state === WorkspaceState.Disconnected) {
      nextState = WorkspaceState.Running;
    }

    if (nextState) {
      setTimeout(async () => {
        try {
          await this.workspaceRepository.updateState(workspace.id, workspace.userId, nextState as WorkspaceState);
          logger.info(`[Simulator] Workspace ${workspace.id} transitioned to ${nextState}`);
        } catch (e) {
          logger.error(`[Simulator] Failed to transition workspace ${workspace.id}`, { error: e });
        }
      }, 5000);
    }
  }
}
