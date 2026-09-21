import { WorkspaceProvider } from './WorkspaceProvider';
import { MockWorkspaceProvider } from './MockWorkspaceProvider';
import { HyperVWorkspaceProvider } from './HyperVWorkspaceProvider';

export class ProviderFactory {
  static getProvider(): WorkspaceProvider {
    const providerType = process.env.WORKSPACE_PROVIDER || 'mock';

    switch (providerType.toLowerCase()) {
      case 'hyperv':
        return new HyperVWorkspaceProvider();
      case 'mock':
      default:
        return new MockWorkspaceProvider();
    }
  }
}
