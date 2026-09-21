import { apiGet, apiPost } from './apiClient';
import type {
  ComputeNode,
  ComputeProviderCapabilities,
  NetworkAttachmentResult,
  NodeOperation,
  NodePerformanceMetrics,
  ProviderHealthCheck,
} from '../types';

/**
 * Typed client for the Capability API (`/api/v1/capabilities`, `/nodes`,
 * `/operations`). Response shapes mirror the backend services: mutating and
 * audited calls return both the domain object and its ledger operation, so
 * the UI can project infrastructure state — never invent it.
 */

export interface CapabilitiesResult {
  providerId: string;
  capabilities: ComputeProviderCapabilities;
}

export interface HealthResult {
  health: ProviderHealthCheck;
  operation: NodeOperation;
}

export interface ProvisionResult {
  node: ComputeNode;
  operation: NodeOperation;
}

export interface NodeActionResult {
  node: ComputeNode;
  operation: NodeOperation;
}

export interface MetricsResult {
  metrics: NodePerformanceMetrics;
  operation: NodeOperation;
}

export interface NetworkAttachResult {
  attachment: NetworkAttachmentResult;
  operation: NodeOperation;
}

export interface ProvisionNodeInput {
  name: string;
  virtualCpuCount: number;
  memoryBytes: number;
  diskSizeBytes: number;
  baseImageUri?: string;
  guestOs?: string;
  tags?: Record<string, string>;
  environmentVariables?: Record<string, string>;
}

export const capabilityApi = {
  getCapabilities: async (): Promise<CapabilitiesResult> => {
    return apiGet<CapabilitiesResult>('/capabilities');
  },

  getHealth: async (): Promise<HealthResult> => {
    return apiGet<HealthResult>('/capabilities/health');
  },

  listNodes: async (): Promise<ComputeNode[]> => {
    return apiGet<ComputeNode[]>('/nodes');
  },

  getNode: async (id: string): Promise<ComputeNode> => {
    return apiGet<ComputeNode>(`/nodes/${id}`);
  },

  provisionNode: async (input: ProvisionNodeInput): Promise<ProvisionResult> => {
    return apiPost<ProvisionResult>('/nodes', input);
  },

  startNode: async (id: string): Promise<NodeActionResult> => {
    return apiPost<NodeActionResult>(`/nodes/${id}/start`);
  },

  stopNode: async (id: string, force = false): Promise<NodeActionResult> => {
    return apiPost<NodeActionResult>(`/nodes/${id}/stop`, { force });
  },

  terminateNode: async (id: string): Promise<NodeActionResult> => {
    return apiPost<NodeActionResult>(`/nodes/${id}/terminate`);
  },

  getNodeMetrics: async (id: string): Promise<MetricsResult> => {
    return apiGet<MetricsResult>(`/nodes/${id}/metrics`);
  },

  listNodeOperations: async (id: string): Promise<NodeOperation[]> => {
    return apiGet<NodeOperation[]>(`/nodes/${id}/operations`);
  },
};

export const operationsApi = {
  listOperations: async (query?: {
    nodeId?: string;
    limit?: number;
    offset?: number;
  }): Promise<NodeOperation[]> => {
    const params = new URLSearchParams();
    if (query?.nodeId) {
      params.set('nodeId', query.nodeId);
    }
    if (query?.limit !== undefined) {
      params.set('limit', String(query.limit));
    }
    if (query?.offset !== undefined) {
      params.set('offset', String(query.offset));
    }
    const suffix = params.size > 0 ? `?${params.toString()}` : '';
    return apiGet<NodeOperation[]>(`/operations${suffix}`);
  },

  getOperation: async (id: string): Promise<NodeOperation> => {
    return apiGet<NodeOperation>(`/operations/${id}`);
  },
};
