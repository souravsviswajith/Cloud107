import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import type { NodeOperation, OperationStatus } from '../../types';
import { capabilityApi, operationsApi } from '../../lib/capabilityApi';
import { ApiClientError } from '../../lib/apiClient';
import { useShell } from '../../contexts/ShellContext';
import { GlassButton, PanelMessage, SectionCard, StateBadge } from '../ui/Glass';
import { OperationInspector } from './OperationInspector';
import {
  formatClockTime,
  formatDateTime,
  operationDurationLabel,
  operationStatusLabel,
  operationStatusTone,
  operationTypeLabel,
} from '../nodes/nodePresentation';

const STREAM_POLL_MS = 10000;
const STREAM_LIMIT = 100;

type StatusFilter = 'all' | OperationStatus;

const FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

function errorText(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}

/**
 * Layer 1 — human-readable operation ledger. Answers "What is Cloud107
 * doing?" Each row projects one ledger record; selecting a row opens the
 * Layer 2 inspector. REST polling only — no WebSocket theatre.
 */
export function OperationsView() {
  const { setActiveMode } = useShell();
  const [operations, setOperations] = useState<NodeOperation[]>([]);
  const [nodeNames, setNodeNames] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const refresh = useCallback(async (initial: boolean) => {
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    try {
      const [records, nodes] = await Promise.all([
        operationsApi.listOperations({ limit: STREAM_LIMIT }),
        capabilityApi.listNodes(),
      ]);
      setOperations(records);
      const names: Record<string, string> = {};
      for (const node of nodes) {
        names[node.id] = node.name;
      }
      setNodeNames(names);
      setLastSyncedAt(new Date());
      setSelectedId((prev) => {
        if (prev && records.some((record) => record.id === prev)) {
          return prev;
        }
        return records.length > 0 ? records[0].id : null;
      });
    } catch (err: unknown) {
      setError(errorText(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh(true);
    const timer = setInterval(() => void refresh(false), STREAM_POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: operations.length,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };
    for (const record of operations) {
      result[record.status] += 1;
    }
    return result;
  }, [operations]);

  const visible = useMemo(
    () => (filter === 'all' ? operations : operations.filter((record) => record.status === filter)),
    [operations, filter],
  );

  const activeCount = counts.pending + counts.running;

  return (
    <div className="relative min-h-screen">
      {/* Elevation 0 — spatial background */}
      <div className="pointer-events-none fixed left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[50%] w-[50%] rounded-full bg-white/[0.07] blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-white/[0.07] blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <GlassButton
              variant="ghost"
              onClick={() => setActiveMode('dashboard')}
              aria-label="Back to dashboard"
            >
              <ChevronLeft size={16} />
            </GlassButton>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Operations</h1>
              <p className="text-sm font-medium text-neutral-400">
                {operations.length} {operations.length === 1 ? 'record' : 'records'}
                {activeCount > 0 ? ` · ${activeCount} in flight` : ' · ledger quiet'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">
              {lastSyncedAt ? `Synced ${formatClockTime(lastSyncedAt)}` : 'Not synced'}
            </span>
            <GlassButton onClick={() => void refresh(false)} disabled={loading || refreshing}>
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Syncing…' : 'Sync'}
            </GlassButton>
          </div>
        </header>

        {loading ? (
          <SectionCard title="Ledger" subtitle="Operation records">
            <PanelMessage
              title="Loading operations…"
              message="Reading the operation ledger from the control plane."
              spinning
            />
          </SectionCard>
        ) : error && operations.length === 0 ? (
          <SectionCard title="Ledger" subtitle="Operation records">
            <PanelMessage
              tone="rose"
              title="Operations unavailable"
              message={error}
              action={<GlassButton onClick={() => void refresh(true)}>Retry</GlassButton>}
            />
          </SectionCard>
        ) : operations.length === 0 ? (
          <SectionCard title="Ledger" subtitle="Operation records">
            <PanelMessage title="No operations" message="No operations have been recorded yet." />
          </SectionCard>
        ) : (
          <main className="grid grid-cols-1 gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
            {/* Layer 1 — ledger */}
            <SectionCard
              title="Ledger"
              subtitle={`${visible.length} shown · newest first`}
              action={
                refreshing ? <span className="text-xs text-neutral-500">Updating…</span> : null
              }
            >
              <div className="flex flex-wrap gap-2 py-3" role="group" aria-label="Filter by status">
                {FILTERS.map((item) => (
                  <GlassButton
                    key={item.value}
                    size="sm"
                    variant={filter === item.value ? 'default' : 'ghost'}
                    onClick={() => setFilter(item.value)}
                    aria-pressed={filter === item.value}
                  >
                    {item.label} · {counts[item.value]}
                  </GlassButton>
                ))}
              </div>
              {visible.length === 0 ? (
                <PanelMessage
                  title={`No ${filter} operations`}
                  message="No records in the current ledger match this filter."
                />
              ) : (
                <ul className="space-y-2 py-2" role="listbox" aria-label="Operations">
                  {visible.map((record) => {
                    const selected = record.id === selectedId;
                    return (
                      <li key={record.id}>
                        <button
                          role="option"
                          aria-selected={selected}
                          onClick={() => setSelectedId(record.id)}
                          className={`w-full rounded-xl border p-3 text-left transition-all ${
                            selected
                              ? 'border-white/30 bg-white/10 backdrop-blur-xl'
                              : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-medium text-white">
                              {operationTypeLabel(record.type)}
                            </span>
                            <StateBadge
                              tone={operationStatusTone(record.status)}
                              label={operationStatusLabel(record.status)}
                              pulse={record.status === 'pending' || record.status === 'running'}
                            />
                          </div>
                          <p className="mt-1 truncate text-[11px] text-neutral-400">
                            {record.nodeId
                              ? (nodeNames[record.nodeId] ?? record.nodeId)
                              : 'No target node'}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-neutral-500">
                            {formatDateTime(record.createdAt)} · {operationDurationLabel(record)}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </SectionCard>

            {/* Layer 2 — inspector */}
            <OperationInspector operationId={selectedId} nodeNames={nodeNames} />
          </main>
        )}
      </div>
    </div>
  );
}
