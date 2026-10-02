import type { ExecutionPlan } from '../../core/execution-plan';
import type { UnixProcessSpec } from './process-spec';

export function lowerToUnixProcess(plan: ExecutionPlan): UnixProcessSpec {
  if (!plan.executable || !plan.execution) {
    throw new Error(
      `Cannot lower non-executable plan: ${plan.reasonNotExecutable ?? 'no execution specification'}`,
    );
  }

  const execution = plan.execution;

  return {
    executable: execution.executablePath,
    argv: [execution.executablePath, ...execution.arguments],
    environ: {
      ...process.env,
      ...execution.environment,
    } as Record<string, string>,
    cwd: execution.workingDirectory || process.cwd(),
    stdio: {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
    },
    resources: {
      memoryLimit: execution.constraints.memoryLimit,
      cpuCores: execution.constraints.cpuCores,
      timeout: execution.constraints.timeoutSeconds,
    },
    hints: {
      closeOnExec: true,
    },
  };
}
