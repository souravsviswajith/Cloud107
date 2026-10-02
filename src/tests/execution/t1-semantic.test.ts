import { describe, expect, it } from 'vitest';
import { parseWorkload, validateWorkload } from '../../core/validation';

const helloLinux = {
  identity: {
    id: 'hello-linux-1.0.0',
    name: 'hello-linux',
    version: '1.0.0',
    provenance: {
      source: 'test-suite',
      hash: 'sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    },
  },
  operation: {
    entrypoint: '/bin/echo',
    arguments: ['Hello from Cloud107'],
  },
  resources: {
    memory: {
      minimum: 1_000_000,
    },
  },
  capabilities: {},
  constraints: [
    {
      os: 'linux',
      architectures: ['x86_64'],
    },
  ],
  dependencies: [],
};

describe('T₁ semantic validation', () => {
  it('captures the hello-linux descriptor as a 107 workload representation', () => {
    const workload = parseWorkload(helloLinux);

    expect(workload.identity.name).toBe('hello-linux');
    expect(workload.operation.entrypoint).toBe('/bin/echo');
    expect(workload.operation.arguments).toEqual(['Hello from Cloud107']);
    expect(workload.constraints[0]).toEqual({
      os: 'linux',
      architectures: ['x86_64'],
    });
  });

  it('rejects an invalid workload descriptor', () => {
    const result = validateWorkload({
      ...helloLinux,
      operation: {
        ...helloLinux.operation,
        entrypoint: '',
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects platform architectures outside the S₁ contract', () => {
    const result = validateWorkload({
      ...helloLinux,
      constraints: [
        {
          os: 'linux',
          architectures: ['wasm32'],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects malformed SHA-256 provenance', () => {
    const result = validateWorkload({
      ...helloLinux,
      identity: {
        ...helloLinux.identity,
        provenance: {
          ...helloLinux.identity.provenance,
          hash: 'not-a-sha256-hash',
        },
      },
    });

    expect(result.success).toBe(false);
  });
});
