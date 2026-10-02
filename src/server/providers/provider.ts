import { CloudNode } from '../types/node';
import { Capability } from '../types/capability';
import { Workload } from '../types/workload';

export interface NodeProvider {
  readonly id: string;
  supports(node: CloudNode): boolean;
  discoverCapabilities(node: CloudNode): Promise<Capability[]>;
  executeCapability(node: CloudNode, capability: Capability, input: unknown): Promise<unknown>;
  stageArtifact(node: CloudNode, workloadId: string, urn: string, sourceFilePath: string): Promise<string>;
  startWorkload(node: CloudNode, workloadId: string): Promise<void>;
  inspectWorkload(node: CloudNode, workloadId: string): Promise<Workload>;
  getWorkloadLogs(node: CloudNode, workloadId: string, lines?: number): Promise<string[]>;
}