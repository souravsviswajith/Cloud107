import {
  InMemoryCapabilityRegistry,
  type CapabilityImplementation,
} from './capability-registry';

const gameRuntime: CapabilityImplementation = {
  capability: 'Display/GameRuntime',
  artifactId: 'game-dwy',
  version: '1.0.0',
  hash: 'sha256:' + 'a'.repeat(64),
  entrypoint: '/opt/game-dwy/bin/game',
  constraints: [
    { os: 'linux', architectures: ['x86_64'] },
    { os: 'android', architectures: ['arm64'] },
  ],
  metadata: {
    internalProject: 'Game/DWY',
    description: 'Interactive game runtime',
  },
};

const animation: CapabilityImplementation = {
  capability: 'Display/Animation',
  artifactId: 'animation-engine',
  version: '1.0.0',
  hash: 'sha256:' + 'b'.repeat(64),
  entrypoint: '/opt/animation-engine/bin/render',
  constraints: [{ os: 'linux', architectures: ['x86_64'] }],
  metadata: {
    internalProject: 'Animation Engine',
    description: 'Rendering and animation processing',
  },
};

describe('InMemoryCapabilityRegistry', () => {
  it('resolves a registered product capability to its implementation', () => {
    const registry = new InMemoryCapabilityRegistry([gameRuntime]);

    expect(registry.resolve('Display/GameRuntime')).toEqual(gameRuntime);
  });

  it('returns null for an unregistered capability', () => {
    const registry = new InMemoryCapabilityRegistry();

    expect(registry.resolve('Media/Playback')).toBeNull();
  });

  it('lists registered implementations in registration order', () => {
    const registry = new InMemoryCapabilityRegistry([gameRuntime, animation]);

    expect(registry.list()).toEqual([gameRuntime, animation]);
  });

  it('replaces an implementation for the same capability identity', () => {
    const registry = new InMemoryCapabilityRegistry([gameRuntime]);
    const replacement = {
      ...gameRuntime,
      version: '1.1.0',
    };

    registry.register(replacement);

    expect(registry.resolve('Display/GameRuntime')).toEqual(replacement);
    expect(registry.list()).toEqual([replacement]);
  });
});
