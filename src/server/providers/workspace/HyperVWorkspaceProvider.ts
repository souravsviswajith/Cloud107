import { 
  WorkspaceProvider, 
  WorkspaceMetrics, 
  WorkspaceProviderCapabilities,
  
  
} from './WorkspaceProvider';
import { Workspace, WorkspaceState } from '../../../types';
import { WorkspaceRepository } from '../../repositories/workspaceRepository';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { PowerShellExecutor } from './hyperv/PowerShellExecutor';
import { HyperVCommandBuilder } from './hyperv/HyperVCommandBuilder';
import { HyperVCommandParser } from './hyperv/HyperVCommandParser';
import { HyperVError } from './hyperv/HyperVErrors';
import { workspaceEvents, WorkspaceEventTypes } from './WorkspaceEvents';

export class HyperVWorkspaceProvider implements WorkspaceProvider {
  private workspaceRepository: WorkspaceRepository;
  private executor: PowerShellExecutor;

  constructor() {
    this.workspaceRepository = new WorkspaceRepository();
    this.executor = new PowerShellExecutor();
  }

  getCapabilities(): WorkspaceProviderCapabilities {
    return {
      supportsSuspend: true,
      supportsMetrics: true,
      supportsDynamicResize: false
    };
  }

  async list(userId: number): Promise<Workspace[]> {
    return this.workspaceRepository.findAllByUserId(userId);
  }

  async get(id: string, userId: number): Promise<Workspace | null> {
    return this.workspaceRepository.findByIdAndUserId(id, userId);
  }

  async create(name: string, userId: number): Promise<Workspace> {
    const id = uuidv4();
    logger.info(`[Hyper-V] Provisioning new VM for workspace ${id}`);
    
    try {
      const command = HyperVCommandBuilder.createVM(id, name);
      await this.executor.execute(command);
      return this.workspaceRepository.create(id, name, userId, WorkspaceState.Offline);
    } catch (error) {
      logger.error(`[Hyper-V] Failed to create VM ${id}`, { error });
      throw new HyperVError(`Failed to create workspace: ${error}`);
    }
  }

  async start(id: string, userId: number): Promise<Workspace> {
    logger.info(`[Hyper-V] Starting VM for workspace ${id}, user ${userId}`);
    await this.verifyAccess(id, userId);
    
    try {
      await this.updateState(id, userId, WorkspaceState.Starting);
      const command = HyperVCommandBuilder.startVM(id);
      await this.executor.execute(command);
      
      const updated = await this.updateState(id, userId, WorkspaceState.Running);
      return updated;
    } catch (error) {
      logger.error(`[Hyper-V] Failed to start VM ${id}`, { error });
      await this.updateState(id, userId, WorkspaceState.Error);
      throw new HyperVError(`Failed to start workspace: ${error}`);
    }
  }

  async stop(id: string, userId: number): Promise<Workspace> {
    logger.info(`[Hyper-V] Stopping VM for workspace ${id}, user ${userId}`);
    await this.verifyAccess(id, userId);
    
    try {
      await this.updateState(id, userId, WorkspaceState.Stopping);
      const command = HyperVCommandBuilder.stopVM(id);
      await this.executor.execute(command);
      
      const updated = await this.updateState(id, userId, WorkspaceState.Offline);
      return updated;
    } catch (error) {
      logger.error(`[Hyper-V] Failed to stop VM ${id}`, { error });
      throw new HyperVError(`Failed to stop workspace: ${error}`);
    }
  }

  async restart(id: string, userId: number): Promise<Workspace> {
    logger.info(`[Hyper-V] Restarting VM for workspace ${id}, user ${userId}`);
    await this.verifyAccess(id, userId);
    
    try {
      await this.updateState(id, userId, WorkspaceState.Starting);
      const command = HyperVCommandBuilder.restartVM(id);
      await this.executor.execute(command);
      
      const updated = await this.updateState(id, userId, WorkspaceState.Running);
      return updated;
    } catch (error) {
      logger.error(`[Hyper-V] Failed to restart VM ${id}`, { error });
      await this.updateState(id, userId, WorkspaceState.Error);
      throw new HyperVError(`Failed to restart workspace: ${error}`);
    }
  }

  async suspend(id: string, userId: number): Promise<Workspace> {
    logger.info(`[Hyper-V] Suspending VM for workspace ${id}, user ${userId}`);
    await this.verifyAccess(id, userId);
    
    try {
      await this.updateState(id, userId, WorkspaceState.Stopping);
      const command = HyperVCommandBuilder.suspendVM(id);
      await this.executor.execute(command);
      
      const updated = await this.updateState(id, userId, WorkspaceState.Stopped);
      return updated;
    } catch (error) {
      logger.error(`[Hyper-V] Failed to suspend VM ${id}`, { error });
      throw new HyperVError(`Failed to suspend workspace: ${error}`);
    }
  }

  async connect(id: string, userId: number): Promise<Workspace> {
    logger.info(`[Hyper-V] Connecting to VM for workspace ${id}, user ${userId}`);
    await this.verifyAccess(id, userId);
    
    // In a real implementation this might setup XRDP/VNC endpoints, tokens, etc.
    // For now we just return the workspace indicating connecting state.
    return this.updateState(id, userId, WorkspaceState.Connecting);
  }

  async disconnect(id: string, userId: number): Promise<Workspace> {
    logger.info(`[Hyper-V] Disconnecting from VM for workspace ${id}, user ${userId}`);
    await this.verifyAccess(id, userId);
    
    // We revert to running state once disconnected (assuming it wasn't stopped)
    return this.updateState(id, userId, WorkspaceState.Running);
  }

  async delete(id: string, userId: number): Promise<void> {
    await this.workspaceRepository.delete(id, userId);
  }

  async getStatus(id: string, userId: number): Promise<WorkspaceState> {
    await this.verifyAccess(id, userId);
    
    try {
      const command = HyperVCommandBuilder.getVM(id);
      const output = await this.executor.execute(command);
      const state = HyperVCommandParser.parseVMStatus(output);
      
      // Sync state back to DB if it differs
      const workspace = await this.get(id, userId);
      if (workspace && workspace.state !== state) {
        await this.updateState(id, userId, state);
      }
      
      return state;
    } catch (error) {
      logger.error(`[Hyper-V] Failed to get status for VM ${id}`, { error });
      return WorkspaceState.Error;
    }
  }

  async getMetrics(id: string, userId: number): Promise<WorkspaceMetrics> {
    await this.verifyAccess(id, userId);
    
    try {
      const command = HyperVCommandBuilder.getVMMetrics(id);
      const output = await this.executor.execute(command);
      const parsed = HyperVCommandParser.parseVMMetrics(output);
      
      const status = await this.getStatus(id, userId);
      
      const metrics: WorkspaceMetrics = {
        cpuUsage: parsed.cpuUsage || 0,
        memoryUsage: parsed.memoryUsage || 0,
        uptime: 0, // Would be fetched from getVM, mocked for now
        status: status.toString()
      };
      
      workspaceEvents.emit(WorkspaceEventTypes.METRICS_UPDATED, {
        workspaceId: id,
        userId,
        metrics,
        timestamp: new Date()
      });
      
      return metrics;
    } catch (error) {
      logger.error(`[Hyper-V] Failed to get metrics for VM ${id}`, { error });
      throw new HyperVError(`Failed to get metrics: ${error}`);
    }
  }
  
  private async verifyAccess(id: string, userId: number): Promise<Workspace> {
    const workspace = await this.get(id, userId);
    if (!workspace) {
      throw new Error('Workspace not found or unauthorized');
    }
    return workspace;
  }
  
  private async updateState(id: string, userId: number, newState: WorkspaceState): Promise<Workspace> {
    await this.verifyAccess(id, userId);
    const oldState = (await this.get(id, userId))!.state;
    
    const updated = await this.workspaceRepository.updateState(id, userId, newState);
    if (!updated) {
      throw new Error('Failed to update workspace state');
    }
    
    workspaceEvents.emit(WorkspaceEventTypes.STATE_CHANGED, {
      workspaceId: id,
      userId,
      oldState,
      newState,
      timestamp: new Date()
    });
    
    return updated;
  }
}
