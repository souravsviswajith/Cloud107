export type CapabilityType = 'action' | 'readonly' | 'stream';

export interface CapabilityConstraints {
  maxFrequencyHz?: number;
  requiresPrivilege?: boolean;
  maxPayloadBytes?: number;
  [key: string]: unknown;
}

export interface CapabilitySchema {
  type: string;
  properties?: Record<string, {
    type: string;
    minimum?: number;
    maximum?: number;
    enum?: string[];
    description?: string;
    [key: string]: unknown;
  }>;
  required?: string[];
  [key: string]: unknown;
}

export interface Capability {
  /** Canonical capability identity, e.g. pkg:cloud107/capability/sensor.gpio.read@1.0.0 */
  urn: string;
  description: string;
  type: CapabilityType;
  schema: CapabilitySchema;
  constraints?: CapabilityConstraints;
}

export interface NodeCapabilityRegistration {
  nodeId: string;
  providerId: string;
  capabilities: Capability[];
  registeredAt: string;
}