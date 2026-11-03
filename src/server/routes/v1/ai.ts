import { Router } from 'express';
import { z } from 'zod';
import { BudgetExceededError, BudgetLedger, estimateCost } from '../../ai/budget';
import { completeWithProvider, estimateTokens, getProviderConfigs } from '../../ai/providers';
import { requireAuth } from '../../middleware/auth';
import { logger } from '../../utils/logger';

export const aiRouter = Router();

const requestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string().min(1).max(20_000),
        }),
      )
      .min(1)
      .max(40),
    maxTokens: z.number().int().min(1).max(2048).optional(),
    temperature: z.number().min(0).max(2).optional(),
  })
  .strict();

const budget = new BudgetLedger({
  dailyUsd: readLimit('AI_DAILY_BUDGET_USD', 0.25),
  requestUsd: readLimit('AI_REQUEST_BUDGET_USD', 0.05),
});

function readLimit(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

aiRouter.get('/providers', requireAuth, (_req, res) => {
  const providers = getProviderConfigs();
  res.json({
    providers: providers.map(({ name, model }) => ({ name, model })),
    configured: providers.length > 0,
    routing: (process.env.AI_PROVIDER_ORDER || 'glm')
      .split(',')
      .map((item) => item.trim()),
  });
});

aiRouter.get('/usage', requireAuth, (req, res) => {
  res.json({
    usage: budget.get(req.user!.uid),
    budget: {
      dailyUsd: readLimit('AI_DAILY_BUDGET_USD', 0.25),
      requestUsd: readLimit('AI_REQUEST_BUDGET_USD', 0.05),
    },
  });
});

aiRouter.post('/chat', requireAuth, async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
    return;
  }

  const providers = getProviderConfigs();
  if (!providers.length) {
    res.status(503).json({
      error:
        'No AI provider configured. Set GLM_API_KEY or configure an explicit fallback provider.',
    });
    return;
  }

  const input = parsed.data;
  const estimatedInputTokens = estimateTokens(input.messages);
  const maxOutputTokens = Math.min(
    input.maxTokens ?? 1024,
    readLimit('AI_MAX_OUTPUT_TOKENS', 2048),
  );
  // Preflight against the most expensive configured route so failover cannot
  // silently bypass the request budget.
  const estimatedCost = Math.max(
    ...providers.map((provider) =>
      estimateCost(
        estimatedInputTokens,
        maxOutputTokens,
        provider.inputCostPerMillion,
        provider.outputCostPerMillion,
      ),
    ),
  );

  try {
    budget.assertCanSpend(req.user!.uid, estimatedCost);
  } catch (error) {
    if (error instanceof BudgetExceededError) {
      res.status(429).json({ error: error.message });
      return;
    }
    throw error;
  }

  for (const provider of providers) {
    try {
      const result = await completeWithProvider(provider, input);
      const actualCost = estimateCost(
        result.usage.inputTokens,
        result.usage.outputTokens,
        provider.inputCostPerMillion,
        provider.outputCostPerMillion,
      );
      const usage = budget.record(
        req.user!.uid,
        actualCost,
        result.usage.inputTokens,
        result.usage.outputTokens,
      );
      logger.info('AI completion succeeded', {
        provider: result.provider,
        model: result.model,
        latencyMs: result.latencyMs,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        estimatedCostUsd: actualCost,
        correlationId: req.context?.correlationId,
      });
      res.json({
        ...result,
        usage: { ...result.usage, estimatedCostUsd: actualCost },
        budget: usage,
      });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown provider error';
      logger.warn('AI provider failed', {
        provider: provider.name,
        correlationId: req.context?.correlationId,
        error: message.slice(0, 300),
      });
    }
  }

  res.status(502).json({
    error: 'All configured AI providers failed',
    correlationId: req.context?.correlationId,
    providersAttempted: providers.map((provider) => provider.name),
  });
});
