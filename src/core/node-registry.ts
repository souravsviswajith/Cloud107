export interface NodeCapability {
  id: string;
  os: string;
  architecture: string;
  resources: {
    memoryAvailable: number;
    cpuCores: number;
    storageAvailable: number;
  };
  capabilities: {
    syscalls: string[];
    networking: boolean;
    fileSystemAccess: string[];
    devices: string[];
  };
  status: 'online' | 'offline' | 'degraded';
}

export interface NodeRegistry {
  list(): NodeCapability[];
  get(nodeId: string): NodeCapability | null;
  filter(predicate: (node: NodeCapability) => boolean): NodeCapability[];
}

export class InMemoryNodeRegistry implements NodeRegistry {
  constructor(private readonly nodes: NodeCapability[] = []) {}

  list(): NodeCapability[] {
    return [...this.nodes];
  }

  get(nodeId: string): NodeCapability | null {
    return this.nodes.find((node) => node.id === nodeId) ?? null;
  }

  filter(predicate: (node: NodeCapability) => boolean): NodeCapability[] {
    return this.nodes.filter(predicate);
  }
}
