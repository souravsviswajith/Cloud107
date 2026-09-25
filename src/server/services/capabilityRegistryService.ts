import { Capability, NodeCapabilityRegistration } from '../types/capability';

/**
 * In-memory registry for dynamic node capabilities.
 * Providers advertise capabilities without substrate-specific changes
 * to the core orchestrator.
 */
class CapabilityRegistryService {
  private readonly registry = new Map<string, NodeCapabilityRegistration>();

  registerNodeCapabilities(registration: NodeCapabilityRegistration): void {
    this.registry.set(registration.nodeId, {
      ...registration,
      registeredAt: new Date().toISOString(),
    });
  }

  getNodeCapabilities(nodeId: string): Capability[] {
    return this.registry.get(nodeId)?.capabilities ?? [];
  }

  findNodesSupportingCapability(capabilityUrn: string): string[] {
    const matchingNodes: string[] = [];
    for (const [nodeId, registration] of this.registry.entries()) {
      if (registration.capabilities.some((capability) => capability.urn === capabilityUrn)) {
        matchingNodes.push(nodeId);
      }
    }
    return matchingNodes;
  }

  clear(): void {
    this.registry.clear();
  }
}

export const capabilityRegistry = new CapabilityRegistryService();