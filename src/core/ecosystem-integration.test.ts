import { describe, expect, it } from 'vitest';
import {
  career107Integration,
  EcosystemIntegrationRegistry,
  ecosystemIntegrationSchema,
  projectAtlasIntegration,
} from './ecosystem-integration';

describe('ecosystem integration registry', () => {
  it('registers Project Atlas as plan-only and Career107 as read-only', () => {
    const registry = new EcosystemIntegrationRegistry();
    const atlas = registry.resolve('107.project-atlas');
    const career107 = registry.resolve('107.career-assessment');

    expect(atlas?.sourceRevision).toMatch(/^[a-f0-9]{40}$/);
    expect(career107?.sourceRevision).toMatch(/^[a-f0-9]{40}$/);
    expect(atlas?.integration.capabilities[0]).toMatchObject({
      id: 'workstation.plan.preview',
      mode: 'plan-only',
      executable: false,
    });
    expect(career107?.integration.capabilities).toEqual(
      career107Integration.integration.capabilities,
    );
    expect(career107?.integration.capabilities.every(
      (capability) => capability.mode === 'read-only' && !capability.executable,
    )).toBe(true);
  });

  it('rejects malformed descriptors', () => {
    const invalid = {
      ...projectAtlasIntegration,
      integration: {
        ...projectAtlasIntegration.integration,
        capabilities: [{
          ...projectAtlasIntegration.integration.capabilities[0],
          executable: 'yes',
        }],
      },
    };

    expect(() => ecosystemIntegrationSchema.parse(invalid)).toThrow();
  });

  it('replaces descriptors by stable integration id without duplicating entries', () => {
    const registry = new EcosystemIntegrationRegistry();
    registry.register({ ...projectAtlasIntegration, version: '0.1.0' });

    expect(registry.list()).toHaveLength(2);
    expect(registry.resolve('107.project-atlas')?.version).toBe('0.1.0');
  });
});
