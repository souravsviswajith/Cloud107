import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { Mock } from 'vitest';
import { NodeState, type ComputeNode, type NodeOperation } from '../../../types';
import { ShellProvider } from '../../../contexts/ShellContext';
import { capabilityApi, operationsApi } from '../../../lib/capabilityApi';
import { ApiClientError } from '../../../lib/apiClient';
import { OperationsView } from '../OperationsView';

vi.mock('../../../lib/capabilityApi', () => ({
  capabilityApi: { listNodes: vi.fn() },
  operationsApi: { listOperations: vi.fn(), getOperation: vi.fn() },
}));

const mockedListNodes = capabilityApi.listNodes as Mock;
const mockedListOperations = operationsApi.listOperations as Mock;
const mockedGetOperation = operationsApi.getOperation as Mock;

function makeNode(overrides: Partial<ComputeNode> = {}): ComputeNode {
  return {
    id: 'node-1',
    name: 'alpha',
    providerId: 'local-unix',
    state: NodeState.Running,
    userId: 1,
    vcpuCount: 2,
    memoryBytes: 1024,
    diskSizeBytes: 2048,
    primaryIpAddress: '10.0.0.2',
    metadata: {},
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:01:00.000Z',
    startedAt: '2026-09-21T00:01:00.000Z',
    ...overrides,
  };
}

function makeOperation(overrides: Partial<NodeOperation> = {}): NodeOperation {
  return {
    id: 'op-1',
    nodeId: 'node-1',
    userId: 1,
    type: 'provision',
    status: 'completed',
    payload: { name: 'alpha' },
    result: { message: 'done' },
    error: null,
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:12.000Z',
    completedAt: '2026-09-21T00:00:12.000Z',
    ...overrides,
  };
}

function renderStream() {
  return render(
    <ShellProvider>
      <OperationsView />
    </ShellProvider>,
  );
}

describe('OperationsView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ledger rows with human-readable state and resolves node names', async () => {
    const ops = [
      makeOperation({ id: 'op-1', type: 'provision', status: 'completed' }),
      makeOperation({
        id: 'op-2',
        type: 'start',
        status: 'failed',
        error: 'disk exploded',
        result: null,
        updatedAt: '2026-09-21T00:00:30.000Z',
        completedAt: '2026-09-21T00:00:30.000Z',
      }),
    ];
    mockedListOperations.mockResolvedValue(ops);
    mockedListNodes.mockResolvedValue([makeNode()]);
    mockedGetOperation.mockImplementation(async (id: string) => ops.find((op) => op.id === id));

    renderStream();

    const ledger = await screen.findByRole('listbox');
    expect(within(ledger).getByText('Provision')).toBeDefined();
    expect(within(ledger).getByText('Start')).toBeDefined();
    expect(within(ledger).getByText('Completed')).toBeDefined();
    expect(within(ledger).getByText('Failed')).toBeDefined();
    // Node id resolved to the real node name from the nodes endpoint.
    expect(within(ledger).getAllByText('alpha').length).toBeGreaterThan(0);
    // Durations derive from backend timestamps, not invented progress.
    const timestamps = within(ledger)
      .getAllByText((_, element) => element?.tagName === 'P')
      .map((element) => element.textContent ?? '')
      .join(' ');
    expect(timestamps).toContain('12s');
    expect(timestamps).toContain('30s');
  });

  it('opens the Layer 2 inspector when a row is selected', async () => {
    const ops = [
      makeOperation({ id: 'op-1', type: 'provision', status: 'completed' }),
      makeOperation({
        id: 'op-2',
        type: 'start',
        status: 'failed',
        error: 'disk exploded',
        result: null,
      }),
    ];
    mockedListOperations.mockResolvedValue(ops);
    mockedListNodes.mockResolvedValue([makeNode()]);
    mockedGetOperation.mockImplementation(async (id: string) => ops.find((op) => op.id === id));

    renderStream();
    const ledger = await screen.findByRole('listbox');
    fireEvent.click(within(ledger).getByText('Start'));

    // Inspector shows identity, structured error, and raw payload.
    expect(await screen.findByText('op-2')).toBeDefined();
    expect(screen.getByText('disk exploded')).toBeDefined();
    expect(screen.getByText('Raw operation payload')).toBeDefined();
  });

  it('filters the ledger by status', async () => {
    mockedListOperations.mockResolvedValue([
      makeOperation({ id: 'op-1', type: 'provision', status: 'completed' }),
      makeOperation({ id: 'op-2', type: 'start', status: 'failed', error: 'x', result: null }),
    ]);
    mockedListNodes.mockResolvedValue([makeNode()]);
    mockedGetOperation.mockImplementation(async (id: string) => makeOperation({ id }));

    renderStream();
    await screen.findByRole('listbox');
    fireEvent.click(screen.getByText('Failed · 1'));

    const ledger = screen.getByRole('listbox');
    expect(within(ledger).queryByText('Provision')).toBeNull();
    expect(within(ledger).getByText('Start')).toBeDefined();
  });

  it('distinguishes empty ledgers from failures', async () => {
    mockedListOperations.mockResolvedValue([]);
    mockedListNodes.mockResolvedValue([]);
    renderStream();
    expect(await screen.findByText('No operations')).toBeDefined();
    expect(screen.getByText('No operations have been recorded yet.')).toBeDefined();
  });

  it('reports failures with retry', async () => {
    mockedListOperations.mockRejectedValueOnce(new ApiClientError('ledger down', 503));
    mockedListNodes.mockResolvedValue([]);
    renderStream();
    expect(await screen.findByText('Operations unavailable')).toBeDefined();

    mockedListOperations.mockResolvedValue([makeOperation()]);
    mockedGetOperation.mockResolvedValue(makeOperation());
    fireEvent.click(screen.getByText('Retry'));
    expect(await screen.findByRole('listbox')).toBeDefined();
  });
});
