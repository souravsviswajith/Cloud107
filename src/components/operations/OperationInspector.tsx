import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';
import type { NodeOperation, OperationStatus } from '../../types';
import { operationsApi } from '../../lib/capabilityApi';
import { ApiClientError } from '../../lib/apiClient';
import {
  DetailRow,
  GlassButton,
  GlassTerminal,
  PanelMessage,
  SectionCard,
  StateBadge,
} from '../ui/Glass';
import {
  formatDateTime,
  isTerminalOperationStatus,
  operationDurationLabel,
  operationStatusLabel,
  operationStatusTone,
  operationTypeLabel,
} from '../nodes/nodePresentation';

const INSPECTOR_POLL_MS = 5000;

function errorText(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}

function JsonBlock({ data, emptyLabel }: { data: unknown; emptyLabel: string }) {
  if (data === null || data === undefined) {
    return <p className="py-2 text-sm text-neutral-500">{emptyLabel}</p>;
  }
  return (
    <div className="py-2">
      <GlassTerminal>{JSON.stringify(data, null, 2)}</GlassTerminal>
    </div>
  );
}

/**
 * Layer 2 — operation inspection surface. Layer 1 tells the operator what
 * happened; this panel lets them investigate why. In-flight operations poll
 * until they reach a terminal state; terminal records render once and stop.
 */
export function OperationInspector({
  operationId,
  nodeNames,
}: {
  operationId: string | null;
  nodeNames: Record<string, string>;
}) {
  const [operation, setOperation] = useState<NodeOperation | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const statusRef = useRef<OperationStatus | null>(null);

  const load = useCallback(async (id: string, background: boolean) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const record = await operationsApi.getOperation(id);
      statusRef.current = record.status;
      setOperation(record);
    } catch (err: unknown) {
      if (!background) {
        setError(errorText(err));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    statusRef.current = null;
    if (!operationId) {
      setOperation(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    void load(operationId, false);
    const timer = setInterval(() => {
      if (cancelled) {
        return;
      }
      const status = statusRef.current;
      if (status && isTerminalOperationStatus(status)) {
        return;
      }
      void load(operationId, true);
    }, INSPECTOR_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [operationId, load]);

  const handleCopyId = useCallback(async () => {
    if (!operation) {
      return;
    }
    try {
      await navigator.clipboard.writeText(operation.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [operation]);

  if (!operationId) {
    return (
      <SectionCard title="Execution details" subtitle="Operation inspector">
        <PanelMessage
          title="No operation selected"
          message="Select an operation from the ledger to inspect its identity, lifecycle, request, result, and raw payload."
        />
      </SectionCard>
    );
  }

  if (loading) {
    return (
      <SectionCard title="Execution details" subtitle="Operation inspector">
        <PanelMessage
          title="Loading operation…"
          message="Reading operation record from the control plane."
          spinning
        />
      </SectionCard>
    );
  }

  if (error && !operation) {
    return (
      <SectionCard title="Execution details" subtitle="Operation inspector">
        <PanelMessage
          tone="rose"
          title="Operation unavailable"
          message={error}
          action={
            <GlassButton onClick={() => operationId && void load(operationId, false)}>
              Retry
            </GlassButton>
          }
        />
      </SectionCard>
    );
  }

  if (!operation) {
    return null;
  }

  const targetNode = operation.nodeId
    ? (nodeNames[operation.nodeId] ?? operation.nodeId)
    : 'No target node';
  const live = !isTerminalOperationStatus(operation.status);

  return (
    <div className="space-y-4">
      <SectionCard
        title="Execution details"
        subtitle={operationTypeLabel(operation.type)}
        action={
          <div className="flex items-center gap-2">
            {refreshing ? (
              <span className="text-xs text-neutral-500">Updating…</span>
            ) : live ? (
              <span className="text-xs text-neutral-500">Live</span>
            ) : null}
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => void load(operation.id, true)}
              disabled={refreshing}
              aria-label="Refresh operation"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </GlassButton>
          </div>
        }
      >
        <DetailRow label="Operation">
          <span className="inline-flex max-w-full items-center gap-2">
            <span className="break-all font-mono text-xs text-neutral-100">{operation.id}</span>
            <button
              onClick={() => void handleCopyId()}
              className="shrink-0 rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={copied ? 'Operation ID copied' : 'Copy operation ID'}
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </span>
        </DetailRow>
        <DetailRow label="Capability">{operationTypeLabel(operation.type)}</DetailRow>
        <DetailRow label="Target node">
          <span className="break-all">
            {targetNode}
            {operation.nodeId && nodeNames[operation.nodeId] ? (
              <span className="block font-mono text-[11px] text-neutral-500">
                {operation.nodeId}
              </span>
            ) : null}
          </span>
        </DetailRow>
        <DetailRow label="State">
          <StateBadge
            tone={operationStatusTone(operation.status)}
            label={operationStatusLabel(operation.status)}
            pulse={live}
          />
        </DetailRow>
        {live ? (
          <p className="pb-1 text-right text-xs text-neutral-400">Executing operation…</p>
        ) : null}
        <DetailRow label="Owner">User #{operation.userId}</DetailRow>
        <DetailRow label="Created">{formatDateTime(operation.createdAt)}</DetailRow>
        <DetailRow label="Updated">{formatDateTime(operation.updatedAt)}</DetailRow>
        <DetailRow label="Completed">{formatDateTime(operation.completedAt)}</DetailRow>
        <DetailRow label="Duration">{operationDurationLabel(operation)}</DetailRow>
      </SectionCard>

      <SectionCard title="Request" subtitle="Recorded operation context">
        <JsonBlock data={operation.payload} emptyLabel="No request payload recorded." />
      </SectionCard>

      <SectionCard
        title={operation.status === 'failed' ? 'Error' : 'Result'}
        subtitle={
          operation.status === 'failed'
            ? 'Structured failure'
            : operation.result
              ? 'Structured outcome'
              : 'Outcome not recorded yet'
        }
      >
        {operation.status === 'failed' ? (
          <p className="break-words py-2 font-mono text-xs text-rose-300">
            {operation.error ?? 'Failed with no recorded message.'}
          </p>
        ) : (
          <JsonBlock data={operation.result} emptyLabel="No result recorded yet." />
        )}
      </SectionCard>

      <SectionCard title="Advanced" subtitle="Raw operation payload">
        <div className="py-2">
          <GlassTerminal title="operation record">
            {JSON.stringify(operation, null, 2)}
          </GlassTerminal>
        </div>
      </SectionCard>
    </div>
  );
}
