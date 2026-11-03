import { z } from 'zod';

const integrationCapabilitySchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9.-]+$/),
  contractVersion: z.number().int().positive(),
  mode: z.enum(['plan-only', 'read-only', 'invoke']),
  description: z.string().min(1),
  input: z.string().min(1),
  output: z.string().min(1),
  executable: z.boolean(),
}).strict().refine(
  (capability) => capability.executable === (capability.mode === 'invoke'),
  { message: 'Only invoke capabilities may be executable' },
);

export const ecosystemIntegrationSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z][a-z0-9.-]+$/),
  name: z.string().min(1),
  repository: z.string().url(),
  license: z.string().min(1),
  version: z.string().min(1),
  sourceRevision: z.string().regex(/^[a-f0-9]{40}$/),
  integration: z.object({
    contractVersion: z.number().int().positive(),
    capabilities: z.array(integrationCapabilitySchema).min(1),
  }).strict(),
}).strict();

export type EcosystemIntegration = z.infer<typeof ecosystemIntegrationSchema>;

/**
 * Project Atlas produces workstation plans. Registration is plan-only and
 * does not grant HyperCloud permission to install software or execute commands.
 */
export const projectAtlasIntegration: EcosystemIntegration = ecosystemIntegrationSchema.parse({
  schemaVersion: 1,
  id: '107.project-atlas',
  name: 'Project Atlas Bootstrap',
  repository: 'https://github.com/souravsviswajith/Project-Atlas-Bootstrap',
  license: 'Apache-2.0',
  version: 'unreleased',
  sourceRevision: 'd11f9f2d8893c0dc795a85d539fae760a34e9428',
  integration: {
    contractVersion: 1,
    capabilities: [
      {
        id: 'workstation.plan.preview',
        contractVersion: 1,
        mode: 'plan-only',
        description: 'Validate Atlas workstation intent and produce a deterministic preview plan.',
        input: 'Project Atlas config schema v1',
        output: 'Project Atlas plan schema v1',
        executable: false,
      },
    ],
  },
});

/**
 * Career107 is a separate Go runtime with a loopback HTTP API. HyperCloud may
 * inspect health and public catalog metadata only; assessment sessions and
 * personal answers are never proxied through this adapter.
 */
export const career107Integration: EcosystemIntegration = ecosystemIntegrationSchema.parse({
  schemaVersion: 1,
  id: '107.career-assessment',
  name: 'Career Assessment 107',
  repository: 'https://github.com/souravsviswajith/psychometric-assessment-107',
  license: 'GPL-3.0-or-later',
  version: 'unreleased',
  sourceRevision: 'f85077771e5b7b27c5d6da10f12b2568aee1416d',
  integration: {
    contractVersion: 1,
    capabilities: [
      {
        id: 'career107.health.read',
        contractVersion: 1,
        mode: 'read-only',
        description: 'Read the local Career107 runtime health status.',
        input: 'No input',
        output: 'Career107 health response',
        executable: false,
      },
      {
        id: 'career107.catalog.read',
        contractVersion: 1,
        mode: 'read-only',
        description: 'Read the public instrument and capability catalog; no session data is included.',
        input: 'No input',
        output: 'Career107 public catalog',
        executable: false,
      },
    ],
  },
});

export class EcosystemIntegrationRegistry {
  private readonly integrations = new Map<string, EcosystemIntegration>();

  constructor(initial: EcosystemIntegration[] = [projectAtlasIntegration, career107Integration]) {
    for (const integration of initial) this.register(integration);
  }

  register(candidate: unknown): EcosystemIntegration {
    const integration = ecosystemIntegrationSchema.parse(candidate);
    this.integrations.set(integration.id, integration);
    return integration;
  }

  list(): EcosystemIntegration[] {
    return [...this.integrations.values()];
  }

  resolve(id: string): EcosystemIntegration | null {
    return this.integrations.get(id) ?? null;
  }
}
