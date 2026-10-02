import { describe, expect, it } from 'vitest';
import { lowerToUnixProcess } from './lower';
import type { ExecutionPlan } from '../../core/execution-plan';

const executablePlan: ExecutionPlan = {
  workloadId: 'hello-linux-1.0.0',
  nodeId: 'node-test',
  resolved: {
    dependencies: [],
    capabilities: { required: [], available: [], satisfied: true },
    resources: {
      memoryAvailable: 1_000_000_000,
      memoryRequired: 1_000_000,
      coresAvailable: 2,
      coresRequired: 0,
      satisfied: true,
    },
  },
  authorization: { requiredPolicies: [], authorized: true },
  executable: true,
  execution: {
    executablePath: '/bin/echo',
    arguments: ['Hello from Cloud107'],
    environment: { WORKLOAD_VAR: 'value' },
    workingDirectory: '/tmp',
    constraints: {
      memoryLimit: 1_000_000,
      cpuCores: 2,
      timeoutSeconds: 30,
    },
  },
  planId: 'plan-test',
  createdAt: Date.now(),
};

describe('T₃: Unix Process Lowering', () => {
  it('preserves Unix argv convention', () => {
    const spec = lowerToUnixProcess(executablePlan);

    expect(spec.executable).toBe('/bin/echo');
    expect(spec.argv).toEqual(['/bin/echo', 'Hello from Cloud107']);
    expect(spec.argv[0]).toBe(spec.executable);
  });

  it('merges workload environment with inherited environment', () => {
    const spec = lowerToUnixProcess(executablePlan);

    expect(spec.environ.WORKLOAD_VAR).toBe('value');
    expect(spec.environ.PATH).toBeDefined();
  });

  it('preserves working directory and stdio semantics', () => {
    const spec = lowerToUnixProcess(executablePlan);

    expect(spec.cwd).toBe('/tmp');
    expect(spec.stdio).toEqual({
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
    });
  });

  it('carries resource constraints without claiming OS-specific enforcement', () => {
    const spec = lowerToUnixProcess(executablePlan);

    expect(spec.resources).toEqual({
      memoryLimit: 1_000_000,
      cpuCores: 2,
      timeout: 30,
    });
  });

  it('rejects a non-executable plan', () => {
    expect(() =>
      lowerToUnixProcess({
        ...executablePlan,
        executable: false,
        execution: undefined,
        reasonNotExecutable: 'authorization failed',
      }),
    ).toThrow(/Cannot lower non-executable/);
  });
});
