/**
 * Unix process-family representation.
 *
 * This boundary describes POSIX-compatible process semantics without
 * selecting Linux, macOS, BSD, or another Unix implementation.
 */
export interface UnixProcessSpec {
  executable: string;
  argv: string[];
  environ: Record<string, string>;
  cwd: string;

  stdio: {
    stdin: 'pipe' | 'null' | 'inherit';
    stdout: 'pipe' | 'null' | 'inherit';
    stderr: 'pipe' | 'null' | 'inherit';
  };

  resources: {
    memoryLimit?: number;
    cpuCores?: number;
    timeout?: number;
  };

  hints?: {
    umask?: number;
    niceness?: number;
    closeOnExec?: boolean;
  };
}
