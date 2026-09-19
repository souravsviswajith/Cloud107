import { describe, it, expect, afterEach } from 'vitest';
import { ProviderFactory } from '../ProviderFactory';
import { MockWorkspaceProvider } from '../MockWorkspaceProvider';
import { HyperVWorkspaceProvider } from '../HyperVWorkspaceProvider';

describe('ProviderFactory', () => {
  const originalEnv = process.env.WORKSPACE_PROVIDER;

  afterEach(() => {
    process.env.WORKSPACE_PROVIDER = originalEnv;
  });

  it('should return MockWorkspaceProvider by default', () => {
    delete process.env.WORKSPACE_PROVIDER;
    const provider = ProviderFactory.getProvider();
    expect(provider).toBeInstanceOf(MockWorkspaceProvider);
  });

  it('should return MockWorkspaceProvider when WORKSPACE_PROVIDER is mock', () => {
    process.env.WORKSPACE_PROVIDER = 'mock';
    const provider = ProviderFactory.getProvider();
    expect(provider).toBeInstanceOf(MockWorkspaceProvider);
  });

  it('should return HyperVWorkspaceProvider when WORKSPACE_PROVIDER is hyperv', () => {
    process.env.WORKSPACE_PROVIDER = 'hyperv';
    const provider = ProviderFactory.getProvider();
    expect(provider).toBeInstanceOf(HyperVWorkspaceProvider);
  });
});
