export interface NodeCapabilities {
  nodeId: string;
  os: string;
  architecture: string;
  availableMemory: number;
  availableCores: number;
  capabilities: {
    networking: boolean;
    fileSystemRoots: Record<string, 'rw' | 'ro'>;
    devices: string[];
    syscallGroups: string[];
  };
  availableDependencies: {
    name: string;
    version: string;
    resolvedTo: string;
  }[];
  authorizationPolicies: string[];
}
