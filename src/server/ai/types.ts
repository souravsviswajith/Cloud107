export type AiProviderName = 'glm' | 'openai-compatible';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatInput {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResult {
  content: string;
  provider: AiProviderName;
  model: string;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  latencyMs: number;
}

export interface ProviderConfig {
  name: AiProviderName;
  baseUrl: string;
  apiKey: string;
  model: string;
  inputCostPerMillion: number;
  outputCostPerMillion: number;
}
