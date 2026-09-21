import { z } from 'zod';
import { NodeOperation } from '../../types';
import { OperationRepository } from '../repositories/operationRepository';
import { NodeRepository } from '../repositories/nodeRepository';
import { ApiError, ErrorCode } from '../errors/ApiError';
import {
  AuthPrincipal,
  assertCanAccessOperation,
  assertCanListAll,
  isAdmin,
} from '../policies/capabilityPolicy';

const listOperationsSchema = z.object({
  nodeId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  all: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => value === true || value === 'true')
    .default(false),
});

function toValidationError(error: unknown): ApiError {
  if (error instanceof z.ZodError) {
    const first = error.issues[0];
    const message = first
      ? `${first.path.join('.') || 'input'}: ${first.message}`
      : 'Invalid input';
    return new ApiError(message, 400, ErrorCode.VALIDATION_ERROR, error.issues);
  }
  return new ApiError('Invalid input', 400, ErrorCode.VALIDATION_ERROR);
}

/**
 * Read service for the asynchronous operation ledger. All query input enters
 * as `unknown` and is narrowed with zod; every read is policy-checked.
 */
export class OperationService {
  private readonly operationRepository: OperationRepository;
  private readonly nodeRepository: NodeRepository;

  constructor(operationRepository?: OperationRepository, nodeRepository?: NodeRepository) {
    this.operationRepository = operationRepository ?? new OperationRepository();
    this.nodeRepository = nodeRepository ?? new NodeRepository();
  }

  async getOperation(id: string, principal: AuthPrincipal): Promise<NodeOperation> {
    const operation = isAdmin(principal)
      ? await this.operationRepository.findById(id)
      : await this.operationRepository.findByIdAndUserId(id, principal.id);
    if (!operation) {
      throw new ApiError('Operation not found', 404, ErrorCode.NOT_FOUND);
    }
    assertCanAccessOperation(principal, operation);
    return operation;
  }

  async listOperations(query: unknown, principal: AuthPrincipal): Promise<NodeOperation[]> {
    let parsed: z.infer<typeof listOperationsSchema>;
    try {
      parsed = listOperationsSchema.parse(query);
    } catch (error: unknown) {
      throw toValidationError(error);
    }

    if (parsed.all) {
      assertCanListAll(principal);
      return this.operationRepository.findAll(parsed.limit, parsed.offset);
    }

    if (parsed.nodeId) {
      const node = isAdmin(principal)
        ? await this.nodeRepository.findById(parsed.nodeId)
        : await this.nodeRepository.findByIdAndUserId(parsed.nodeId, principal.id);
      if (!node) {
        throw new ApiError('Node not found', 404, ErrorCode.NOT_FOUND);
      }
      return isAdmin(principal)
        ? this.operationRepository.findByNodeId(parsed.nodeId, parsed.limit, parsed.offset)
        : this.operationRepository.findByNodeIdAndUserId(
            parsed.nodeId,
            principal.id,
            parsed.limit,
            parsed.offset,
          );
    }

    return this.operationRepository.findByUserId(principal.id, parsed.limit, parsed.offset);
  }
}
