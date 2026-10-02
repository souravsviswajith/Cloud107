import type { NodeCapabilities } from './node-capabilities';
import type { NodeCapability } from './node-registry';

export function toPlannerNode(node: NodeCapability): NodeCapabilities {
  return {
    nodeId: node.id,
    os: node.os,
    architecture: node.architecture,
    availableMemory: node.resources.memoryAvailable,
    availableCores: node.resources.cpuCores,
    capabilities: {
      networking: node.capabilities.networking,
      fileSystemRoots: Object.fromEntries(
        node.capabilities.fileSystemAccess.map((path) => [path, 'rw' as const]),
      ),
      devices: [...node.capabilities.devices],
      syscallGroups: [...node.capabilities.syscalls],
    },
    availableDependencies: [],
    authorizationPolicies: [],
  };
}
