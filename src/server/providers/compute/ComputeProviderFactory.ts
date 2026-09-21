import { ComputeProvider } from './ComputeProvider';
import { LocalUnixProvider } from './LocalUnixProvider';

/**
 * Factory for compute providers. The provider instance is a process-wide
 * singleton so rate-derived telemetry (per-second IO samples) stays coherent
 * across requests within the same host process.
 */
export class ComputeProviderFactory {
  private static instance: ComputeProvider | null = null;

  static getProvider(): ComputeProvider {
    if (ComputeProviderFactory.instance) {
      return ComputeProviderFactory.instance;
    }
    const providerType = (process.env.COMPUTE_PROVIDER || 'local-unix').toLowerCase();
    switch (providerType) {
      case 'local-unix':
      case 'local':
      default:
        ComputeProviderFactory.instance = new LocalUnixProvider();
        return ComputeProviderFactory.instance;
    }
  }

  /** Test hook: drop the cached singleton. */
  static resetForTests(): void {
    ComputeProviderFactory.instance = null;
  }

  /** Test hook: pin a specific provider instance. */
  static setProviderForTests(provider: ComputeProvider): void {
    ComputeProviderFactory.instance = provider;
  }
}
