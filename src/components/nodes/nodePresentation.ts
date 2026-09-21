import { NodeState, type OperationStatus } from '../../types';
import type { Tone } from '../ui/Glass';

/**
 * Infrastructure state → human-readable state mappings for node surfaces.
 * Pure functions: no fetching, no mocks, no fabricated telemetry. Every
 * visual indicator in the UI resolves through these so the tone and the
 * text label can never disagree.
 */

export function nodeStateTone(state: NodeState): Tone {
  switch (state) {
    case NodeState.Running:
      return 'emerald';
    case NodeState.Error:
      return 'rose';
    case NodeState.Pending:
    case NodeState.Provisioning:
    case NodeState.Stopping:
    case NodeState.Terminating:
      return 'amber';
    case NodeState.Stopped:
    case NodeState.Terminated:
      return 'zinc';
    default:
      return 'zinc';
  }
}

/** One-line operator meaning for each lifecycle state. */
export function nodeStateDescription(state: NodeState): string {
  switch (state) {
    case NodeState.Pending:
      return 'Reservation recorded, awaiting provisioning.';
    case NodeState.Provisioning:
      return 'Provider is allocating backing resources.';
    case NodeState.Running:
      return 'Node is active and executing workloads.';
    case NodeState.Stopping:
      return 'Node is halting.';
    case NodeState.Stopped:
      return 'Node is halted; backing resources retained.';
    case NodeState.Terminating:
      return 'Provider is reclaiming resources.';
    case NodeState.Terminated:
      return 'Resources reclaimed; node ledger closed.';
    case NodeState.Error:
      return 'Last operation failed; operator action required.';
    default:
      return 'Unknown state.';
  }
}

/** Whether the lifecycle action is legal from this state (mirrors backend guards). */
export function canStartNode(state: NodeState): boolean {
  return state === NodeState.Stopped;
}

export function canStopNode(state: NodeState): boolean {
  return state === NodeState.Running;
}

export function canTerminateNode(state: NodeState): boolean {
  return state === NodeState.Stopped || state === NodeState.Running || state === NodeState.Error;
}

export function operationStatusTone(status: OperationStatus): Tone {
  switch (status) {
    case 'completed':
      return 'emerald';
    case 'failed':
      return 'rose';
    case 'running':
      return 'sky';
    case 'pending':
      return 'amber';
    default:
      return 'zinc';
  }
}

export function operationStatusLabel(status: OperationStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'running':
      return 'Running';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
}

/** `attach_network` → `Attach network`. Unknown input degrades to `Unknown`. */
export function operationTypeLabel(type: string): string {
  if (!type) {
    return 'Unknown';
  }
  const words = type.split('_').filter((word) => word.length > 0);
  if (words.length === 0) {
    return 'Unknown';
  }
  return words
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '—';
  }
  if (bytes === 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return `${Math.round(value * 10) / 10}%`;
}

/** ISO timestamp → locale string. Missing/invalid degrades to an em dash. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString();
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString();
}

export function supportedLabel(value: boolean): string {
  return value ? 'Supported' : 'Not available';
}

export function supportedTone(value: boolean): Tone {
  return value ? 'emerald' : 'zinc';
}
