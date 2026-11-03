import { randomUUID } from 'node:crypto';
import {
  DEFAULT_SECURITY_POLICY,
  evaluateSecurityEvent,
  type SecurityPolicy,
  type SecurityEvent,
} from './security-policy';
import type { SaaSProviderReporter } from './saas-provider';

export interface NodeHookContext {
  subjectId: string;
  nodeId: string;
  action: string;
  source?: SecurityEvent['source'];
}

export interface NodeHook {
  before(context: NodeHookContext): Promise<void>;
  after(context: NodeHookContext, error?: unknown): Promise<void>;
}

export class SecurityNodeHook implements NodeHook {
  constructor(
    private readonly policy: SecurityPolicy = DEFAULT_SECURITY_POLICY,
    private readonly reporter?: SaaSProviderReporter,
  ) {}

  async before(context: NodeHookContext): Promise<void> {
    void context;
  }

  async after(context: NodeHookContext, error?: unknown): Promise<void> {
    if (!error) return;

    const event: SecurityEvent = {
      eventId: randomUUID(),
      timestamp: new Date().toISOString(),
      subjectId: context.subjectId,
      nodeId: context.nodeId,
      source: context.source ?? 'node-hook',
      action: context.action,
      severity: 'high',
      reason: error instanceof Error ? error.message : String(error),
    };

    const decision = evaluateSecurityEvent(event, this.policy);
    if (decision.reportRequired && this.reporter) {
      await this.reporter.report(event, decision);
    }
    if (decision.decision === 'ban' && this.policy.failClosed) {
      throw new Error(`Security policy blocked node action: ${event.action}`);
    }
  }
}
