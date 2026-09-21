import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import { promises as fsp } from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { ComputeNode, NodeState, NodeProvisioningSpec } from '../../../../types';
import { LocalUnixProvider } from '../LocalUnixProvider';

function makeNode(id: string): ComputeNode {
  return {
    id,
    name: 'test-node',
    providerId: 'local-unix',
    state: NodeState.Provisioning,
    userId: 1,
    vcpuCount: 1,
    memoryBytes: 256 * 1024 * 1024,
    diskSizeBytes: 1024 * 1024 * 1024,
    primaryIpAddress: null,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    startedAt: null,
  };
}

function makeSpec(): NodeProvisioningSpec {
  return {
    name: 'test-node',
    virtualCpuCount: 1,
    memoryBytes: 256 * 1024 * 1024,
    diskSizeBytes: 1024 * 1024 * 1024,
    guestOs: 'linux',
  };
}

describe('LocalUnixProvider (real OS interrogation)', () => {
  const stateDir = path.join(os.tmpdir(), `c107-provider-test-${process.pid}`);
  const provider = new LocalUnixProvider(stateDir);

  beforeAll(async () => {
    await fsp.mkdir(stateDir, { recursive: true });
  });

  afterAll(async () => {
    await fsp.rm(stateDir, { recursive: true, force: true });
  });

  it('exposes capabilities derived from the live host', () => {
    const capabilities = provider.capabilities;
    expect(capabilities.supportsLiveMigration).toBe(false);
    expect(capabilities.supportedGuestOperatingSystems).toContain('linux');
    // Architecture must match the actual machine — never a mock value.
    expect(capabilities.supportedArchitectures).toContain(
      os.arch() === 'arm64' ? 'aarch64' : os.arch(),
    );
  });

  it('checks health against real host prerequisites', async () => {
    const health = await provider.checkHealth();
    expect(typeof health.isHealthy).toBe('boolean');
    expect(typeof health.statusMessage).toBe('string');
    expect(health.subsystemChecks.cpu_available).toBe(os.cpus().length >= 1);
    expect(health.subsystemChecks.sufficient_memory).toBe(os.totalmem() >= 512 * 1024 * 1024);
    expect(health.subsystemChecks.state_dir_writable).toBe(true);
    // Every check must be a real boolean probed from the OS.
    for (const value of Object.values(health.subsystemChecks)) {
      expect(typeof value).toBe('boolean');
    }
  });

  it('rejects reservations exceeding real host capacity', async () => {
    const node = makeNode(uuidv4());
    await expect(
      provider.provision(node, {
        ...makeSpec(),
        virtualCpuCount: os.cpus().length * 4 + 1,
      }),
    ).rejects.toThrow(/exceed host capacity/);
    await expect(
      provider.provision(node, { ...makeSpec(), memoryBytes: os.totalmem() + 1 }),
    ).rejects.toThrow(/exceed host memory/);
  });

  it('walks provision -> start -> metrics -> stop -> terminate against the OS', async () => {
    const node = makeNode(uuidv4());

    const provisioned = await provider.provision(node, makeSpec());
    expect(provisioned.success).toBe(true);
    expect(provisioned.resultingState).toBe(NodeState.Stopped);
    expect(provisioned.durationMs).toBeGreaterThanOrEqual(0);
    expect(typeof provisioned.primaryIpAddress).toBe('string');
    expect(provisioned.metadata?.host).toBe(os.hostname());
    expect(provisioned.metadata?.platform).toBe(os.platform());

    const started = await provider.start({ ...node, state: NodeState.Stopped });
    expect(started.success).toBe(true);
    expect(started.resultingState).toBe(NodeState.Running);
    expect(started.message).toMatch(/OS probe/);

    const metrics = await provider.getMetrics({ ...node, state: NodeState.Running });
    expect(metrics.nodeId).toBe(node.id);
    expect(metrics.cpuUsagePercentage).toBeGreaterThanOrEqual(0);
    expect(metrics.cpuUsagePercentage).toBeLessThanOrEqual(100);
    expect(metrics.memoryTotalBytes).toBe(os.totalmem());
    expect(metrics.memoryUsedBytes).toBeGreaterThan(0);
    expect(metrics.memoryUsedBytes).toBeLessThanOrEqual(metrics.memoryTotalBytes);
    expect(Number.isFinite(metrics.diskReadBytesPerSec)).toBe(true);
    expect(Number.isFinite(metrics.networkRxBytesPerSec)).toBe(true);
    expect(Number.isNaN(Date.parse(metrics.sampledAt))).toBe(false);

    const stopped = await provider.stop({ ...node, state: NodeState.Running }, false);
    expect(stopped.success).toBe(true);
    expect(stopped.resultingState).toBe(NodeState.Stopped);

    const terminated = await provider.terminate({ ...node, state: NodeState.Stopped });
    expect(terminated.success).toBe(true);
    expect(terminated.resultingState).toBe(NodeState.Terminated);

    // Backing state must be reclaimed from disk.
    await expect(fsp.access(path.join(stateDir, node.id))).rejects.toThrow();
  });

  it('reports the observed host interface on network attach', async () => {
    const node = makeNode(uuidv4());
    await provider.provision(node, makeSpec());
    const attachment = await provider.attachNetwork(node, {
      networkType: 'bridge',
      subnetCidr: '10.107.0.0/24',
      enableNat: true,
    });
    expect(attachment.success).toBe(true);
    expect(typeof attachment.assignedIpAddress).toBe('string');
    expect(attachment.assignedIpAddress.length).toBeGreaterThan(0);
    await provider.terminate(node);
  });
});
