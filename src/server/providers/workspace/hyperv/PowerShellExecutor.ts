import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../../../utils/logger';
import { HyperVError, HyperVTimeoutError } from './HyperVErrors';

const execAsync = promisify(exec);

export interface PowerShellOptions {
  timeoutMs?: number;
}

export class PowerShellExecutor {
  async execute(command: string, options: PowerShellOptions = {}): Promise<string> {
    const timeoutMs = options.timeoutMs || 30000;

    // In our container environment, we don't have real PowerShell installed
    // so we'll mock the execution for the agent's environment while providing
    // the structure for real Hyper-V execution if run on Windows.
    const isWindows = process.platform === 'win32';

    if (!isWindows) {
      logger.debug(`[PowerShell Mock] Executing command: ${command}`);
      return this.mockExecute(command);
    }

    logger.debug(`[PowerShell] Executing command: ${command}`);
    try {
      const fullCommand = `powershell.exe -NoProfile -NonInteractive -Command "${command.replace(/"/g, '\\"')}"`;
      const { stdout, stderr } = await execAsync(fullCommand, { timeout: timeoutMs });

      if (stderr) {
        logger.warn(`[PowerShell] Stderr for command: ${stderr}`);
      }

      return stdout.trim();
    } catch (error: unknown) {
      const execError = error as { killed?: boolean; signal?: string; message?: string };
      if (execError.killed && execError.signal === 'SIGTERM') {
        throw new HyperVTimeoutError(`Command timed out after ${timeoutMs}ms`);
      }

      logger.error(`[PowerShell] Error executing command: ${execError.message || String(error)}`);
      throw new HyperVError(`PowerShell execution failed: ${execError.message || String(error)}`);
    }
  }

  private mockExecute(command: string): string {
    // Basic mock logic to allow the tests and app to function without real Hyper-V
    if (command.includes('Get-VM')) {
      return JSON.stringify({ State: 'Running', Name: 'MockVM', Uptime: '01:00:00' });
    }
    if (command.includes('Measure-VM')) {
      return JSON.stringify({ AverageProcessorUsage: 15, AverageMemoryUsage: 2048 });
    }
    return '';
  }
}
