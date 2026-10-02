import type { ExecutionPlan } from './execution-plan';
import type { NodeCapabilities } from './node-capabilities';
import type { WorkloadRepresentation } from './workload';

export async function planWorkload(
  workload: WorkloadRepresentation,
  node: NodeCapabilities,
  endpoint = 'http://localhost:5107',
): Promise<ExecutionPlan> {
  const response = await fetch(`${endpoint}/plan`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ workload, node }),
  });

  if (!response.ok) {
    throw new Error(`T₂ planning request failed: ${response.status}`);
  }

  return (await response.json()) as ExecutionPlan;
}
