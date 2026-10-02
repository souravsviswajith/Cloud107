import { describe, expect, it, vi } from 'vitest';
import type { WorkloadRepresentation } from '../../src/core/workload';
import { WorkloadStateRepository } from '../../src/server/repositories/workloadStateRepository';

const workload: WorkloadRepresentation = {
  identity: {
    id: 'hello-linux',
    name: 'hello-linux',
    version: '1.0.0',
    provenance: {
      source: 'test',
      hash: `sha256:${'a'.repeat(64)}`,
    },
  },
  operation: {
    entrypoint: '/bin/echo',
    arguments: ['hello'],
  },
  resources: {
    cpu: { cores: 1, architecture: 'x86_64' },
    memory: { minimum: 1024 },
  },
  capabilities: {},
  constraints: [{ os: 'linux', architectures: ['x86_64'] }],
  dependencies: [],
};

describe('workload persistence contract', () => {
  it('maps the S1 representation to durable storage by workload identity', async () => {
    const create = vi
      .spyOn(WorkloadStateRepository.prototype, 'create')
      .mockResolvedValue(workload);

    const repository = new WorkloadStateRepository();
    await expect(repository.create(workload)).resolves.toEqual(workload);
    expect(create).toHaveBeenCalledWith(workload);
  });
});
