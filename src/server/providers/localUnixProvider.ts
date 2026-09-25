import { NodeProvider } from './provider';
import { CloudNode } from '../types/node';
import { Capability } from '../types/capability';
import { Workload } from '../types/workload';
import * as os from 'os';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { mkdir, copyFile, chmod, readFile, stat } from 'fs/promises';
import { join } from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);
const activeWorkloads = new Map<string, Workload>();
const WORKLOAD_BASE_DIR = join(os.tmpdir(), 'cloud107', 'workloads');

export class LocalUnixProvider implements NodeProvider {
  readonly id = 'local-unix-provider';

  supports(node: CloudNode): boolean {
    return node.platform === 'linux' || node.platform === 'darwin';
  }

  async discoverCapabilities(node: CloudNode): Promise<Capability[]> {
    return [
      {
        id: 'resource.cpu',
        version: '1.0',
        name: 'CPU Load Average',
        description: 'Current 1, 5, and 15 minute CPU load averages',
        type: 'readonly',
        readable: true,
        writable: false,
        schema: { type: 'array' }
      },
      {
        id: 'resource.memory',
        version: '1.0',
        name: 'Free Memory',
        description: 'Available system memory in bytes',
        type: 'readonly',
        readable: true,
        writable: false,
        schema: { type: 'number' }
      },
      {
        id: 'process.execute',
        version: '1.0',
        name: 'Execute Native Command',
        description: 'Executes a command using the native OS shell',
        type: 'action',
        readable: false,
        writable: true,
        schema: {
          type: 'object',
          properties: { command: { type: 'string' } },
          required: ['command']
        },
        constraints: { privileged: true }
      }
    ];
  }

  async executeCapability(node: CloudNode, capability: Capability, input: unknown): Promise<unknown> {
    if (capability.id === 'resource.cpu') return { value: os.loadavg() };
    if (capability.id === 'resource.memory') return { value: os.freemem(), total: os.totalmem() };
    if (capability.id === 'process.execute') {
      const payload = input as Record<string, unknown>;
      if (!payload || typeof payload.command !== 'string') {
        throw new Error("Invalid payload: 'command' must be a string.");
      }
      try {
        const { stdout, stderr } = await execAsync(payload.command);
        return { success: true, stdout: stdout.trim(), stderr: stderr.trim() };
      } catch (err: unknown) {
        const execError = err as { code?: number; message: string };
        throw new Error(`Native execution failed (Code: ${execError.code || 'UNKNOWN'}): ${execError.message}`);
      }
    }
    throw new Error(`Capability ${capability.id} is not supported by ${this.id}`);
  }

  async stageArtifact(node: CloudNode, workloadId: string, urn: string, sourceFilePath: string): Promise<string> {
    const workloadDir = join(WORKLOAD_BASE_DIR, workloadId);
    await mkdir(workloadDir, { recursive: true });
    const artifactName = urn.split('/')[1]?.split('@')[0] || 'binary';
    const stagingPath = join(workloadDir, artifactName);
    const logPath = join(workloadDir, 'output.log');
    await copyFile(sourceFilePath, stagingPath);
    await chmod(stagingPath, 0o755);
    activeWorkloads.set(workloadId, {
      id: workloadId,
      urn,
      nodeId: node.id,
      status: 'staged',
      stagingPath,
      logPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return stagingPath;
  }

  async startWorkload(node: CloudNode, workloadId: string): Promise<void> {
    const workload = activeWorkloads.get(workloadId);
    if (!workload || !workload.stagingPath) throw new Error(`Workload ${workloadId} not found or not staged.`);
    const logStream = fs.createWriteStream(workload.logPath!, { flags: 'a' });
    const child = spawn(workload.stagingPath, [], {
      detached: true,
      stdio: ['ignore', logStream, logStream]
    });
    child.unref();
    workload.pid = child.pid;
    workload.status = 'running';
    workload.updatedAt = new Date().toISOString();
    activeWorkloads.set(workloadId, workload);
    child.on('exit', (code) => {
      workload.status = code === 0 ? 'stopped' : 'failed';
      workload.updatedAt = new Date().toISOString();
      activeWorkloads.set(workloadId, workload);
    });
  }

  async inspectWorkload(node: CloudNode, workloadId: string): Promise<Workload> {
    const workload = activeWorkloads.get(workloadId);
    if (!workload) throw new Error(`Workload ${workloadId} not found on local node.`);
    if (workload.status === 'running' && workload.pid) {
      try {
        process.kill(workload.pid, 0);
      } catch {
        workload.status = 'unknown';
      }
    }
    return workload;
  }

  async getWorkloadLogs(node: CloudNode, workloadId: string, lines: number = 100): Promise<string[]> {
    const workload = activeWorkloads.get(workloadId);
    if (!workload || !workload.logPath) throw new Error(`Workload logs not found for ${workloadId}`);
    try {
      await stat(workload.logPath);
      const logData = await readFile(workload.logPath, 'utf8');
      const logLines = logData.split('\n').filter(line => line.trim().length > 0);
      return logLines.slice(-Math.abs(lines));
    } catch {
      return ['[System] Log file empty or unreadable.'];
    }
  }
}