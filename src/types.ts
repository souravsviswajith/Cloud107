import type React from "react";
export enum WorkspaceState {
  Offline = 'Offline',
  Starting = 'Starting',
  Running = 'Running',
  Connecting = 'Connecting',
  Streaming = 'Streaming',
  Disconnected = 'Disconnected',
  Stopping = 'Stopping',
  Stopped = 'Stopped',
  Error = 'Error',
}

export interface Workspace {
  id: string;
  name: string;
  state: WorkspaceState;
  userId: number; // reference to db users table
  createdAt: string;
  updatedAt: string;
}

export interface VmInstance {
  id: string;
  name: string;
  status: 'offline' | 'provisioning' | 'ready' | 'active';
  gpu: string;
  ram: string;
  vCPU: number;
}

export type WorkspaceMode = 'dashboard' | 'desktop' | 'application' | 'diagnostics';

export interface Application {
  id: string;
  name: string;
  category: 'Development' | 'Creative' | 'AI' | 'Engineering' | 'Utilities' | string;
  icon: string;
  color?: string;
  enabled?: boolean;
  installed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ApplicationSessionStatus = 'launching' | 'running' | 'stopped' | 'error';

export interface ApplicationSession {
  id: string;
  applicationId: string;
  workspaceId: string;
  userId: number;
  status: ApplicationSessionStatus;
  createdAt: string;
  updatedAt: string;
  application?: Application;
  workspace?: Workspace;
}

export interface AppDef extends Application {
  iconComponent?: React.ElementType; // For runtime usage
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export interface SessionState {
  id: string;
  vmId: string;
  activeApps: string[];
  windowStates: WindowState[];
  wallpaper: string;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type StreamQualityProfile = 'performance' | 'balanced' | 'quality';

export interface StreamMetrics {
  fps: number;
  bitrate: number; // in Mbps
  latency: number; // in ms
  resolution: { width: number; height: number };
  packetLoss: number; // percentage
  codec: string;
}
