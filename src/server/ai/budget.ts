export interface BudgetConfig {
  dailyUsd: number;
  requestUsd: number;
}

export interface UsageRecord {
  date: string;
  spentUsd: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
}

const records = new Map<string, UsageRecord>();

export function utcDay(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  inputCostPerMillion: number,
  outputCostPerMillion: number,
): number {
  return (
    (inputTokens * inputCostPerMillion + outputTokens * outputCostPerMillion) /
    1_000_000
  );
}

/**
 * Process-local budget ledger. This is a guardrail for a single instance, not a
 * distributed billing ledger; use a shared transactional store before scaling
 * the gateway horizontally.
 */
export class BudgetLedger {
  constructor(private readonly config: BudgetConfig) {}

  get(userId: string, now = new Date()): UsageRecord {
    const key = this.key(userId, now);
    return (
      records.get(key) ?? {
        date: utcDay(now),
        spentUsd: 0,
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
      }
    );
  }

  assertCanSpend(userId: string, estimatedUsd: number, now = new Date()): void {
    if (!Number.isFinite(estimatedUsd) || estimatedUsd < 0) {
      throw new Error('Invalid estimated request cost');
    }
    if (estimatedUsd > this.config.requestUsd) {
      throw new BudgetExceededError('Per-request AI budget exceeded');
    }
    if (this.get(userId, now).spentUsd + estimatedUsd > this.config.dailyUsd) {
      throw new BudgetExceededError('Daily AI budget exceeded');
    }
  }

  record(
    userId: string,
    actualUsd: number,
    inputTokens: number,
    outputTokens: number,
    now = new Date(),
  ): UsageRecord {
    const key = this.key(userId, now);
    const current = this.get(userId, now);
    const next = {
      ...current,
      spentUsd: current.spentUsd + Math.max(0, actualUsd),
      requests: current.requests + 1,
      inputTokens: current.inputTokens + Math.max(0, inputTokens),
      outputTokens: current.outputTokens + Math.max(0, outputTokens),
    };
    records.set(key, next);
    return next;
  }

  private key(userId: string, now: Date): string {
    return `${utcDay(now)}:${userId}`;
  }
}

export class BudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetExceededError';
  }
}
