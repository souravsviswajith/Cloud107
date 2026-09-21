import {
  ComputeNode,
  ComputeProviderCapabilities,
  NetworkAttachmentResult,
  NetworkAttachmentSpec,
  NodePerformanceMetrics,
  NodeProvisioningSpec,
  NodeState,
  ProviderHealthCheck,
} from '../../../types';

/**
 * Outcome of a provider-executed node operation. Returned to the service
 * layer, which persists it on the operation ledger and advances node state.
 */
export interface NodeOperationOutcome {
  success: boolean;
  message: string;
  /** Wall-clock time spent in provider execution, in milliseconds. */
  durationMs: number;
  resultingState: NodeState;
  primaryIpAddress?: string | null;
  metadata?: Record<string, string>;
}

/**
 * Sovereign compute provider contract (TypeScript mirror of
 * `IComputeProvider` in `src/Cloud107.Core/Providers/IComputeProvider.cs`).
 *
 * Providers are stateless execution engines: they interrogate the host OS
 * and perform real work. Persistence (node rows, operation ledger) stays in
 * the repositories, orchestration in the services. Providers MUST NOT keep
 * in-memory node arrays or return mock values.
 */
export interface ComputeProvider {
  readonly providerId: string;
  readonly displayName: string;
  readonly capabilities: ComputeProviderCapabilities;

  /** Verifies host prerequisites by interrogating the native OS. */
  checkHealth(): Promise<ProviderHealthCheck>;

  /**
   * Provisions backing resources for an already-persisted node (state dir,
   * capacity validation). Returns the observed primary IP and host facts.
   */
  provision(node: ComputeNode, spec: NodeProvisioningSpec): Promise<NodeOperationOutcome>;

  /** Activates a provisioned node. */
  start(node: ComputeNode): Promise<NodeOperationOutcome>;

  /** Halts a running node. `force` selects an immediate hard halt. */
  stop(node: ComputeNode, force: boolean): Promise<NodeOperationOutcome>;

  /** Reclaims all backing resources for a node. */
  terminate(node: ComputeNode): Promise<NodeOperationOutcome>;

  /** Attaches node networking, reporting the observed host interface. */
  attachNetwork(node: ComputeNode, spec: NetworkAttachmentSpec): Promise<NetworkAttachmentResult>;

  /** Samples live CPU/memory/IO telemetry from the host OS. */
  getMetrics(node: ComputeNode): Promise<NodePerformanceMetrics>;
}
