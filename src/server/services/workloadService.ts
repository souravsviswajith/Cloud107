import { NodeService } from './nodeService';
import { ProviderResolver } from '../providers/providerResolver';
import { Workload } from '../types/workload';
import { v4 as uuidv4 } from 'uuid';

export class WorkloadService {
  constructor(
    private nodeService: NodeService,
    private providerResolver: ProviderResolver
  ) {}

  async deployWorkload(nodeId: string, urn: string, sourceFilePath: string): Promise<Workload> {
    const node = await this.nodeService.getNode(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    const provider = this.providerResolver.resolve(node);
    const workloadId = `wk_${uuidv4().replace(/-/g, '')}`;
    await provider.stageArtifact(node, workloadId, urn, sourceFilePath);
    await provider.startWorkload(node, workloadId);
    return provider.inspectWorkload(node, workloadId);
  }

  async inspectWorkload(nodeId: string, workloadId: string): Promise<Workload> {
    const node = await this.nodeService.getNode(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    const provider = this.providerResolver.resolve(node);
    return provider.inspectWorkload(node, workloadId);
  }

  async getWorkloadLogs(nodeId: string, workloadId: string, lines: number = 100): Promise<string[]> {
    const node = await this.nodeService.getNode(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    const provider = this.providerResolver.resolve(node);
    return provider.getWorkloadLogs(node, workloadId, lines);
  }
}