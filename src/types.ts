import type React from 'react';
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

export type WorkspaceMode =
  'dashboard' | 'desktop' | 'application' | 'diagnostics' | 'nodes' | 'operations';

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

// ─────────────────────────────────────────────────────────────────────────────
// Capability API (Release Candidate): compute nodes & operations
//
// Production-grade control plane foundation. These types mirror the
// Cloud107.Core IComputeProvider contract (see src/Cloud107.Core/Providers)
// and are persisted in PostgreSQL via Drizzle (`nodes`, `operations`).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lifecycle states for compute nodes. Mirrors `NodeState` in
 * `src/Cloud107.Core/Providers/IComputeProvider.cs`.
 */
export enum NodeState {
  Pending = 'Pending',
  Provisioning = 'Provisioning',
  Running = 'Running',
  Stopping = 'Stopping',
  Stopped = 'Stopped',
  Terminating = 'Terminating',
  Terminated = 'Terminated',
  Error = 'Error',
}

/**
 * Asynchronous operation lifecycle. Every mutating capability call walks
 * `pending -> running -> completed | failed`, enforced at the SQL layer
 * (conditional updates) as well as in the service layer.
 */
export type OperationStatus = 'pending' | 'running' | 'completed' | 'failed';

export const OPERATION_STATUSES: readonly OperationStatus[] = [
  'pending',
  'running',
  'completed',
  'failed',
];

/**
 * Kinds of work tracked in the `operations` table.
 */
export type OperationType =
  'provision' | 'start' | 'stop' | 'terminate' | 'attach_network' | 'metrics' | 'health_check';

export const OPERATION_TYPES: readonly OperationType[] = [
  'provision',
  'start',
  'stop',
  'terminate',
  'attach_network',
  'metrics',
  'health_check',
];

/**
 * Persisted compute node reservation. `metadata` carries provider-reported
 * facts (host, platform, arch, cpu model) — never mock values.
 */
export interface ComputeNode {
  id: string;
  name: string;
  providerId: string;
  state: NodeState;
  userId: number;
  vcpuCount: number;
  memoryBytes: number;
  diskSizeBytes: number;
  primaryIpAddress: string | null;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
}

/**
 * Persisted asynchronous operation. `payload` is the validated input,
 * `result` the provider outcome, `error` the failure message if any.
 */
export interface NodeOperation {
  id: string;
  nodeId: string | null;
  userId: number;
  type: OperationType;
  status: OperationStatus;
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

/**
 * Validated request to provision a node. Unknown wire input is narrowed to
 * this shape with zod in the service layer before anything else runs.
 */
export interface NodeProvisioningSpec {
  name: string;
  virtualCpuCount: number;
  memoryBytes: number;
  diskSizeBytes: number;
  baseImageUri?: string;
  guestOs?: string;
  tags?: Record<string, string>;
  environmentVariables?: Record<string, string>;
}

/**
 * Operational capabilities exposed by a compute provider. Mirrors
 * `ProviderCapabilities` in `src/Cloud107.Core/Providers/IComputeProvider.cs`.
 */
export interface ComputeProviderCapabilities {
  supportsHardwareGpuPassthrough: boolean;
  supportsLiveMigration: boolean;
  supportsNestedVirtualization: boolean;
  supportsEphemeralSnapshots: boolean;
  supportedGuestOperatingSystems: string[];
  supportedArchitectures: string[];
}

/**
 * Provider self-health and prerequisite verification result.
 */
export interface ProviderHealthCheck {
  isHealthy: boolean;
  statusMessage: string;
  subsystemChecks: Record<string, boolean>;
}

/**
 * Live resource telemetry for a node, sampled from the host OS.
 */
export interface NodePerformanceMetrics {
  nodeId: string;
  cpuUsagePercentage: number;
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  diskReadBytesPerSec: number;
  diskWriteBytesPerSec: number;
  networkRxBytesPerSec: number;
  networkTxBytesPerSec: number;
  sampledAt: string;
}

/**
 * Network attachment specification and result.
 */
export interface NetworkAttachmentSpec {
  networkType: string;
  subnetCidr: string;
  enableNat: boolean;
  assignedPort?: number;
}

export interface NetworkAttachmentResult {
  success: boolean;
  interfaceId: string;
  assignedIpAddress: string;
  mappedPort?: number;
}
