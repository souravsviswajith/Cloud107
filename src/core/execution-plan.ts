import type { ArtifactReference } from './artifact';

export interface ExecutionPlan {
  workloadId: string;
  nodeId: string;
  artifact?: {
    reference: ArtifactReference;
    available: boolean;
    distributed: boolean;
    path: string;
  };

  resolved: {
    dependencies: {
      name: string;
      version: string;
      resolvedTo: string;
      available: boolean;
    }[];
    capabilities: {
      required: string[];
      available: string[];
      satisfied: boolean;
    };
    resources: {
      memoryAvailable: number;
      memoryRequired: number;
      coresAvailable: number;
      coresRequired: number;
      satisfied: boolean;
    };
  };

  authorization: {
    requiredPolicies?: string[];
    authorized: boolean;
    reason?: string;
  };

  executable: boolean;
  reasonNotExecutable?: string;

  execution?: {
    executablePath: string;
    arguments: string[];
    environment: Record<string, string>;
    workingDirectory: string;
    constraints: {
      memoryLimit: number;
      cpuCores: number;
      timeoutSeconds?: number;
    };
  };

  planId: string;
  createdAt: number;
  validUntil?: number;
  signature?: string;
}
