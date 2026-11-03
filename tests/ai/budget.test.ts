import { beforeEach, describe, expect, it } from 'vitest';
import { BudgetExceededError, BudgetLedger, estimateCost, utcDay } from '../../src/server/ai/budget';

describe('AI budget ledger', () => {
  const ledger = new BudgetLedger({ dailyUsd: 0.1, requestUsd: 0.06 });
  const day = new Date('2026-10-19T12:00:00.000Z');

  beforeEach(() => {
    // Each test uses a unique user key to avoid coupling to the process ledger.
  });

  it('estimates token costs from configured per-million rates', () => {
    expect(estimateCost(1000, 1000, 1, 2)).toBe(0.003);
  });

  it('uses UTC day boundaries', () => {
    expect(utcDay(day)).toBe('2026-10-19');
  });

  it('rejects requests above the per-request limit', () => {
    expect(() => ledger.assertCanSpend('budget-test-request', 0.061, day))
      .toThrow(BudgetExceededError);
  });

  it('tracks per-user daily spend and token totals', () => {
    const user = 'budget-test-record';
    ledger.record(user, 0.02, 12, 8, day);
    expect(ledger.get(user, day)).toMatchObject({
      spentUsd: 0.02,
      requests: 1,
      inputTokens: 12,
      outputTokens: 8,
    });
    expect(() => ledger.assertCanSpend(user, 0.09, day)).toThrow(BudgetExceededError);
  });
});
