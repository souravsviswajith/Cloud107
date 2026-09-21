import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  ComputeNode,
  ComputeProviderCapabilities,
  NetworkAttachmentResult,
  NodeOperation,
  NodePerformanceMetrics,
  NodeProvisioningSpec,
  NodeState,
  OperationType,
  ProviderHealthCheck,
} from '../../types';
import { NodeRepository } from '../repositories/nodeRepository';
import { OperationRepository } from '../repositories/operationRepository';
import { ComputeProvider, ComputeProviderFactory } from '../providers/compute';
import { ApiError, ErrorCode } from '../errors/ApiError';
import { logger } from '../utils/logger';
import {
  AuthPrincipal,
  assertCanListAll,
  assertCanManageNode,
  assertCanProvisionNode,
  isAdmin,
} from '../policies/capabilityPolicy';

// ─── Strict input schemas: every `unknown` wire value is narrowed here ───────

const provisionSchema = z.object({
  name: z.string().min(1, 'Node name is required').max(100),
  virtualCpuCount: z.number().int().min(1).max(1024),
  memoryBytes: z
    .number()
    .int()
    .min(128 * 1024 * 1024),
  diskSizeBytes: z
    .number()
    .int()
    .min(1024 * 1024 * 1024),
  baseImageUri: z.string().max(500).optional(),
  guestOs: z.string().max(50).optional(),
  tags: z.record(z.string(), z.string()).optional(),
  environmentVariables: z.record(z.string(), z.string()).optional(),
});

const stopSchema = z
  .object({
    force: z.boolean().optional().default(false),
  })
  .default({ force: false });

const networkAttachSchema = z.object({
  networkType: z.string().min(1).max(50),
  subnetCidr: z.string().min(1).max(50),
  enableNat: z.boolean().default(true),
  assignedPort: z.number().int().min(1).max(65535).optional(),
});

const nodeStateSchema = z.nativeEnum(NodeState);

const listNodesSchema = z.object({
  state: nodeStateSchema.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
  all: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true')
    .default(false),
});

const listNodeOperationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

function toValidationError(error: unknown): ApiError {
  if (error instanceof z.ZodError) {
    const first = error.issues[0];
    const message =
      first != null
        ? `${String(first.path.join('.')) || 'input'}: ${first.message}`
        : 'Invalid input';
    return new ApiError(message, 400, ErrorCode.VALIDATION_ERROR, error.issues);
  }
  return new ApiError('Invalid input', 400, ErrorCode.VALIDATION_ERROR);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

function toRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return { value };
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

export interface HealthResult {
  health: ProviderHealthCheck;
  operation: NodeOperation;
}

/**
 * Capability API service: the control plane for compute nodes.
 *
 * - All external input enters as `unknown` and is narrowed with zod.
 * - Every call is authorized through `capabilityPolicy` checks.
 * - Every mutating call (and every audited read) walks the persistent
 *   operation lifecycle `pending -> running -> completed | failed`.
 * - Execution is delegated to the `ComputeProvider` (real OS work);
 *   state lives in PostgreSQL (repositories).
 */
export class CapabilityService {
  private readonly nodeRepository: NodeRepository;
  private readonly operationRepository: OperationRepository;
  private readonly provider: ComputeProvider;

  constructor(
    nodeRepository?: NodeRepository,
    operationRepository?: OperationRepository,
    provider?: ComputeProvider,
  ) {
    this.nodeRepository = nodeRepository ?? new NodeRepository();
    this.operationRepository = operationRepository ?? new OperationRepository();
    this.provider = provider ?? ComputeProviderFactory.getProvider();
  }

  getCapabilities(): ComputeProviderCapabilities {
    return this.provider.capabilities;
  }

  get providerId(): string {
    return this.provider.providerId;
  }

  async getHealth(principal: AuthPrincipal): Promise<HealthResult> {
    const { operation, outcome } = await this.runLedgerOperation<ProviderHealthCheck>({
      type: 'health_check',
      nodeId: null,
      principal,
      payload: { providerId: this.provider.providerId },
      execute: () => this.provider.checkHealth(),
    });
    return { health: outcome, operation };
  }

  async listNodes(query: unknown, principal: AuthPrincipal): Promise<ComputeNode[]> {
    let parsed: z.infer<typeof listNodesSchema>;
    try {
      parsed = listNodesSchema.parse(query);
    } catch (error: unknown) {
      throw toValidationError(error);
    }

    if (parsed.all) {
      assertCanListAll(principal);
      if (parsed.state) {
        return this.nodeRepository.findAllByState(parsed.state, parsed.limit, parsed.offset);
      }
      return this.nodeRepository.findAll(parsed.limit, parsed.offset);
    }

    if (parsed.state) {
      return this.nodeRepository.findByUserIdAndState(
        principal.id,
        parsed.state,
        parsed.limit,
        parsed.offset,
      );
    }
    return this.nodeRepository.findAllByUserId(principal.id, parsed.limit, parsed.offset);
  }

  async getNode(id: string, principal: AuthPrincipal): Promise<ComputeNode> {
    return this.loadOwnedNode(id, principal);
  }

  async listNodeOperations(
    id: string,
    query: unknown,
    principal: AuthPrincipal,
  ): Promise<NodeOperation[]> {
    await this.loadOwnedNode(id, principal);
    let parsed: z.infer<typeof listNodeOperationsSchema>;
    try {
      parsed = listNodeOperationsSchema.parse(query);
    } catch (error: unknown) {
      throw toValidationError(error);
    }
    return isAdmin(principal)
      ? this.operationRepository.findByNodeId(id, parsed.limit, parsed.offset)
      : this.operationRepository.findByNodeIdAndUserId(
          id,
          principal.id,
          parsed.limit,
          parsed.offset,
        );
  }

  async provisionNode(input: unknown, principal: AuthPrincipal): Promise<ProvisionResult> {
    let spec: NodeProvisioningSpec;
    try {
      spec = provisionSchema.parse(input);
    } catch (error: unknown) {
      throw toValidationError(error);
    }
    assertCanProvisionNode(principal);

    const nodeId = uuidv4();
    const node = await this.nodeRepository.create({
      id: nodeId,
      name: spec.name,
      providerId: this.provider.providerId,
      state: NodeState.Provisioning,
      userId: principal.id,
      vcpuCount: spec.virtualCpuCount,
      memoryBytes: spec.memoryBytes,
      diskSizeBytes: spec.diskSizeBytes,
    });

    logger.info('[CapabilityService] Provisioning node', {
      nodeId,
      userId: principal.id,
      providerId: this.provider.providerId,
    });

    try {
      const { operation, outcome } = await this.runLedgerOperation<{
        message: string;
        durationMs: number;
        primaryIpAddress: string | null;
        metadata: Record<string, string>;
      }>({
        type: 'provision',
        nodeId,
        principal,
        payload: toRecord(spec),
        execute: async () => {
          const result = await this.provider.provision(node, spec);
          return {
            message: result.message,
            durationMs: result.durationMs,
            primaryIpAddress: result.primaryIpAddress ?? null,
            metadata: result.metadata ?? {},
          };
        },
      });

      const updated = await this.nodeRepository.update(nodeId, principal.id, {
        state: NodeState.Stopped,
        primaryIpAddress: outcome.primaryIpAddress,
        metadata: outcome.metadata,
      });
      if (!updated) {
        throw new ApiError('Node vanished during provisioning', 500, ErrorCode.NODE_ERROR);
      }
      return { node: updated, operation };
    } catch (error: unknown) {
      await this.nodeRepository
        .update(nodeId, principal.id, { state: NodeState.Error })
        .catch((updateError: unknown) => {
          logger.error('[CapabilityService] Failed to mark node as Error', {
            nodeId,
            error: errorMessage(updateError),
          });
        });
      throw this.wrapProviderError(error, 'Node provisioning failed');
    }
  }

  async startNode(id: string, principal: AuthPrincipal): Promise<NodeActionResult> {
    const node = await this.loadOwnedNode(id, principal);
    assertCanManageNode(principal, node);
    if (node.state !== NodeState.Stopped) {
      throw new ApiError(
        `Cannot start node in state ${node.state}; expected ${NodeState.Stopped}`,
        409,
        ErrorCode.CONFLICT,
      );
    }

    try {
      const { operation, outcome } = await this.runLedgerOperation<{
        message: string;
        durationMs: number;
      }>({
        type: 'start',
        nodeId: id,
        principal,
        payload: { fromState: node.state },
        execute: async () => {
          const result = await this.provider.start(node);
          return { message: result.message, durationMs: result.durationMs };
        },
      });

      const updated = await this.nodeRepository.update(id, node.userId, {
        state: NodeState.Running,
        startedAt: new Date(),
      });
      if (!updated) {
        throw new ApiError('Node vanished during start', 500, ErrorCode.NODE_ERROR);
      }
      void outcome;
      return { node: updated, operation };
    } catch (error: unknown) {
      throw this.wrapProviderError(error, 'Node start failed');
    }
  }

  async stopNode(id: string, input: unknown, principal: AuthPrincipal): Promise<NodeActionResult> {
    let parsed: z.infer<typeof stopSchema>;
    try {
      parsed = stopSchema.parse(input ?? {});
    } catch (error: unknown) {
      throw toValidationError(error);
    }
    const force = parsed.force === true;

    const node = await this.loadOwnedNode(id, principal);
    assertCanManageNode(principal, node);
    if (node.state !== NodeState.Running) {
      throw new ApiError(
        `Cannot stop node in state ${node.state}; expected ${NodeState.Running}`,
        409,
        ErrorCode.CONFLICT,
      );
    }

    await this.nodeRepository.update(id, node.userId, { state: NodeState.Stopping });

    try {
      const { operation, outcome } = await this.runLedgerOperation<{
        message: string;
        durationMs: number;
        force: boolean;
      }>({
        type: 'stop',
        nodeId: id,
        principal,
        payload: { fromState: node.state, force },
        execute: async () => {
          const result = await this.provider.stop(node, force);
          return { message: result.message, durationMs: result.durationMs, force };
        },
      });

      const updated = await this.nodeRepository.update(id, node.userId, {
        state: NodeState.Stopped,
      });
      if (!updated) {
        throw new ApiError('Node vanished during stop', 500, ErrorCode.NODE_ERROR);
      }
      void outcome;
      return { node: updated, operation };
    } catch (error: unknown) {
      await this.nodeRepository
        .update(id, node.userId, { state: NodeState.Error })
        .catch((updateError: unknown) => {
          logger.error('[CapabilityService] Failed to mark node as Error', {
            nodeId: id,
            error: errorMessage(updateError),
          });
        });
      throw this.wrapProviderError(error, 'Node stop failed');
    }
  }

  async terminateNode(id: string, principal: AuthPrincipal): Promise<NodeActionResult> {
    const node = await this.loadOwnedNode(id, principal);
    assertCanManageNode(principal, node);
    if (
      node.state !== NodeState.Stopped &&
      node.state !== NodeState.Running &&
      node.state !== NodeState.Error
    ) {
      throw new ApiError(`Cannot terminate node in state ${node.state}`, 409, ErrorCode.CONFLICT);
    }

    await this.nodeRepository.update(id, node.userId, { state: NodeState.Terminating });

    try {
      const { operation, outcome } = await this.runLedgerOperation<{
        message: string;
        durationMs: number;
      }>({
        type: 'terminate',
        nodeId: id,
        principal,
        payload: { fromState: node.state },
        execute: async () => {
          const result = await this.provider.terminate(node);
          return { message: result.message, durationMs: result.durationMs };
        },
      });

      const updated = await this.nodeRepository.update(id, node.userId, {
        state: NodeState.Terminated,
      });
      if (!updated) {
        throw new ApiError('Node vanished during terminate', 500, ErrorCode.NODE_ERROR);
      }
      void outcome;
      return { node: updated, operation };
    } catch (error: unknown) {
      await this.nodeRepository
        .update(id, node.userId, { state: NodeState.Error })
        .catch((updateError: unknown) => {
          logger.error('[CapabilityService] Failed to mark node as Error', {
            nodeId: id,
            error: errorMessage(updateError),
          });
        });
      throw this.wrapProviderError(error, 'Node termination failed');
    }
  }

  async attachNetwork(
    id: string,
    input: unknown,
    principal: AuthPrincipal,
  ): Promise<NetworkAttachResult> {
    let spec: {
      networkType: string;
      subnetCidr: string;
      enableNat: boolean;
      assignedPort?: number;
    };
    try {
      spec = networkAttachSchema.parse(input);
    } catch (error: unknown) {
      throw toValidationError(error);
    }

    const node = await this.loadOwnedNode(id, principal);
    assertCanManageNode(principal, node);
    if (node.state !== NodeState.Running && node.state !== NodeState.Stopped) {
      throw new ApiError(
        `Cannot attach network in node state ${node.state}`,
        409,
        ErrorCode.CONFLICT,
      );
    }

    try {
      const { operation, outcome } = await this.runLedgerOperation<NetworkAttachmentResult>({
        type: 'attach_network',
        nodeId: id,
        principal,
        payload: toRecord(spec),
        execute: () => this.provider.attachNetwork(node, spec),
      });
      return { attachment: outcome, operation };
    } catch (error: unknown) {
      throw this.wrapProviderError(error, 'Network attach failed');
    }
  }

  async getNodeMetrics(id: string, principal: AuthPrincipal): Promise<MetricsResult> {
    const node = await this.loadOwnedNode(id, principal);
    const { operation, outcome } = await this.runLedgerOperation<NodePerformanceMetrics>({
      type: 'metrics',
      nodeId: id,
      principal,
      payload: { nodeState: node.state },
      execute: () => this.provider.getMetrics(node),
    });
    return { metrics: outcome, operation };
  }

  // ─── Internals ────────────────────────────────────────────────────────────

  /**
   * Loads a node or throws 404. Ownership is enforced in the query itself
   * for non-admins (no existence oracle for foreign nodes); admins load by
   * id and are policy-checked by the caller.
   */
  private async loadOwnedNode(id: string, principal: AuthPrincipal): Promise<ComputeNode> {
    const node = isAdmin(principal)
      ? await this.nodeRepository.findById(id)
      : await this.nodeRepository.findByIdAndUserId(id, principal.id);
    if (!node) {
      throw new ApiError('Node not found', 404, ErrorCode.NOT_FOUND);
    }
    return node;
  }

  /**
   * Executes provider work inside the persistent operation lifecycle:
   * `pending -> running -> completed | failed`. Transitions are enforced by
   * conditional SQL updates in the repository; failures are recorded on the
   * ledger before the error propagates.
   */
  private async runLedgerOperation<TOutcome>(args: {
    type: OperationType;
    nodeId: string | null;
    principal: AuthPrincipal;
    payload: Record<string, unknown> | null;
    execute: () => Promise<TOutcome>;
  }): Promise<{ operation: NodeOperation; outcome: TOutcome }> {
    const operation = await this.operationRepository.create({
      id: uuidv4(),
      nodeId: args.nodeId,
      userId: args.principal.id,
      type: args.type,
      status: 'pending',
      payload: args.payload,
    });

    const running = await this.operationRepository.markRunning(operation.id);
    if (!running) {
      throw new ApiError(
        'Operation could not start: no longer pending',
        409,
        ErrorCode.OPERATION_ERROR,
      );
    }

    try {
      const outcome = await args.execute();
      const completed = await this.operationRepository.complete(operation.id, toRecord(outcome));
      if (!completed) {
        throw new ApiError(
          'Operation could not complete: no longer running',
          409,
          ErrorCode.OPERATION_ERROR,
        );
      }
      return { operation: completed, outcome };
    } catch (error: unknown) {
      await this.operationRepository
        .fail(operation.id, errorMessage(error))
        .catch((ledgerError: unknown) => {
          logger.error('[CapabilityService] Failed to record operation failure', {
            operationId: operation.id,
            error: errorMessage(ledgerError),
          });
        });
      throw error;
    }
  }

  private wrapProviderError(error: unknown, fallbackMessage: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    logger.error(`[CapabilityService] ${fallbackMessage}`, { error: errorMessage(error) });
    return new ApiError(fallbackMessage, 500, ErrorCode.PROVIDER_ERROR, {
      cause: errorMessage(error),
    });
  }
}
