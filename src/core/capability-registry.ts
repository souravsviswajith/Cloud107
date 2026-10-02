import type { PlatformConstraint } from './workload';

export interface CapabilityImplementation {
  capability: string;
  artifactId: string;
  version: string;
  hash: string;
  entrypoint: string;
  constraints: PlatformConstraint[];
  metadata: {
    internalProject: string;
    description: string;
  };
  defaultEnvironment?: Record<string, string>;
  minimumMemory?: number;
  recommendedMemory?: number;
  recommendedCpuCores?: number;
  requiredCapabilities?: {
    networking?: boolean;
    fileSystem?: {
      readOnly?: string[];
      readWrite?: string[];
    };
    devices?: string[];
    syscallGroups?: string[];
  };
  dependencies?: {
    name: string;
    version: string;
    type: 'library' | 'runtime' | 'service';
    resolution: string;
  }[];
}

export interface CapabilityRegistry {
  resolve(capability: string): CapabilityImplementation | null;
  list(): CapabilityImplementation[];
  register(implementation: CapabilityImplementation): void;
}

export class InMemoryCapabilityRegistry implements CapabilityRegistry {
  private readonly implementations = new Map<string, CapabilityImplementation>();

  constructor(implementations: CapabilityImplementation[] = []) {
    for (const implementation of implementations) {
      this.register(implementation);
    }
  }

  resolve(capability: string): CapabilityImplementation | null {
    return this.implementations.get(capability) ?? null;
  }

  list(): CapabilityImplementation[] {
    return [...this.implementations.values()];
  }

  register(implementation: CapabilityImplementation): void {
    this.implementations.set(implementation.capability, implementation);
  }
}
