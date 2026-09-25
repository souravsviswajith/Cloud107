import { describe, expect, it } from 'vitest';
import { InMemoryNodeRegistry, type NodeCapability } from '../../src/core/node-registry';
import { Scheduler } from '../../src/core/scheduler';
import { parseWorkload } from '../../src/core/validation';

const workload = {
  identity: {
    id: 'hello-linux-1.0.0',
    name: 'hello-linux',
    version: '1.0.0',
    provenance: {
      source: 'scheduler-test',
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

const nodes: NodeCapability[] = [
  {
    id: 'node-arm64',
    os: 'linux',
    architecture: 'arm64',
    resources: { memoryAvailable: 4e9, cpuCores: 4, storageAvailable: 100e9 },
    capabilities: { syscalls: [], networking: false, fileSystemAccess: [], devices: [] },
    status: 'online',
  },
  {
    id: 'node-x86-insufficient',
    os: 'linux',
    architecture: 'x86_64',
    resources: { memoryAvailable: 512e6, cpuCores: 2, storageAvailable: 100e9 },
    capabilities: { syscalls: [], networking: false, fileSystemAccess: [], devices: [] },
    status: 'online',
  },
  {
    id: 'node-x86-sufficient',
    os: 'linux',
    architecture: 'x86_64',
    resources: { memoryAvailable: 8e9, cpuCores: 8, storageAvailable: 100e9 },
    capabilities: { syscalls: [], networking: false, fileSystemAccess: [], devices: [] },
    status: 'online',
  },
];

describe('Scheduler: deterministic selection', () => {
  it('rejects architecture mismatch', () => {
    const result = new Scheduler(new InMemoryNodeRegistry(nodes)).schedule(
      parseWorkload(workload),
    );

    const candidate = result.candidates.find((item) => item.node.id === 'node-arm64');
    expect(candidate?.compatible).toBe(false);
    expect(candidate?.reason).toMatch(/platform|architecture/i);
  });

  it('rejects insufficient resources', () => {
    const result = new Scheduler(new InMemoryNodeRegistry(nodes)).schedule(
      parseWorkload(workload),
    );

    const candidate = result.candidates.find(
      (item) => item.node.id === 'node-x86-insufficient',
    );
    expect(candidate?.compatible).toBe(false);
    expect(candidate?.reason).toMatch(/resources/i);
  });

  it('selects the first compatible node deterministically', () => {
    const result = new Scheduler(new InMemoryNodeRegistry(nodes)).schedule(
      parseWorkload(workload),
    );

    expect(result.selected?.id).toBe('node-x86-sufficient');
  });

  it('reports all candidates in registry order', () => {
    const result = new Scheduler(new InMemoryNodeRegistry(nodes)).schedule(
      parseWorkload(workload),
    );

    expect(result.candidates.map((candidate) => candidate.node.id)).toEqual([
      'node-arm64',
      'node-x86-insufficient',
      'node-x86-sufficient',
    ]);
  });

  it('does not schedule offline or degraded nodes', () => {
    const result = new Scheduler(
      new InMemoryNodeRegistry([
        { ...nodes[2], id: 'offline-node', status: 'offline' },
        { ...nodes[2], id: 'degraded-node', status: 'degraded' },
      ]),
    ).schedule(parseWorkload(workload));

    expect(result.selected).toBeNull();
    expect(result.candidates.every((candidate) => !candidate.compatible)).toBe(true);
  });
});
