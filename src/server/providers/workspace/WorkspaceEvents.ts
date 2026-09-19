import { EventEmitter } from 'events';
import { WorkspaceState } from '../../../types';
import { WorkspaceMetrics } from './WorkspaceProvider';

export enum WorkspaceEventTypes {
  STATE_CHANGED = 'state_changed',
  METRICS_UPDATED = 'metrics_updated',
  ERROR = 'error'
}

export interface WorkspaceStateChangedEvent {
  workspaceId: string;
  userId: number;
  oldState: WorkspaceState;
  newState: WorkspaceState;
  timestamp: Date;
}

export interface WorkspaceMetricsUpdatedEvent {
  workspaceId: string;
  userId: number;
  metrics: WorkspaceMetrics;
  timestamp: Date;
}

class WorkspaceEventEmitter extends EventEmitter {}

export const workspaceEvents = new WorkspaceEventEmitter();
