import { describe, expect, it, vi, beforeEach, type MockedFunction } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiagnosticsView } from '../DiagnosticsView';
import {
  fetchControlPlaneHealth,
  type ControlPlaneHealthSnapshot,
} from '../../../lib/diagnosticsApi';
import { capabilityApi } from '../../../lib/capabilityApi';
import type { NodeOperation, ProviderHealthCheck } from '../../../types';

vi.mock('../../../lib/diagnosticsApi', () => ({ fetchControlPlaneHealth: vi.fn() }));
vi.mock('../../../lib/capabilityApi', () => ({ capabilityApi: { getHealth: vi.fn() } }));

const mockFetchHealth = fetchControlPlaneHealth as MockedFunction<typeof fetchControlPlaneHealth>;
const mockGetHealth = capabilityApi.getHealth as MockedFunction<typeof capabilityApi.getHealth>;

const okSnapshot: ControlPlaneHealthSnapshot = {
  kind: 'ok',
  status: 'ok',
  database: 'connected',
  requestMs: 12,
  correlationId: 'corr-1',
  raw: { success: true, data: { status: 'ok', database: 'connected' } },
};

const healthyProvider: ProviderHealthCheck = {
  isHealthy: true,
  statusMessage: 'All systems operational',
  subsystemChecks: { runtime: true },
};

function healthOperation(id: string): NodeOperation {
  return {
    id,
    nodeId: null,
    userId: 1,
    type: 'health_check',
    status: 'completed',
    payload: null,
    result: null,
    error: null,
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:00.000Z',
    completedAt: '2026-09-21T00:00:00.000Z',
  };
}

function mockAllHealthy() {
  mockFetchHealth.mockResolvedValue(okSnapshot);
  mockGetHealth.mockResolvedValue({ health: healthyProvider, operation: healthOperation('op-1') });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DiagnosticsView', () => {
  it('shows loading first, then overall Healthy with subsystem rows', async () => {
    mockAllHealthy();
    render(<DiagnosticsView />);
    expect(screen.getByText('Loading diagnostics…')).toBeDefined();

    expect(await screen.findByText('Overall status')).toBeDefined();
    expect(screen.getByText('Control Plane API')).toBeDefined();
    expect(screen.getByText('Persistence')).toBeDefined();
    expect(screen.getByText('Provider Runtime')).toBeDefined();
    expect(screen.getByText('Mesh Connectivity')).toBeDefined();
    // 3 healthy rows; overall is Unknown because mesh state is never reported
    expect(screen.getAllByText('Healthy').length).toBe(3);
    expect(screen.getAllByText('Unknown').length).toBe(2);
  });

  it('always reports Mesh Connectivity as Unknown', async () => {
    mockAllHealthy();
    render(<DiagnosticsView />);
    expect(await screen.findByText('No mesh health information reported.')).toBeDefined();
  });

  it('reports Degraded when the provider reports unhealthy', async () => {
    mockFetchHealth.mockResolvedValue(okSnapshot);
    mockGetHealth.mockResolvedValue({
      health: {
        isHealthy: false,
        statusMessage: 'GPU subsystem down',
        subsystemChecks: { runtime: true, gpu: false },
      },
      operation: healthOperation('op-2'),
    });
    render(<DiagnosticsView />);
    expect(await screen.findByText('GPU subsystem down. Failing: gpu.')).toBeDefined();
    expect(screen.getAllByText('Degraded').length).toBeGreaterThanOrEqual(2);
  });

  it('reports Offline for the control plane on HTTP errors', async () => {
    mockFetchHealth.mockResolvedValue({
      kind: 'http-error',
      statusCode: 503,
      message: 'Database connection failed',
      requestMs: 9,
      correlationId: null,
      raw: null,
    });
    mockGetHealth.mockResolvedValue({
      health: healthyProvider,
      operation: healthOperation('op-3'),
    });
    render(<DiagnosticsView />);
    expect(await screen.findByText(/Control plane responded with HTTP 503/)).toBeDefined();
    expect(screen.getAllByText('Offline').length).toBeGreaterThanOrEqual(2);
  });

  it('reports Unknown (never Healthy) when signals are undeterminable', async () => {
    mockFetchHealth.mockResolvedValue({ ...okSnapshot, database: undefined });
    mockGetHealth.mockRejectedValue(new Error('timeout'));
    render(<DiagnosticsView />);
    expect(
      await screen.findByText('Control plane did not report persistence state.'),
    ).toBeDefined();
    expect(screen.getByText(/Provider health could not be determined/)).toBeDefined();
    expect(screen.queryByText('No diagnostic signals reported by the control plane.')).toBeNull();
  });

  it('shows the API-unavailable state with Retry when both fetches fail', async () => {
    mockFetchHealth.mockResolvedValue({ kind: 'unreachable', message: 'no route to host' });
    mockGetHealth.mockRejectedValue(new Error('network down'));
    render(<DiagnosticsView />);
    expect(await screen.findByText('Diagnostics API unavailable')).toBeDefined();
    expect(screen.getByText(/no route to host/)).toBeDefined();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeDefined();
  });

  it('shows the empty state when the API responds but reports no signals', async () => {
    mockFetchHealth.mockResolvedValue({ ...okSnapshot, status: 42, database: null });
    mockGetHealth.mockRejectedValue(new Error('network down'));
    render(<DiagnosticsView />);
    expect(
      await screen.findByText('No diagnostic signals reported by the control plane.'),
    ).toBeDefined();
  });

  it('renders the raw payload snapshot with a timestamp', async () => {
    mockAllHealthy();
    render(<DiagnosticsView />);
    expect(await screen.findByText('Raw Payload')).toBeDefined();
    expect(screen.getByText(/Last snapshot received/)).toBeDefined();
    expect(screen.getByText(/"database": "connected"/)).toBeDefined();
  });
});
