import express from 'express';
import type { Server } from 'node:http';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSchedulingRouter } from '../../../src/server/routes/v1/scheduling';
import { InMemoryNodeRegistry, type NodeCapability } from '../../../src/core/node-registry';
import type { ExecutionPlan } from '../../../src/core/execution-plan';
import { lowerToUnixProcess } from '../../../src/platform/unix/lower';
import { executeUnixProcess } from '../../../src/platform/unix/execute';

const plannerEndpoint = 'http://127.0.0.1:5107';
let planner: ChildProcess | undefined;
let server: Server;

const node: NodeCapability = {
  id: 'node-x86-sufficient',
  os: 'linux',
  architecture: 'x86_64',
  resources: { memoryAvailable: 8e9, cpuCores: 8, storageAvailable: 100e9 },
  capabilities: { syscalls: [], networking: false, fileSystemAccess: ['/'], devices: [] },
  status: 'online',
};

const workload = {
  identity: {
    id: 'hello-linux-1.0.0',
    name: 'hello-linux',
    version: '1.0.0',
    provenance: {
      source: 'schedule-integration-test',
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

async function waitForPlanner(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`${plannerEndpoint}/health`);
      if (response.ok) return;
    } catch {
      // Planner is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error('C# T₂ planner did not become ready.');
}

async function waitForServer(): Promise<number> {
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('HTTP server did not expose a TCP address.');
  }
  return address.port;
}

beforeAll(async () => {
  planner = spawn(
    'dotnet',
    ['run', '--project', 'Core107/Core107.csproj', '--no-launch-profile'],
    { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] },
  );

  planner.stderr?.on('data', () => undefined);
  await waitForPlanner();

  const app = express();
  app.use(express.json());
  app.use(
    '/api/v1/execution',
    createSchedulingRouter(
      new InMemoryNodeRegistry([node]),
      plannerEndpoint,
    ),
  );

  server = app.listen(0);
  await waitForServer();
}, 15_000);

afterAll(async () => {
  if (server.listening) {
    server.close();
    await once(server, 'close');
  }

  if (!planner || planner.exitCode !== null) return;

  planner.kill('SIGTERM');
  await Promise.race([
    once(planner, 'exit'),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);

  if (planner.exitCode === null) planner.kill('SIGKILL');
});

describe('S₁ → schedule → T₂ → S₂ → T₃/T₄', () => {
  it('schedules, plans, and executes hello-linux', async () => {
    const port = await waitForServer();
    const response = await fetch(
      `http://127.0.0.1:${port}/api/v1/execution/schedule-and-plan`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workload }),
      },
    );

    expect(response.status).toBe(200);

    const result = (await response.json()) as {
      scheduled: { id: string };
      plan: {
        executable: boolean;
        execution?: {
          executablePath: string;
          arguments: string[];
        };
      };
    };

    expect(result.scheduled.id).toBe('node-x86-sufficient');
    expect(result.plan.executable).toBe(true);

    const s3 = lowerToUnixProcess(result.plan as ExecutionPlan);
    const s4 = await executeUnixProcess(s3);

    expect(s4.exitCode).toBe(0);
    expect(s4.stdout).toContain('Hello from Cloud107');
  });
});
