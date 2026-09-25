import type { WorkloadRepresentation } from './workload';
import type { NodeCapability, NodeRegistry } from './node-registry';

export interface ScheduleCandidate {
  node: NodeCapability;
  compatible: boolean;
  reason?: string;
}

export interface ScheduleResult {
  selected: NodeCapability | null;
  reasons: {
    compatible: boolean;
    resourceSufficient: boolean;
    capabilitySufficient: boolean;
  };
  candidates: ScheduleCandidate[];
}

export class Scheduler {
  constructor(private readonly registry: NodeRegistry) {}

  schedule(workload: WorkloadRepresentation): ScheduleResult {
    const candidates = this.registry.list().map((node) => ({
      node,
      ...this.checkCompatibility(workload, node),
    }));

    const selected = candidates.find((candidate) => candidate.compatible)?.node ?? null;

    return {
      selected,
      reasons: {
        compatible: selected !== null,
        resourceSufficient: selected
          ? this.checkResources(workload, selected)
          : false,
        capabilitySufficient: selected
          ? this.checkCapabilities(workload, selected)
          : false,
      },
      candidates,
    };
  }

  private checkCompatibility(
    workload: WorkloadRepresentation,
    node: NodeCapability,
  ): { compatible: boolean; reason?: string } {
    if (node.status !== 'online') {
      return {
        compatible: false,
        reason: `Node is ${node.status}`,
      };
    }

    const platformOk = workload.constraints.some(
      (constraint) =>
        constraint.os === node.os &&
        (!constraint.architectures ||
          constraint.architectures.includes(
            node.architecture as 'x86_64' | 'arm64' | 'risc-v',
          )),
    );

    if (!platformOk) {
      return {
        compatible: false,
        reason: `No compatible platform: workload requires ${workload.constraints
          .map(
            (constraint) =>
              `${constraint.os}/${constraint.architectures?.join(',') ?? '*'}`,
          )
          .join(' or ')}, node is ${node.os}/${node.architecture}`,
      };
    }

    if (!this.checkResources(workload, node)) {
      return {
        compatible: false,
        reason: 'Insufficient resources',
      };
    }

    if (!this.checkCapabilities(workload, node)) {
      return {
        compatible: false,
        reason: 'Missing required capabilities',
      };
    }

    return { compatible: true };
  }

  private checkResources(
    workload: WorkloadRepresentation,
    node: NodeCapability,
  ): boolean {
    const required = workload.resources;

    if (
      required.memory?.minimum !== undefined &&
      node.resources.memoryAvailable < required.memory.minimum
    ) {
      return false;
    }

    if (
      required.cpu?.cores !== undefined &&
      node.resources.cpuCores < required.cpu.cores
    ) {
      return false;
    }

    if (
      required.storage?.required !== undefined &&
      node.resources.storageAvailable < required.storage.required
    ) {
      return false;
    }

    return true;
  }

  private checkCapabilities(
    workload: WorkloadRepresentation,
    node: NodeCapability,
  ): boolean {
    const required = workload.capabilities;

    if (required.syscallGroups?.length) {
      const available = new Set(node.capabilities.syscalls);
      if (!required.syscallGroups.every((group) => available.has(group))) {
        return false;
      }
    }

    if (required.networking && !node.capabilities.networking) {
      return false;
    }

    if (required.devices?.length) {
      const available = new Set(node.capabilities.devices);
      if (!required.devices.every((device) => available.has(device))) {
        return false;
      }
    }

    if (required.fileSystem?.readOnly?.length) {
      const available = new Set(node.capabilities.fileSystemAccess);
      if (
        !required.fileSystem.readOnly.every((path) => available.has(path))
      ) {
        return false;
      }
    }

    if (required.fileSystem?.readWrite?.length) {
      const available = new Set(node.capabilities.fileSystemAccess);
      if (
        !required.fileSystem.readWrite.every((path) => available.has(path))
      ) {
        return false;
      }
    }

    return true;
  }
}
