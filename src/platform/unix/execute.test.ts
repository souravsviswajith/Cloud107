import { describe, expect, it } from 'vitest';
import { executeUnixProcess } from './execute';
import type { UnixProcessSpec } from './process-spec';

const baseSpec: UnixProcessSpec = {
  executable: '/bin/echo',
  argv: ['/bin/echo', 'Hello from Cloud107'],
  environ: { ...process.env } as Record<string, string>,
  cwd: process.cwd(),
  stdio: { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
  resources: {},
};

describe('T₄: Unix Process Execution', () => {
  it('executes a process and captures output', async () => {
    const result = await executeUnixProcess(baseSpec);

    expect(result.exitCode).toBe(0);
    expect(result.signal).toBeNull();
    expect(result.stdout).toContain('Hello from Cloud107');
    expect(result.pid).toBeGreaterThan(0);
  });

  it('captures stderr separately', async () => {
    const result = await executeUnixProcess({
      ...baseSpec,
      executable: '/bin/sh',
      argv: ['/bin/sh', '-c', 'printf "error message" >&2'],
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toContain('error message');
  });

  it('reports non-zero exit status', async () => {
    const result = await executeUnixProcess({
      ...baseSpec,
      executable: '/bin/sh',
      argv: ['/bin/sh', '-c', 'exit 7'],
    });

    expect(result.exitCode).toBe(7);
    expect(result.signal).toBeNull();
  });

  it('enforces timeout through SIGTERM', async () => {
    const result = await executeUnixProcess({
      ...baseSpec,
      executable: '/bin/sh',
      argv: ['/bin/sh', '-c', 'sleep 5'],
      resources: { timeout: 0.1 },
    });

    expect(result.exitCode).toBeNull();
    expect(result.signal).toBe('SIGTERM');
    expect(result.duration).toBeLessThan(2000);
  });
});
