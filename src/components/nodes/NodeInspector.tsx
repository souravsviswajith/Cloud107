import { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Check, Copy, Play, RefreshCw, Square, Trash2 } from 'lucide-react';
import type {
  ComputeNode,
  ComputeProviderCapabilities,
  NodeOperation,
  NodePerformanceMetrics,
  ProviderHealthCheck,
} from '../../types';
import { capabilityApi } from '../../lib/capabilityApi';
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
  canStartNode,
  canStopNode,
  canTerminateNode,
  formatBytes,
  formatDateTime,
  nodeStateDescription,
  nodeStateTone,
  operationStatusLabel,
  operationStatusTone,
  operationTypeLabel,
  supportedLabel,
  supportedTone,
} from './nodePresentation';

interface NodeInspectorProps {
  nodeId: string | null;
  capabilities: ComputeProviderCapabilities | null;
  health: ProviderHealthCheck | null;
  onHealthSampled: (health: ProviderHealthCheck) => void;
  onNodeChanged: () => void;
}

function errorText(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}

function MetricBar({
  label,
  display,
  fraction,
}: {
  label: string;
  display: string;
  fraction: number;
}) {
  const width = Math.min(100, Math.max(0, fraction * 100));
  return (
    <div className="py-2">
      <div className="mb-1.5 flex items-center justify-between gap-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          {label}
        </span>
        <span className="font-mono text-sm text-neutral-100">{display}</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label={label}
        aria-valuetext={display}
      >
        <div className="h-full rounded-full bg-sky-400/80" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

/**
 * Canonical infrastructure detail view. Answers "What is this node doing?"
 * Every section projects backend state (node record, live metrics, provider
 * capabilities, operation ledger) — nothing here is simulated.
 */
export function NodeInspector({
  nodeId,
  capabilities,
  health,
  onHealthSampled,
  onNodeChanged,
}: NodeInspectorProps) {
  const [node, setNode] = useState<ComputeNode | null>(null);
  const [metrics, setMetrics] = useState<NodePerformanceMetrics | null>(null);
  const [operations, setOperations] = useState<NodeOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [opsError, setOpsError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<'start' | 'stop' | 'terminate' | null>(null);
  const [healthPending, setHealthPending] = useState(false);
  const [confirmingTerminate, setConfirmingTerminate] = useState(false);
  const [copied, setCopied] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) {
        clearTimeout(confirmTimer.current);
      }
    };
  }, []);

  const loadMetrics = useCallback(async (id: string) => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const result = await capabilityApi.getNodeMetrics(id);
      setMetrics(result.metrics);
      setOperations((prev) =>
        prev.some((op) => op.id === result.operation.id) ? prev : [result.operation, ...prev],
      );
    } catch (err: unknown) {
      setMetricsError(errorText(err));
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const loadOperations = useCallback(async (id: string) => {
    setOpsError(null);
    try {
      const ops = await capabilityApi.listNodeOperations(id);
      setOperations(ops);
    } catch (err: unknown) {
      setOpsError(errorText(err));
    }
  }, []);

  const loadNode = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      setNode(null);
      setMetrics(null);
      setMetricsError(null);
      setOperations([]);
      setOpsError(null);
      setConfirmingTerminate(false);
      try {
        const record = await capabilityApi.getNode(id);
        setNode(record);
        // Metrics and operations degrade independently — a metrics failure
        // must not hide the node record.
        await Promise.all([loadMetrics(id), loadOperations(id)]);
      } catch (err: unknown) {
        setError(errorText(err));
      } finally {
        setLoading(false);
      }
    },
    [loadMetrics, loadOperations],
  );

  useEffect(() => {
    if (!nodeId) {
      setNode(null);
      setError(null);
      setLoading(false);
      return;
    }
    void loadNode(nodeId);
  }, [nodeId, loadNode]);

  const runAction = useCallback(
    async (action: 'start' | 'stop' | 'terminate') => {
      if (!node || actionPending) {
        return;
      }
      setActionPending(action);
      try {
        const result =
          action === 'start'
            ? await capabilityApi.startNode(node.id)
            : action === 'stop'
              ? await capabilityApi.stopNode(node.id)
              : await capabilityApi.terminateNode(node.id);
        setNode(result.node);
        setOperations((prev) => [result.operation, ...prev]);
        setConfirmingTerminate(false);
        onNodeChanged();
      } catch (err: unknown) {
        setError(errorText(err));
      } finally {
        setActionPending(null);
      }
    },
    [node, actionPending, onNodeChanged],
  );

  const handleTerminateClick = useCallback(() => {
    if (!node || actionPending) {
      return;
    }
    if (!confirmingTerminate) {
      setConfirmingTerminate(true);
      if (confirmTimer.current) {
        clearTimeout(confirmTimer.current);
      }
      confirmTimer.current = setTimeout(() => setConfirmingTerminate(false), 5000);
      return;
    }
    void runAction('terminate');
  }, [node, actionPending, confirmingTerminate, runAction]);

  const handleCopyId = useCallback(async () => {
    if (!node) {
      return;
    }
    try {
      await navigator.clipboard.writeText(node.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [node]);

  const handleSampleHealth = useCallback(async () => {
    setHealthPending(true);
    try {
      const result = await capabilityApi.getHealth();
      onHealthSampled(result.health);
    } catch (err: unknown) {
      setError(errorText(err));
    } finally {
      setHealthPending(false);
    }
  }, [onHealthSampled]);

  if (!nodeId) {
    return (
      <SectionCard title="Node Inspector" subtitle="Infrastructure detail">
        <PanelMessage
          title="No node selected"
          message="Select a node from the inventory to inspect its identity, health, capabilities, resources, and operations."
        />
      </SectionCard>
    );
  }

  if (loading) {
    return (
      <SectionCard title="Node Inspector" subtitle="Infrastructure detail">
        <PanelMessage
          title="Loading node…"
          message="Reading node record from the control plane."
          spinning
        />
      </SectionCard>
    );
  }

  if (error && !node) {
    return (
      <SectionCard title="Node Inspector" subtitle="Infrastructure detail">
        <PanelMessage
          tone="rose"
          title="Node unavailable"
          message={error}
          action={<GlassButton onClick={() => nodeId && void loadNode(nodeId)}>Retry</GlassButton>}
        />
      </SectionCard>
    );
  }

  if (!node) {
    return null;
  }

  const failingChecks = health
    ? Object.entries(health.subsystemChecks).filter(([, passing]) => !passing)
    : [];
  const passingCount = health ? Object.values(health.subsystemChecks).filter(Boolean).length : 0;
  const totalChecks = health ? Object.keys(health.subsystemChecks).length : 0;
  const platform = node.metadata.platform;
  const arch = node.metadata.arch;
  const kind = platform || arch ? [platform, arch].filter(Boolean).join(' · ') : '—';
  const memoryFraction =
    metrics && metrics.memoryTotalBytes > 0
      ? metrics.memoryUsedBytes / metrics.memoryTotalBytes
      : 0;
  const diagnostics = {
    node,
    metrics,
    providerHealth: health
      ? {
          isHealthy: health.isHealthy,
          statusMessage: health.statusMessage,
          subsystemChecks: health.subsystemChecks,
        }
      : null,
  };

  return (
    <div className="space-y-4">
      {/* Identity */}
      <SectionCard
        title="Identity"
        subtitle={node.name}
        action={
          <GlassButton
            variant="ghost"
            onClick={() => void loadNode(node.id)}
            disabled={loading}
            aria-label="Reload node"
          >
            <RefreshCw size={14} />
            Reload
          </GlassButton>
        }
      >
        <DetailRow label="Node ID">
          <span className="inline-flex max-w-full items-center gap-2">
            <span className="break-all font-mono text-xs text-neutral-100">{node.id}</span>
            <button
              onClick={() => void handleCopyId()}
              className="shrink-0 rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={copied ? 'Node ID copied' : 'Copy node ID'}
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </span>
        </DetailRow>
        <DetailRow label="Name">{node.name}</DetailRow>
        <DetailRow label="Provider">
          <span className="font-mono text-xs">{node.providerId}</span>
        </DetailRow>
        <DetailRow label="Kind">
          <span className="font-mono text-xs">{kind}</span>
        </DetailRow>
        <DetailRow label="Owner">User #{node.userId}</DetailRow>
        <DetailRow label="Created">{formatDateTime(node.createdAt)}</DetailRow>
        <DetailRow label="Last state update">{formatDateTime(node.updatedAt)}</DetailRow>
      </SectionCard>

      {/* Health */}
      <SectionCard
        title="Health"
        subtitle="Reported state and host checks"
        action={
          <GlassButton
            variant="ghost"
            onClick={() => void handleSampleHealth()}
            disabled={healthPending}
          >
            <Activity size={14} />
            {healthPending ? 'Sampling…' : 'Run health check'}
          </GlassButton>
        }
      >
        <div className="flex items-center justify-between gap-4 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Current state
          </span>
          <StateBadge
            tone={nodeStateTone(node.state)}
            label={node.state}
            pulse={
              node.state !== 'Running' && node.state !== 'Stopped' && node.state !== 'Terminated'
            }
          />
        </div>
        <p className="pb-1 text-right text-xs text-neutral-400">
          {nodeStateDescription(node.state)}
        </p>
        <DetailRow label="Reported address">
          {node.primaryIpAddress ? (
            <span className="font-mono text-xs">{node.primaryIpAddress}</span>
          ) : (
            <span className="text-neutral-500">Not reported</span>
          )}
        </DetailRow>
        <DetailRow label="Host checks">
          {health ? (
            <span>
              {passingCount} of {totalChecks} passing
              {failingChecks.length > 0 ? (
                <span className="mt-1 block font-mono text-xs text-amber-300">
                  Failing: {failingChecks.map(([name]) => name).join(', ')}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="text-neutral-500">Not yet sampled</span>
          )}
        </DetailRow>
      </SectionCard>

      {/* Capabilities */}
      <SectionCard title="Capabilities" subtitle="Discovered, not assumed">
        {capabilities ? (
          <>
            <DetailRow label="Hardware GPU passthrough">
              <StateBadge
                tone={supportedTone(capabilities.supportsHardwareGpuPassthrough)}
                label={supportedLabel(capabilities.supportsHardwareGpuPassthrough)}
              />
            </DetailRow>
            <DetailRow label="Nested virtualization">
              <StateBadge
                tone={supportedTone(capabilities.supportsNestedVirtualization)}
                label={supportedLabel(capabilities.supportsNestedVirtualization)}
              />
            </DetailRow>
            <DetailRow label="Live migration">
              <StateBadge
                tone={supportedTone(capabilities.supportsLiveMigration)}
                label={supportedLabel(capabilities.supportsLiveMigration)}
              />
            </DetailRow>
            <DetailRow label="Ephemeral snapshots">
              <StateBadge
                tone={supportedTone(capabilities.supportsEphemeralSnapshots)}
                label={supportedLabel(capabilities.supportsEphemeralSnapshots)}
              />
            </DetailRow>
            <DetailRow label="Guest operating systems">
              {capabilities.supportedGuestOperatingSystems.join(', ') || '—'}
            </DetailRow>
            <DetailRow label="Architectures">
              {capabilities.supportedArchitectures.join(', ') || '—'}
            </DetailRow>
          </>
        ) : (
          <PanelMessage
            title="Capabilities unknown"
            message="Provider capabilities have not loaded yet."
          />
        )}
        <DetailRow label="Reserved vCPUs">{node.vcpuCount}</DetailRow>
        <DetailRow label="Reserved memory">{formatBytes(node.memoryBytes)}</DetailRow>
        <DetailRow label="Reserved disk">{formatBytes(node.diskSizeBytes)}</DetailRow>
      </SectionCard>

      {/* Resources */}
      <SectionCard
        title="Resources"
        subtitle={metrics ? `Sampled ${formatDateTime(metrics.sampledAt)}` : 'Live host telemetry'}
        action={
          <GlassButton
            variant="ghost"
            onClick={() => void loadMetrics(node.id)}
            disabled={metricsLoading}
          >
            <RefreshCw size={14} className={metricsLoading ? 'animate-spin' : ''} />
            {metricsLoading ? 'Sampling…' : 'Sample now'}
          </GlassButton>
        }
      >
        {metricsError && !metrics ? (
          <PanelMessage
            tone="rose"
            title="Metrics unavailable"
            message={metricsError}
            action={<GlassButton onClick={() => void loadMetrics(node.id)}>Retry</GlassButton>}
          />
        ) : metrics ? (
          <>
            <MetricBar
              label="CPU usage"
              display={`${metrics.cpuUsagePercentage}%`}
              fraction={metrics.cpuUsagePercentage / 100}
            />
            <MetricBar
              label="Memory usage"
              display={`${formatBytes(metrics.memoryUsedBytes)} of ${formatBytes(metrics.memoryTotalBytes)}`}
              fraction={memoryFraction}
            />
            <DetailRow label="Disk read">
              <span className="font-mono text-xs">
                {formatBytes(metrics.diskReadBytesPerSec)}/s
              </span>
            </DetailRow>
            <DetailRow label="Disk write">
              <span className="font-mono text-xs">
                {formatBytes(metrics.diskWriteBytesPerSec)}/s
              </span>
            </DetailRow>
            <DetailRow label="Network receive">
              <span className="font-mono text-xs">
                {formatBytes(metrics.networkRxBytesPerSec)}/s
              </span>
            </DetailRow>
            <DetailRow label="Network transmit">
              <span className="font-mono text-xs">
                {formatBytes(metrics.networkTxBytesPerSec)}/s
              </span>
            </DetailRow>
            <p className="py-2 text-right text-[11px] text-neutral-500">
              Rates derive from consecutive host samples; the first sample reads zero.
            </p>
          </>
        ) : (
          <PanelMessage title="Sampling metrics…" spinning />
        )}
      </SectionCard>

      {/* Lifecycle actions */}
      <SectionCard title="Lifecycle" subtitle="State transitions execute against the provider">
        <div className="flex flex-wrap items-center gap-3 py-2">
          <GlassButton
            onClick={() => void runAction('start')}
            disabled={!canStartNode(node.state) || actionPending !== null}
          >
            <Play size={14} />
            {actionPending === 'start' ? 'Starting…' : 'Start'}
          </GlassButton>
          <GlassButton
            onClick={() => void runAction('stop')}
            disabled={!canStopNode(node.state) || actionPending !== null}
          >
            <Square size={14} />
            {actionPending === 'stop' ? 'Stopping…' : 'Stop'}
          </GlassButton>
          <GlassButton
            variant="danger"
            onClick={handleTerminateClick}
            disabled={!canTerminateNode(node.state) || actionPending !== null}
          >
            <Trash2 size={14} />
            {actionPending === 'terminate'
              ? 'Terminating…'
              : confirmingTerminate
                ? 'Confirm terminate'
                : 'Terminate'}
          </GlassButton>
        </div>
        <p className="pb-2 text-xs text-neutral-500">
          Start requires Stopped · Stop requires Running · Terminate reclaims resources and closes
          the node.
        </p>
        {error && node ? <p className="pb-2 text-xs text-rose-300">{error}</p> : null}
      </SectionCard>

      {/* Operations */}
      <SectionCard
        title="Operations"
        subtitle={
          operations.length > 0
            ? `${operations.length} recorded for this node`
            : 'Active node operations'
        }
      >
        {opsError ? (
          <PanelMessage
            tone="rose"
            title="Operations unavailable"
            message={opsError}
            action={<GlassButton onClick={() => void loadOperations(node.id)}>Retry</GlassButton>}
          />
        ) : operations.length === 0 ? (
          <PanelMessage
            title="No operations recorded"
            message="Lifecycle and audit operations for this node will appear here."
          />
        ) : (
          <ul className="divide-y divide-white/5">
            {operations.slice(0, 10).map((op) => (
              <li key={op.id} className="flex items-start justify-between gap-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm text-neutral-100">{operationTypeLabel(op.type)}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-neutral-500">
                    {formatDateTime(op.createdAt)}
                  </p>
                  {op.status === 'failed' && op.error ? (
                    <p className="mt-1 break-words font-mono text-[11px] text-rose-300">
                      {op.error}
                    </p>
                  ) : null}
                </div>
                <StateBadge
                  tone={operationStatusTone(op.status)}
                  label={operationStatusLabel(op.status)}
                  pulse={op.status === 'pending' || op.status === 'running'}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* Advanced */}
      <SectionCard title="Advanced" subtitle="Raw node diagnostics">
        <div className="py-2">
          <GlassTerminal title="node · metrics · provider health">
            {JSON.stringify(diagnostics, null, 2)}
          </GlassTerminal>
        </div>
      </SectionCard>
    </div>
  );
}
