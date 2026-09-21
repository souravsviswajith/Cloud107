import { describe, expect, it } from 'vitest';
import {
  aggregateDiagState,
  controlPlaneReport,
  hasAnySignal,
  meshReport,
  persistenceReport,
  providerReport,
} from '../diagnosticsPresentation';
import type { ControlPlaneHealthSnapshot } from '../../../lib/diagnosticsApi';
import type { ProviderHealthCheck } from '../../../types';

const okSnapshot: ControlPlaneHealthSnapshot = {
  kind: 'ok',
  status: 'ok',
  database: 'connected',
  requestMs: 12,
  correlationId: 'corr-1',
  raw: { success: true },
};

const healthyProvider: ProviderHealthCheck = {
  isHealthy: true,
  statusMessage: 'All systems operational',
  subsystemChecks: { runtime: true },
};

describe('aggregateDiagState', () => {
  it('offline wins over everything', () => {
    expect(aggregateDiagState(['healthy', 'degraded', 'offline', 'unknown'])).toBe('offline');
  });

  it('degraded wins over unknown and healthy', () => {
    expect(aggregateDiagState(['healthy', 'unknown', 'degraded'])).toBe('degraded');
  });

  it('unknown wins over healthy', () => {
    expect(aggregateDiagState(['healthy', 'healthy', 'unknown'])).toBe('unknown');
  });

  it('all healthy aggregates to healthy', () => {
    expect(aggregateDiagState(['healthy', 'healthy'])).toBe('healthy');
  });
});

describe('controlPlaneReport', () => {
  it('healthy when the API answered', () => {
    const report = controlPlaneReport(okSnapshot);
    expect(report.state).toBe('healthy');
  });

  it('offline with the HTTP status when the API answered with an error', () => {
    const report = controlPlaneReport({
      kind: 'http-error',
      statusCode: 503,
      message: 'Database connection failed',
      requestMs: 9,
      correlationId: null,
      raw: null,
    });
    expect(report.state).toBe('offline');
    expect(report.explanation).toContain('503');
  });

  it('offline when unreachable', () => {
    const report = controlPlaneReport({ kind: 'unreachable', message: 'no route' });
    expect(report.state).toBe('offline');
    expect(report.explanation).toBe('no route');
  });
});

describe('persistenceReport', () => {
  it("healthy only on the exact 'connected' value", () => {
    expect(persistenceReport(okSnapshot).state).toBe('healthy');
    expect(persistenceReport({ ...okSnapshot, database: 'connecting' }).state).toBe('unknown');
  });

  it('unknown when the API did not report persistence state', () => {
    expect(persistenceReport({ ...okSnapshot, database: undefined }).state).toBe('unknown');
    expect(persistenceReport({ kind: 'unreachable', message: 'x' }).state).toBe('unknown');
  });
});

describe('providerReport', () => {
  it('healthy when the provider reports healthy', () => {
    const report = providerReport(healthyProvider, false, null);
    expect(report.state).toBe('healthy');
    expect(report.explanation).toContain('All systems operational');
  });

  it('degraded with failing subsystems when the provider reports unhealthy', () => {
    const report = providerReport(
      {
        isHealthy: false,
        statusMessage: 'degraded',
        subsystemChecks: { runtime: true, gpu: false },
      },
      false,
      null,
    );
    expect(report.state).toBe('degraded');
    expect(report.explanation).toContain('gpu');
  });

  it('unknown (never healthy) when provider health could not be determined', () => {
    const report = providerReport(null, true, 'timeout');
    expect(report.state).toBe('unknown');
    expect(report.explanation).toContain('timeout');
  });
});

describe('meshReport', () => {
  it('is always unknown with the no-information explanation', () => {
    const report = meshReport();
    expect(report.name).toBe('Mesh Connectivity');
    expect(report.state).toBe('unknown');
    expect(report.explanation).toBe('No mesh health information reported.');
  });
});

describe('hasAnySignal', () => {
  it('false when the API answered but reported nothing and provider is absent', () => {
    expect(hasAnySignal({ ...okSnapshot, status: 42, database: null }, null)).toBe(false);
  });

  it('true when any signal exists', () => {
    expect(hasAnySignal(okSnapshot, null)).toBe(true);
    expect(hasAnySignal({ kind: 'unreachable', message: 'x' }, null)).toBe(true);
    expect(hasAnySignal({ ...okSnapshot, status: 42, database: null }, healthyProvider)).toBe(true);
  });
});
