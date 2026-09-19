import { ApplicationRepository } from '../repositories/applicationRepository';
import { WorkspaceRepository } from '../repositories/workspaceRepository';
import { Application, ApplicationSession, WorkspaceState } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { WorkspaceProvider, ProviderFactory } from '../providers/workspace';
import { logger } from '../utils/logger';

export class ApplicationService {
  private applicationRepository: ApplicationRepository;
  private workspaceRepository: WorkspaceRepository;
  private workspaceProvider: WorkspaceProvider;

  constructor(
    applicationRepo?: ApplicationRepository,
    workspaceRepo?: WorkspaceRepository,
    workspaceProvider?: WorkspaceProvider
  ) {
    this.applicationRepository = applicationRepo || new ApplicationRepository();
    this.workspaceRepository = workspaceRepo || new WorkspaceRepository();
    this.workspaceProvider = workspaceProvider || ProviderFactory.getProvider();
  }

  async listApplications(): Promise<Application[]> {
    return this.applicationRepository.findAll();
  }

  async getApplication(id: string): Promise<Application | null> {
    return this.applicationRepository.findById(id);
  }

  async launchApplication(applicationId: string, workspaceId: string, userId: number): Promise<ApplicationSession> {
    const workspace = await this.workspaceRepository.findByIdAndUserId(workspaceId, userId);
    
    if (!workspace) {
      throw new Error('Workspace not found or unauthorized');
    }
    
    if (workspace.state !== WorkspaceState.Running && workspace.state !== WorkspaceState.Streaming) {
      throw new Error(`Cannot launch application. Workspace is currently in state: ${workspace.state}`);
    }

    const application = await this.applicationRepository.findById(applicationId);
    
    if (!application) {
      throw new Error('Application not found');
    }
    
    if (!application.enabled) {
      throw new Error('Application is currently disabled');
    }
    
    if (!application.installed) {
      throw new Error('Application is not installed on this workspace image');
    }
    
    const activeSession = await this.applicationRepository.findActiveSession(applicationId, workspaceId);
    if (activeSession) {
      logger.info(`Returning existing session for app ${applicationId} on workspace ${workspaceId}`);
      return activeSession;
    }

    const sessionId = uuidv4();
    const session = await this.applicationRepository.createSession({
      id: sessionId,
      applicationId,
      workspaceId,
      userId,
      status: 'launching'
    });

    // Simulate async launch flow
    setTimeout(async () => {
      try {
        await this.applicationRepository.updateSessionStatus(sessionId, 'running');
        logger.info(`[Simulator] Application session ${sessionId} transitioned to running`);
      } catch (e) {
        logger.error(`[Simulator] Failed to update application session ${sessionId}`, { error: e });
      }
    }, 2000);

    return session;
  }

  async stopApplication(sessionId: string, userId: number): Promise<ApplicationSession> {
    const session = await this.applicationRepository.findSessionById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    if (session.userId !== userId) {
      throw new Error('Unauthorized');
    }
    
    return await this.applicationRepository.updateSessionStatus(sessionId, 'stopped') as ApplicationSession;
  }
}
