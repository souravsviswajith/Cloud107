import { randomUUID } from 'node:crypto';
import type {
  CapabilityImplementation,
  CapabilityRegistry,
} from './capability-registry';
import type { WorkloadRepresentation } from './workload';

export interface CapabilityRequest {
  capability: string;
  arguments?: Record<string, unknown>;
  environment?: Record<string, string>;
  resourceOverrides?: {
    memory?: number;
    cpuCores?: number;
  };
}

export interface WorkloadFactory {
  create(
    implementation: CapabilityImplementation,
    request: CapabilityRequest,
    arguments_: string[],
  ): WorkloadRepresentation;
}

export class DefaultWorkloadFactory implements WorkloadFactory {
  create(
    implementation: CapabilityImplementation,
    request: CapabilityRequest,
    arguments_: string[],
  ): WorkloadRepresentation {
    const memory = request.resourceOverrides?.memory;
    const cpuCores = request.resourceOverrides?.cpuCores;

    const minimumMemory = implementation.minimumMemory;
    const recommendedMemory =
      memory ?? implementation.recommendedMemory ?? minimumMemory;

    const resources: WorkloadRepresentation['resources'] = {
      ...(minimumMemory !== undefined || recommendedMemory !== undefined
        ? {
            memory: {
              ...(minimumMemory !== undefined ? { minimum: minimumMemory } : {}),
              ...(recommendedMemory !== undefined
                ? { recommended: recommendedMemory }
                : {}),
            },
          }
        : {}),
      ...(cpuCores !== undefined || implementation.recommendedCpuCores !== undefined
        ? {
            cpu: {
              cores: cpuCores ?? implementation.recommendedCpuCores!,
              architecture: this.resolveArchitecture(implementation),
            },
          }
        : {}),
    };

    return {
      identity: {
        id: `${implementation.artifactId}-${randomUUID()}`,
        name: request.capability,
        version: implementation.version,
        provenance: {
          source: 'capability-invocation',
          hash: implementation.hash,
        },
      },
      artifact: {
        id: implementation.artifactId,
        version: implementation.version,
        hash: implementation.hash,
        path: implementation.entrypoint,
      },
      operation: {
        entrypoint: implementation.entrypoint,
        arguments: arguments_,
        environment: {
          ...implementation.defaultEnvironment,
          ...request.environment,
        },
      },
      resources,
      capabilities: implementation.requiredCapabilities ?? {},
      constraints: implementation.constraints,
      dependencies: implementation.dependencies ?? [],
    };
  }

  private resolveArchitecture(
    implementation: CapabilityImplementation,
  ): 'x86_64' | 'arm64' | 'risc-v' {
    const architectures = implementation.constraints.flatMap(
      (constraint) => constraint.architectures ?? [],
    );

    if (architectures.length === 0) {
      throw new Error(
        `Capability implementation ${implementation.capability} does not declare an architecture required for CPU resources`,
      );
    }

    return architectures[0];
  }
}

export class CapabilityInvoker {
  constructor(
    private readonly registry: CapabilityRegistry,
    private readonly workloadFactory: WorkloadFactory = new DefaultWorkloadFactory(),
  ) {}

  invoke(request: CapabilityRequest): WorkloadRepresentation {
    const implementation = this.registry.resolve(request.capability);

    if (!implementation) {
      throw new Error(`Capability not found: ${request.capability}`);
    }

    const arguments_ = this.buildArguments(implementation, request.arguments);
    return this.workloadFactory.create(implementation, request, arguments_);
  }

  private buildArguments(
    implementation: CapabilityImplementation,
    requestArguments?: Record<string, unknown>,
  ): string[] {
    if (!requestArguments) {
      return [];
    }

    return Object.entries(requestArguments).flatMap(([key, value]) => {
      if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean'
      ) {
        throw new Error(
          `Unsupported capability argument type for ${implementation.capability}: ${key}`,
        );
      }

      return [`--${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`, String(value)];
    });
  }
}
