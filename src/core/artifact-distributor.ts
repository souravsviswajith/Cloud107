import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { ArtifactReference } from './artifact';
import type { ArtifactStore } from './artifact-store';
import type { NodeCapability } from './node-registry';

export interface ArtifactDistributionResult {
  available: boolean;
  distributed: boolean;
  path: string;
}

export async function ensureArtifact(
  ref: ArtifactReference,
  node: NodeCapability,
  store: ArtifactStore,
): Promise<ArtifactDistributionResult> {
  if (!node.artifactRoot) {
    throw new Error(`Node ${node.id} does not expose an artifact root`);
  }

  const target = join(node.artifactRoot, ref.path.replace(/^[/\\]+/, ''));
  const { access } = await import('node:fs/promises');

  try {
    await access(target);
    return { available: true, distributed: false, path: target };
  } catch {
    // Continue with distribution.
  }

  if (!(await store.exists(ref))) {
    throw new Error(`Artifact ${ref.id}@${ref.version} is not present in the artifact store`);
  }

  await mkdir(dirname(target), { recursive: true });
  const data = await store.get(ref);
  const temp = `${target}.tmp-${process.pid}-${Date.now()}`;
  const { writeFile, rename } = await import('node:fs/promises');
  await writeFile(temp, data);
  await rename(temp, target);

  return { available: true, distributed: true, path: target };
}
