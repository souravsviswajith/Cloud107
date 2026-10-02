import { randomUUID } from 'node:crypto';

export const invocationStatuses = [
  'accepted',
  'pending',
  'running',
  'completed',
  'failed',
] as const;

export type CapabilityInvocationStatus = (typeof invocationStatuses)[number];

export interface CapabilityInvocation {
  invocationId: string;
  capability: string;
  status: CapabilityInvocationStatus;
  result?: unknown;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

export function createInvocationId(): string {
  return randomUUID();
}
