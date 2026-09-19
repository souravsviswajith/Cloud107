import { describe, it, expect } from 'vitest';
import { HyperVCommandParser } from '../HyperVCommandParser';
import { WorkspaceState } from '../../../../../types';

describe('HyperVCommandParser', () => {
  it('should parse VM status running', () => {
    const output = JSON.stringify({ State: 'Running' });
    expect(HyperVCommandParser.parseVMStatus(output)).toBe(WorkspaceState.Running);
  });

  it('should parse VM status from array', () => {
    const output = JSON.stringify([{ State: 2 }]); // 2 is Running in Hyper-V
    expect(HyperVCommandParser.parseVMStatus(output)).toBe(WorkspaceState.Running);
  });

  it('should handle malformed status output', () => {
    expect(HyperVCommandParser.parseVMStatus('{ invalid json')).toBe(WorkspaceState.Error);
  });

  it('should parse VM metrics', () => {
    const output = JSON.stringify({ AverageProcessorUsage: 15.5, AverageMemoryUsage: 2048 });
    const metrics = HyperVCommandParser.parseVMMetrics(output);
    expect(metrics.cpuUsage).toBe(15.5);
    expect(metrics.memoryUsage).toBe(2048);
  });

  it('should parse VM metrics from array', () => {
    const output = JSON.stringify([{ AverageProcessorUsage: 10, AverageMemoryUsage: 1024 }]);
    const metrics = HyperVCommandParser.parseVMMetrics(output);
    expect(metrics.cpuUsage).toBe(10);
    expect(metrics.memoryUsage).toBe(1024);
  });
});
