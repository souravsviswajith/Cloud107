import { createHash } from 'node:crypto';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FileSystemArtifactStore } from './artifact-store';
import { ensureArtifact } from './artifact-distributor';
import type { NodeCapability } from './node-registry';

describe('artifact distribution', () => {
  it('verifies, stores, distributes, and resolves an artifact', async () => {
    const root = await mkdtemp(join(tmpdir(), 'cloud107-artifact-'));
    const nodeRoot = await mkdtemp(join(tmpdir(), 'cloud107-node-'));
    const source = join(root, 'game');
    const payload = Buffer.from('game-dwy-test');
    await writeFile(source, payload);

    const hash = `sha256:${createHash('sha256').update(payload).digest('hex')}`;
    const ref = {
      id: 'game-dwy',
      version: '1.0.0',
      hash,
      path: '/opt/game-dwy/bin/game',
    };

    const store = new FileSystemArtifactStore(join(root, 'store'));
    await store.put(ref, source);

    const node: NodeCapability = {
      id: 'node-local',
      os: 'linux',
      architecture: 'x86_64',
      resources: { memoryAvailable: 8_000_000_000, cpuCores: 4, storageAvailable: 1_000_000_000 },
      capabilities: { syscalls: [], networking: false, fileSystemAccess: ['/opt'], devices: [] },
      status: 'online',
      artifactRoot: nodeRoot,
    };

    const result = await ensureArtifact(ref, node, store);
    expect(result.distributed).toBe(true);
    expect(await readFile(result.path)).toEqual(payload);

    await rm(root, { recursive: true, force: true });
    await rm(nodeRoot, { recursive: true, force: true });
  });
});
