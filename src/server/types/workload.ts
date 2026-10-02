export type WorkloadStatus = 'staged' | 'running' | 'stopped' | 'failed' | 'unknown';

export interface Workload {
  id: string;
  urn: string;
  nodeId: string;
  status: WorkloadStatus;
  stagingPath?: string;
  logPath?: string;
  pid?: number;
  createdAt: string;
  updatedAt: string;
}