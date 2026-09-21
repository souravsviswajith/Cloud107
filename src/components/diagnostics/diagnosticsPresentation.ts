/**
 * Pure presentation mappings for the Diagnostics view.
 *
 * Interprets backend-reported health evidence. Strict by design: any signal
 * the backend did not actually report resolves to Unknown, never Healthy.
 */
import type { ControlPlaneHealthSnapshot } from '../../lib/diagnosticsApi';
import type { ProviderHealthCheck } from '../../types';

export type DiagState = 'healthy' | 'degraded' | 'offline' | 'unknown';

export interface SubsystemReport {
  name: string;
  state: DiagState;
  explanation: string;
}

export const DIAG_STATE_LABEL: Record<DiagState, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  offline: 'Offline',
  unknown: 'Unknown',
};

export const DIAG_STATE_TONE: Record<DiagState, 'emerald' | 'amber' | 'rose' | 'zinc'> = {
  healthy: 'emerald',
  degraded: 'amber',
  offline: 'rose',
  unknown: 'zinc',
};

/** Aggregate rule: Offline wins, then Degraded, then Unknown, else Healthy. */
export function aggregateDiagState(states: DiagState[]): DiagState {
  if (states.includes('offline')) return 'offline';
  if (states.includes('degraded')) return 'degraded';
  if (states.includes('unknown')) return 'unknown';
  return 'healthy';
}

export function controlPlaneReport(snapshot: ControlPlaneHealthSnapshot): SubsystemReport {
  if (snapshot.kind === 'unreachable') {
    return { name: 'Control Plane API', state: 'offline', explanation: snapshot.message };
  }
  if (snapshot.kind === 'http-error') {
    return {
      name: 'Control Plane API',
      state: 'offline',
      explanation: `Control plane responded with HTTP ${snapshot.statusCode}: ${snapshot.message}`,
    };
  }
  // snapshot.kind === 'ok': the API demonstrably answered a request.
  return {
    name: 'Control Plane API',
    state: 'healthy',
    explanation: 'Control plane answered the health request.',
  };
}

export function persistenceReport(snapshot: ControlPlaneHealthSnapshot): SubsystemReport {
  if (snapshot.kind !== 'ok') {
    return {
      name: 'Persistence',
      state: 'unknown',
      explanation: 'Control plane did not report persistence state.',
    };
  }
  if (snapshot.database === 'connected') {
    return { name: 'Persistence', state: 'healthy', explanation: "Database reports 'connected'." };
  }
  if (typeof snapshot.database === 'string') {
    return {
      name: 'Persistence',
      state: 'unknown',
      explanation: `Database reports an unrecognized value: '${snapshot.database}'.`,
    };
  }
  return {
    name: 'Persistence',
    state: 'unknown',
    explanation: 'Control plane did not report persistence state.',
  };
}

export function providerReport(
  health: ProviderHealthCheck | null,
  failed: boolean,
  failureMessage: string | null,
): SubsystemReport {
  if (health) {
    if (health.isHealthy) {
      return {
        name: 'Provider Runtime',
        state: 'healthy',
        explanation: health.statusMessage || 'Provider reports healthy.',
      };
    }
    const failing = Object.entries(health.subsystemChecks)
      .filter(([, ok]) => !ok)
      .map(([name]) => name);
    const base = (health.statusMessage || 'Provider reports unhealthy.').replace(/\.+$/, '');
    return {
      name: 'Provider Runtime',
      state: 'degraded',
      explanation:
        failing.length > 0 ? `${base}. Failing: ${failing.join(', ')}.` : `${base}.`,
    };
  }
  return {
    name: 'Provider Runtime',
    state: 'unknown',
    explanation:
      failed && failureMessage
        ? `Provider health could not be determined: ${failureMessage}`
        : 'Provider health was not reported.',
  };
}

/**
 * Mesh connectivity. There is no mesh/fabric/signalling health endpoint in the
 * backend, so this row is always Unknown. It must never be inferred.
 */
export function meshReport(): SubsystemReport {
  return {
    name: 'Mesh Connectivity',
    state: 'unknown',
    explanation: 'No mesh health information reported.',
  };
}

/**
 * True only when the API demonstrably responded but no row carries any
 * backend-reported signal (malformed/empty body + no provider data).
 */
export function hasAnySignal(
  snapshot: ControlPlaneHealthSnapshot | null,
  providerHealth: ProviderHealthCheck | null,
): boolean {
  if (snapshot === null) return false;
  if (snapshot.kind === 'unreachable' || snapshot.kind === 'http-error') return true;
  if (typeof snapshot.status === 'string' || typeof snapshot.database === 'string') return true;
  return providerHealth !== null;
}
