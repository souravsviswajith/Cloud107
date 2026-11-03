import type { ChatInput, ChatResult, ProviderConfig } from './types';

interface ProviderResponse {
  choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
  model?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  error?: { message?: string };
}

export function getProviderConfigs(): ProviderConfig[] {
  const order = (process.env.AI_PROVIDER_ORDER || 'glm')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const configs: Partial<Record<ProviderConfig['name'], ProviderConfig>> = {
    glm: process.env.GLM_API_KEY
      ? {
          name: 'glm',
          baseUrl: (process.env.GLM_BASE_URL || 'https://api.z.ai/api/paas/v4').replace(/\/$/, ''),
          apiKey: process.env.GLM_API_KEY,
          model: process.env.GLM_MODEL || 'glm-5.2',
          inputCostPerMillion: numberEnv('GLM_INPUT_USD_PER_MILLION', 0),
          outputCostPerMillion: numberEnv('GLM_OUTPUT_USD_PER_MILLION', 0),
        }
      : undefined,
    'openai-compatible': process.env.AI_FALLBACK_API_KEY
      ? {
          name: 'openai-compatible',
          baseUrl: (process.env.AI_FALLBACK_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
          apiKey: process.env.AI_FALLBACK_API_KEY,
          model: process.env.AI_FALLBACK_MODEL || 'gpt-4.1-mini',
          inputCostPerMillion: numberEnv('AI_FALLBACK_INPUT_USD_PER_MILLION', 0),
          outputCostPerMillion: numberEnv('AI_FALLBACK_OUTPUT_USD_PER_MILLION', 0),
        }
      : undefined,
  };
  return order
    .map((name) => configs[name as ProviderConfig['name']])
    .filter((config): config is ProviderConfig => Boolean(config));
}

function numberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function completeWithProvider(
  config: ProviderConfig,
  input: ChatInput,
): Promise<ChatResult> {
  const startedAt = Date.now();
  const timeoutMs = numberEnv('AI_PROVIDER_TIMEOUT_MS', 30_000);
  const maxTokens = Math.min(input.maxTokens ?? 1024, numberEnv('AI_MAX_OUTPUT_TOKENS', 2048));
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: input.messages,
      max_tokens: maxTokens,
      temperature: input.temperature ?? 0.2,
      stream: false,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const body = (await response.json().catch(() => ({}))) as ProviderResponse;
  if (!response.ok) {
    throw new Error(`Provider ${config.name} returned HTTP ${response.status}: ${body.error?.message || 'request failed'}`);
  }
  const rawContent = body.choices?.[0]?.message?.content;
  const content = typeof rawContent === 'string'
    ? rawContent
    : Array.isArray(rawContent)
      ? rawContent.map((part) => part.text || '').join('')
      : '';
  if (!content) throw new Error(`Provider ${config.name} returned an empty response`);
  const inputTokens = Math.max(0, body.usage?.prompt_tokens ?? estimateTokens(input.messages));
  const outputTokens = Math.max(0, body.usage?.completion_tokens ?? estimateTokens([{ role: 'assistant', content }]));
  return {
    content,
    provider: config.name,
    model: body.model || config.model,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens: Math.max(0, body.usage?.total_tokens ?? inputTokens + outputTokens),
    },
    latencyMs: Date.now() - startedAt,
  };
}

export function estimateTokens(messages: Array<{ content: string }>): number {
  // Conservative rough estimate used only for preflight when exact tokenization
  // is unavailable. Provider-reported usage replaces it after completion.
  return Math.ceil(messages.reduce((sum, message) => sum + message.content.length, 0) / 3);
}
