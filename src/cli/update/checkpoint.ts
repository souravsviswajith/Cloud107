import * as fs from 'fs';
import * as path from 'path';
import { Checkpoint } from './types';

const C107_DIR = path.resolve(process.cwd(), '.c107');
const CHECKPOINTS_DIR = path.resolve(C107_DIR, 'checkpoints');
const STAGED_DIR = path.resolve(C107_DIR, 'staged');

/**
 * Ensures checkpoint directories exist.
 */
export function ensureCheckpointDirectories(): void {
  if (!fs.existsSync(C107_DIR)) fs.mkdirSync(C107_DIR, { recursive: true });
  if (!fs.existsSync(CHECKPOINTS_DIR)) fs.mkdirSync(CHECKPOINTS_DIR, { recursive: true });
  if (!fs.existsSync(STAGED_DIR)) fs.mkdirSync(STAGED_DIR, { recursive: true });
}

/**
 * Creates an immutable checkpoint before performing updates.
 */
export function createCheckpoint(currentVersion: string, targetVersion: string): Checkpoint {
  ensureCheckpointDirectories();

  const timestamp = Date.now();
  const id = `chk-${timestamp}-${currentVersion}-to-${targetVersion}`;
  const backupPath = path.resolve(CHECKPOINTS_DIR, id, 'backup');
  const stagedPath = path.resolve(STAGED_DIR, targetVersion);

  fs.mkdirSync(backupPath, { recursive: true });
  fs.mkdirSync(stagedPath, { recursive: true });

  // Backup critical descriptor files
  const criticalFiles = ['package.json', 'metadata.json', 'index.html'];
  for (const file of criticalFiles) {
    const src = path.resolve(process.cwd(), file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.resolve(backupPath, file));
    }
  }

  const checkpoint: Checkpoint = {
    id,
    currentVersion,
    targetVersion,
    timestamp,
    backupPath,
    stagedPath,
    status: 'created',
    metadata: {
      platform: process.platform,
      arch: process.arch,
      node: process.version,
    },
  };

  const checkpointFile = path.resolve(CHECKPOINTS_DIR, id, 'checkpoint.json');
  fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2), 'utf8');

  return checkpoint;
}

/**
 * Loads a checkpoint by ID.
 */
export function loadCheckpoint(id: string): Checkpoint | null {
  const checkpointFile = path.resolve(CHECKPOINTS_DIR, id, 'checkpoint.json');
  if (!fs.existsSync(checkpointFile)) {
    return null;
  }
  const content = fs.readFileSync(checkpointFile, 'utf8');
  return JSON.parse(content) as Checkpoint;
}

/**
 * Updates checkpoint status on disk.
 */
export function updateCheckpointStatus(
  checkpoint: Checkpoint,
  newStatus: Checkpoint['status'],
): Checkpoint {
  checkpoint.status = newStatus;
  const checkpointFile = path.resolve(CHECKPOINTS_DIR, checkpoint.id, 'checkpoint.json');
  fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2), 'utf8');
  return checkpoint;
}

/**
 * Reverts the system to the backup captured in the checkpoint.
 */
export function rollbackToCheckpoint(checkpoint: Checkpoint): boolean {
  try {
    if (!fs.existsSync(checkpoint.backupPath)) {
      console.error(`[c107 rollback] Backup path not found: ${checkpoint.backupPath}`);
      return false;
    }

    const backupFiles = fs.readdirSync(checkpoint.backupPath);
    for (const file of backupFiles) {
      const src = path.resolve(checkpoint.backupPath, file);
      const dest = path.resolve(process.cwd(), file);
      fs.copyFileSync(src, dest);
    }

    updateCheckpointStatus(checkpoint, 'rolled_back');
    return true;
  } catch (err) {
    console.error(`[c107 rollback] Rollback execution failed:`, err);
    return false;
  }
}

/**
 * Lists all existing checkpoints.
 */
export function listCheckpoints(): Checkpoint[] {
  ensureCheckpointDirectories();
  const entries = fs.readdirSync(CHECKPOINTS_DIR);
  const checkpoints: Checkpoint[] = [];

  for (const entry of entries) {
    const file = path.resolve(CHECKPOINTS_DIR, entry, 'checkpoint.json');
    if (fs.existsSync(file)) {
      try {
        const cp = JSON.parse(fs.readFileSync(file, 'utf8')) as Checkpoint;
        checkpoints.push(cp);
      } catch {
        // ignore invalid checkpoint JSONs
      }
    }
  }

  return checkpoints.sort((a, b) => b.timestamp - a.timestamp);
}
