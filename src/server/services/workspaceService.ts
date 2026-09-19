import { Workspace } from '../../types';
import { WorkspaceProvider, ProviderFactory } from '../providers/workspace';

/**
 * Service for managing cloud workspaces.
 * Encapsulates the business logic and delegates infrastructure operations to the WorkspaceProvider.
 */
export class WorkspaceService {
  private provider: WorkspaceProvider;

  /**
   * Initializes the WorkspaceService with an optional provider.
   * @param provider Optional WorkspaceProvider instance, defaults to the system provider.
   */
  constructor(provider?: WorkspaceProvider) {
    this.provider = provider || ProviderFactory.getProvider();
  }

  /**
   * Lists all workspaces for a given user.
   * @param userId The ID of the user requesting the list.
   * @returns A promise resolving to an array of workspaces.
   */
  async listWorkspaces(userId: number): Promise<Workspace[]> {
    return this.provider.list(userId);
  }

  /**
   * Retrieves a specific workspace by ID.
   * @param id The workspace ID.
   * @param userId The ID of the user requesting the workspace.
   * @returns A promise resolving to the workspace or null if not found.
   */
  async getWorkspace(id: string, userId: number): Promise<Workspace | null> {
    return this.provider.get(id, userId);
  }

  /**
   * Creates a new workspace.
   * @param name The name of the new workspace.
   * @param userId The ID of the user creating the workspace.
   * @returns A promise resolving to the newly created workspace.
   */
  async createWorkspace(name: string, userId: number): Promise<Workspace> {
    return this.provider.create(name, userId);
  }

  /**
   * Starts a stopped workspace.
   * @param id The workspace ID.
   * @param userId The ID of the user starting the workspace.
   * @returns A promise resolving to the started workspace.
   */
  async startWorkspace(id: string, userId: number): Promise<Workspace> {
    return this.provider.start(id, userId);
  }

  /**
   * Stops a running workspace.
   * @param id The workspace ID.
   * @param userId The ID of the user stopping the workspace.
   * @returns A promise resolving to the stopped workspace.
   */
  async stopWorkspace(id: string, userId: number): Promise<Workspace> {
    return this.provider.stop(id, userId);
  }

  /**
   * Restarts a running workspace.
   * @param id The workspace ID.
   * @param userId The ID of the user restarting the workspace.
   * @returns A promise resolving to the restarted workspace.
   */
  async restartWorkspace(id: string, userId: number): Promise<Workspace> {
    return this.provider.restart(id, userId);
  }

  /**
   * Suspends a running workspace, preserving its state.
   * @param id The workspace ID.
   * @param userId The ID of the user suspending the workspace.
   * @returns A promise resolving to the suspended workspace.
   */
  async suspendWorkspace(id: string, userId: number): Promise<Workspace> {
    return this.provider.suspend(id, userId);
  }

  /**
   * Connects to a running workspace.
   * @param id The workspace ID.
   * @param userId The ID of the user connecting to the workspace.
   * @returns A promise resolving to the connected workspace.
   */
  async connectWorkspace(id: string, userId: number): Promise<Workspace> {
    return this.provider.connect(id, userId);
  }

  /**
   * Disconnects from a connected workspace.
   * @param id The workspace ID.
   * @param userId The ID of the user disconnecting from the workspace.
   * @returns A promise resolving to the disconnected workspace.
   */
  async disconnectWorkspace(id: string, userId: number): Promise<Workspace> {
    return this.provider.disconnect(id, userId);
  }
  async deleteWorkspace(id: string, userId: number): Promise<void> {
    return this.provider.delete(id, userId);
  }
}
