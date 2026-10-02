import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { parseWorkload } from '../../../src/core/validation';
import { planWorkload } from '../../../src/core/t2-client';
import { lowerToUnixProcess } from '../../../src/platform/unix/lower';
import { executeUnixProcess } from '../../../src/platform/unix/execute';
import type { NodeCapabilities } from '../../../src/core/node-capabilities';

const endpoint = 'http://127.0.0.1:5107';
let planner: ChildProcess | undefined;

const node: NodeCapabilities = {
  nodeId: 'test-node-x86_64',
  os: 'linux',
  architecture: 'x86_64',
  availableMemory: 2_000_000_000,
  availableCores: 2,
  capabilities: {
    networking: false,
    fileSystemRoots: { '/': 'rw' },
    devices: [],
    syscallGroups: [],
  },
  availableDependencies: [],
  authorizationPolicies: [],
};

function helloWorkload() {
  return {
    identity: {
      id: 'hello-linux-1.0.0',
      name: 'hello-linux',
      version: '1.0.0',
      provenance: {
        source: 'integration-test',
        hash: 'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      },
    },
    operation: {
      entrypoint: '/bin/echo',
      arguments: ['Hello from Cloud107'],
    },
    resources: {
      memory: { minimum: 1_000_000 },
    },
    capabilities: {},
    constraints: [{ os: 'linux', architectures: ['x86_64'] }],
    dependencies: [],
  };
}

function highMemoryWorkload() {
  return {
    ...helloWorkload(),
    identity: {
      ...helloWorkload().identity,
      id: 'high-memory-1.0.0',
      name: 'high-memory',
    },
    resources: {
      memory: { minimum: 8_000_000_000 },
    },
  };
}

function slowWorkload() {
  return {
    ...helloWorkload(),
    identity: {
      ...helloWorkload().identity,
      id: 'slow-1.0.0',
      name: 'slow',
    },
    operation: {
      entrypoint: '/bin/sh',
      arguments: ['-c', 'sleep 5'],
    },
  };
}

async function waitForPlanner(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`${endpoint}/health`);
      if (response.ok) return;
    } catch {
      // Planner is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error('C# T₂ planner did not become ready.');
}

beforeAll(async () => {
  planner = spawn(
    'dotnet',
    ['run', '--project', 'Core107/Core107.csproj', '--no-launch-profile'],
    {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  planner.stderr?.on('data', () => undefined);
  await waitForPlanner();
}, 15_000);

afterAll(async () => {
  if (!planner || planner.exitCode !== null) return;

  planner.kill('SIGTERM');
  await Promise.race([
    once(planner, 'exit'),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);

  if (planner.exitCode === null) planner.kill('SIGKILL');
});

describe('S₀ → S₄: Full Pipeline Integration', () => {
  it('executes hello-linux end-to-end through the Unix boundary', async () => {
    const s1 = parseWorkload(helloWorkload());
    expect(s1.identity.name).toBe('hello-linux');

    const s2 = await planWorkload(s1, node, endpoint);
    expect(s2.executable).toBe(true);
    expect(s2.execution?.executablePath).toBe('/bin/echo');
    expect(s2.execution?.arguments).toEqual(['Hello from Cloud107']);

    const s3 = lowerToUnixProcess(s2);
    expect(s3.executable).toBe('/bin/echo');
    expect(s3.argv).toEqual(['/bin/echo', 'Hello from Cloud107']);

    const s4 = await executeUnixProcess(s3);
    expect(s4.exitCode).toBe(0);
    expect(s4.stdout).toContain('Hello from Cloud107');
    expect(s4.pid).toBeGreaterThan(0);
    expect(s4.duration).toBeGreaterThanOrEqual(0);
    expect(s4.signal).toBeNull();
  });

  it('rejects resource shortage at T₂ before Unix lowering', async () => {
    const s1 = parseWorkload(highMemoryWorkload());
    const s2 = await planWorkload(s1, node, endpoint);

    expect(s2.executable).toBe(false);
    expect(s2.reasonNotExecutable).toMatch(/resources/i);
  });

  it('propagates timeout from S₂ through T₃ and T₄', async () => {
    const s1 = parseWorkload(slowWorkload());
    const s2 = await planWorkload(s1, node, endpoint);

    expect(s2.executable).toBe(true);

    const constrainedPlan = {
      ...s2,
      execution: {
        ...s2.execution!,
        constraints: {
          ...s2.execution!.constraints,
          timeoutSeconds: 1,
        },
      },
    };

    const s3 = lowerToUnixProcess(constrainedPlan);
    expect(s3.resources.timeout).toBe(1);

    const s4 = await executeUnixProcess(s3);
    expect(s4.exitCode).toBeNull();
    expect(s4.signal).toBe('SIGTERM');
    expect(s4.duration).toBeLessThan(2_000);
  });
});
