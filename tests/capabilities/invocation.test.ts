import {
  CapabilityInvoker,
  type CapabilityRequest,
} from '../../src/core/capability-invocation';
import { InMemoryCapabilityRegistry } from '../../src/core/capability-registry';

const registry = new InMemoryCapabilityRegistry([
  {
    capability: 'Display/GameRuntime',
    artifactId: 'game-dwy',
    version: '1.0.0',
    hash: 'sha256:' + 'a'.repeat(64),
    entrypoint: '/opt/game-dwy/bin/game',
    constraints: [{ os: 'linux', architectures: ['x86_64'] }],
    metadata: {
      internalProject: 'Game/DWY',
      description: 'Interactive game runtime',
    },
    minimumMemory: 2_000_000_000,
    recommendedMemory: 4_000_000_000,
    recommendedCpuCores: 4,
  },
]);

describe('Capability Invocation', () => {
  const invoker = new CapabilityInvoker(registry);

  it('translates a capability request to S1', () => {
    const request: CapabilityRequest = {
      capability: 'Display/GameRuntime',
      arguments: {
        maxPlayers: 8,
        mode: 'lan',
      },
    };

    const s1 = invoker.invoke(request);

    expect(s1.identity.name).toBe('Display/GameRuntime');
    expect(s1.operation.entrypoint).toBe('/opt/game-dwy/bin/game');
    expect(s1.operation.arguments).toEqual([
      '--max-players',
      '8',
      '--mode',
      'lan',
    ]);
    expect(s1.artifact?.id).toBe('game-dwy');
    expect(s1.resources.memory?.minimum).toBe(2_000_000_000);
    expect(s1.resources.memory?.recommended).toBe(4_000_000_000);
    expect(s1.resources.cpu?.cores).toBe(4);
  });

  it('rejects an unknown capability', () => {
    expect(() =>
      invoker.invoke({ capability: 'Display/UnknownCapability' }),
    ).toThrow('Capability not found: Display/UnknownCapability');
  });

  it('applies resource overrides', () => {
    const s1 = invoker.invoke({
      capability: 'Display/GameRuntime',
      resourceOverrides: {
        memory: 8_000_000_000,
        cpuCores: 8,
      },
    });

    expect(s1.resources.memory?.minimum).toBe(2_000_000_000);
    expect(s1.resources.memory?.recommended).toBe(8_000_000_000);
    expect(s1.resources.cpu?.cores).toBe(8);
  });

  it('merges environment overrides', () => {
    const localRegistry = new InMemoryCapabilityRegistry([
      {
        ...registry.resolve('Display/GameRuntime')!,
        defaultEnvironment: {
          DISPLAY_MODE: 'windowed',
          GAME_LOG_LEVEL: 'info',
        },
      },
    ]);

    const s1 = new CapabilityInvoker(localRegistry).invoke({
      capability: 'Display/GameRuntime',
      environment: {
        GAME_LOG_LEVEL: 'debug',
      },
    });

    expect(s1.operation.environment).toEqual({
      DISPLAY_MODE: 'windowed',
      GAME_LOG_LEVEL: 'debug',
    });
  });

  it('rejects non-scalar capability arguments', () => {
    expect(() =>
      invoker.invoke({
        capability: 'Display/GameRuntime',
        arguments: {
          options: { fullscreen: true },
        },
      }),
    ).toThrow(/Unsupported capability argument type/);
  });
});
