import { createHash } from 'node:crypto';
import { copyFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import type { ArtifactReference } from './artifact';

export interface ArtifactStore {
  get(ref: ArtifactReference): Promise<Buffer>;
  exists(ref: ArtifactReference): Promise<boolean>;
  put(ref: ArtifactReference, sourcePath: string): Promise<void>;
}

export class FileSystemArtifactStore implements ArtifactStore {
  constructor(private readonly root: string) {}

  private pathFor(ref: ArtifactReference): string {
    return join(this.root, ref.id, ref.version, ref.hash.replace(/^sha256:/, ''));
  }

  async get(ref: ArtifactReference): Promise<Buffer> {
    const { readFile } = await import('node:fs/promises');
    return readFile(this.pathFor(ref));
  }

  async exists(ref: ArtifactReference): Promise<boolean> {
    try {
      await access(this.pathFor(ref));
      return true;
    } catch {
      return false;
    }
  }

  async put(ref: ArtifactReference, sourcePath: string): Promise<void> {
    const { readFile } = await import('node:fs/promises');
    const data = await readFile(sourcePath);
    const actual = `sha256:${createHash('sha256').update(data).digest('hex')}`;
    if (actual.toLowerCase() !== ref.hash.toLowerCase()) {
      throw new Error(`Artifact hash mismatch: expected ${ref.hash}, computed ${actual}`);
    }

    const destination = this.pathFor(ref);
    await mkdir(join(this.root, ref.id, ref.version), { recursive: true });
    await copyFile(sourcePath, destination);
  }
}
