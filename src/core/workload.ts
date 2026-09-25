import { z } from 'zod';
import { artifactReferenceSchema, type ArtifactReference } from './artifact';

const architectureSchema = z.enum(['x86_64', 'arm64', 'risc-v']);

export const workloadIdentitySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    version: z.string().min(1),
    provenance: z
      .object({
        source: z.string().min(1),
        signature: z.string().min(1).optional(),
        hash: z.string().regex(/^sha256:[0-9a-fA-F]{64}$/),
      })
      .strict(),
  })
  .strict();

export const workloadOperationSchema = z
  .object({
    entrypoint: z.string().min(1),
    arguments: z.array(z.string()).optional(),
    environment: z.record(z.string(), z.string()).optional(),
    workingDirectory: z.string().min(1).optional(),
  })
  .strict();

export const resourceRequirementSchema = z
  .object({
    cpu: z
      .object({
        cores: z.number().positive(),
        architecture: architectureSchema,
      })
      .strict()
      .optional(),
    memory: z
      .object({
        minimum: z.number().int().nonnegative(),
        recommended: z.number().int().nonnegative().optional(),
      })
      .strict()
      .optional(),
    storage: z
      .object({
        required: z.number().int().nonnegative(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const capabilityRequirementSchema = z
  .object({
    networking: z.boolean().optional(),
    fileSystem: z
      .object({
        readOnly: z.array(z.string().min(1)).optional(),
        readWrite: z.array(z.string().min(1)).optional(),
      })
      .strict()
      .optional(),
    devices: z.array(z.string().min(1)).optional(),
    syscallGroups: z.array(z.string().min(1)).optional(),
  })
  .strict();

export const platformConstraintSchema = z
  .object({
    os: z.enum(['linux', 'windows', 'android', 'macos']),
    minVersion: z.string().min(1).optional(),
    architectures: z.array(architectureSchema).optional(),
  })
  .strict();

export const dependencySchema = z
  .object({
    name: z.string().min(1),
    version: z.string().min(1),
    type: z.enum(['library', 'runtime', 'service']),
    resolution: z.string().min(1),
  })
  .strict();

export const authorizationRequirementSchema = z
  .object({
    requiresPolicy: z.string().min(1).optional(),
    deniedScopes: z.array(z.string().min(1)).optional(),
  })
  .strict();

export const workloadRepresentationSchema = z
  .object({
    identity: workloadIdentitySchema,
    operation: workloadOperationSchema,
    resources: resourceRequirementSchema,
    capabilities: capabilityRequirementSchema,
    constraints: z.array(platformConstraintSchema),
    dependencies: z.array(dependencySchema),
    authorizationRequirements: authorizationRequirementSchema.optional(),
  })
  .strict();

export type WorkloadIdentity = z.infer<typeof workloadIdentitySchema>;
export type { ArtifactReference };
export type WorkloadOperation = z.infer<typeof workloadOperationSchema>;
export type ResourceRequirement = z.infer<typeof resourceRequirementSchema>;
export type CapabilityRequirement = z.infer<typeof capabilityRequirementSchema>;
export type PlatformConstraint = z.infer<typeof platformConstraintSchema>;
export type Dependency = z.infer<typeof dependencySchema>;
export type AuthorizationRequirement = z.infer<typeof authorizationRequirementSchema>;
export type WorkloadRepresentation = z.infer<typeof workloadRepresentationSchema>;
