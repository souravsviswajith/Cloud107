import { describe, it, expect } from 'vitest';
import { NodeState, type OperationStatus } from '../../../types';
import {
  canStartNode,
  canStopNode,
  canTerminateNode,
  formatBytes,
  formatClockTime,
  formatDateTime,
  formatPercent,
  nodeStateDescription,
  nodeStateTone,
  operationStatusLabel,
  operationStatusTone,
  operationTypeLabel,
  supportedLabel,
  supportedTone,
} from '../nodePresentation';

describe('nodeStateTone', () => {
  it('maps every lifecycle state to a tone', () => {
    expect(nodeStateTone(NodeState.Running)).toBe('emerald');
    expect(nodeStateTone(NodeState.Error)).toBe('rose');
    expect(nodeStateTone(NodeState.Pending)).toBe('amber');
    expect(nodeStateTone(NodeState.Provisioning)).toBe('amber');
    expect(nodeStateTone(NodeState.Stopping)).toBe('amber');
    expect(nodeStateTone(NodeState.Terminating)).toBe('amber');
    expect(nodeStateTone(NodeState.Stopped)).toBe('zinc');
    expect(nodeStateTone(NodeState.Terminated)).toBe('zinc');
  });

  it('describes every lifecycle state in operator terms', () => {
    for (const state of Object.values(NodeState)) {
      const description = nodeStateDescription(state);
      expect(description.length).toBeGreaterThan(0);
      expect(description).not.toBe('Unknown state.');
    }
  });
});

describe('lifecycle guards mirror the backend', () => {
  it('allows start only from Stopped', () => {
    expect(canStartNode(NodeState.Stopped)).toBe(true);
    expect(canStartNode(NodeState.Running)).toBe(false);
    expect(canStartNode(NodeState.Error)).toBe(false);
    expect(canStartNode(NodeState.Terminated)).toBe(false);
  });

  it('allows stop only from Running', () => {
    expect(canStopNode(NodeState.Running)).toBe(true);
    expect(canStopNode(NodeState.Stopped)).toBe(false);
    expect(canStopNode(NodeState.Stopping)).toBe(false);
  });

  it('allows terminate from Stopped, Running, or Error', () => {
    expect(canTerminateNode(NodeState.Stopped)).toBe(true);
    expect(canTerminateNode(NodeState.Running)).toBe(true);
    expect(canTerminateNode(NodeState.Error)).toBe(true);
    expect(canTerminateNode(NodeState.Terminated)).toBe(false);
    expect(canTerminateNode(NodeState.Provisioning)).toBe(false);
  });
});

describe('operation presentation', () => {
  it('maps every operation status to a tone and label', () => {
    const cases: Array<[OperationStatus, string, string]> = [
      ['pending', 'amber', 'Pending'],
      ['running', 'sky', 'Running'],
      ['completed', 'emerald', 'Completed'],
      ['failed', 'rose', 'Failed'],
    ];
    for (const [status, tone, label] of cases) {
      expect(operationStatusTone(status)).toBe(tone);
      expect(operationStatusLabel(status)).toBe(label);
    }
  });

  it('humanizes operation types', () => {
    expect(operationTypeLabel('attach_network')).toBe('Attach network');
    expect(operationTypeLabel('health_check')).toBe('Health check');
    expect(operationTypeLabel('provision')).toBe('Provision');
    expect(operationTypeLabel('')).toBe('Unknown');
  });
});

describe('formatters degrade honestly on bad input', () => {
  it('formats byte counts', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe('2 GB');
    expect(formatBytes(-1)).toBe('—');
    expect(formatBytes(Number.NaN)).toBe('—');
  });

  it('formats percentages', () => {
    expect(formatPercent(16.345)).toBe('16.3%');
    expect(formatPercent(Number.NaN)).toBe('—');
  });

  it('formats timestamps', () => {
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('not-a-date')).toBe('—');
    expect(formatDateTime('2026-09-21T00:00:00.000Z')).not.toBe('—');
    expect(formatClockTime(new Date('2026-09-21T00:00:00.000Z')).length).toBeGreaterThan(0);
  });

  it('labels capability flags', () => {
    expect(supportedLabel(true)).toBe('Supported');
    expect(supportedLabel(false)).toBe('Not available');
    expect(supportedTone(true)).toBe('emerald');
    expect(supportedTone(false)).toBe('zinc');
  });
});
