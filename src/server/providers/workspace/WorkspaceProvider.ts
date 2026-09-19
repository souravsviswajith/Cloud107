import { Workspace, WorkspaceState } from '../../../types';

export interface WorkspaceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  status: string;
}

export interface WorkspaceConnection {
  url: string;
  token?: string;
  expiresAt: Date;
}

export interface WorkspaceOperationResult {
  success: boolean;
  workspaceId: string;
  operation: string;
  message?: string;
  error?: Error;
}

export interface WorkspaceProviderCapabilities {
  supportsSuspend: boolean;
  supportsMetrics: boolean;
  supportsDynamicResize: boolean;
}

export interface WorkspaceProvider {
  list(userId: number): Promise<Workspace[]>;
  get(id: string, userId: number): Promise<Workspace | null>;
  create(name: string, userId: number): Promise<Workspace>;
  start(id: string, userId: number): Promise<Workspace>;
  stop(id: string, userId: number): Promise<Workspace>;
  restart(id: string, userId: number): Promise<Workspace>;
  suspend(id: string, userId: number): Promise<Workspace>;
  connect(id: string, userId: number): Promise<Workspace>;
  disconnect(id: string, userId: number): Promise<Workspace>;
  getStatus(id: string, userId: number): Promise<WorkspaceState>;
  getMetrics(id: string, userId: number): Promise<WorkspaceMetrics>;
  delete(id: string, userId: number): Promise<void>;
  getCapabilities(): WorkspaceProviderCapabilities;
}
