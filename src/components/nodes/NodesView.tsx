import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import type { ComputeNode, ComputeProviderCapabilities, ProviderHealthCheck } from '../../types';
import { capabilityApi } from '../../lib/capabilityApi';
import { ApiClientError } from '../../lib/apiClient';
import { useShell } from '../../contexts/ShellContext';
import { DetailRow, GlassButton, PanelMessage, SectionCard, StateBadge } from '../ui/Glass';
import { NodeInspector } from './NodeInspector';
import { FleetCard } from './FleetCard';
import { formatClockTime } from './nodePresentation';

const LIST_REFRESH_MS = 15000;

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
 * Node fleet + inspector surface. Projects the Capability API:
 * provider capabilities, host health, node records. Loading, empty, and
 * error states are explicit — the view never renders placeholder state.
 */
export function NodesView() {
  const { setActiveMode } = useShell();
  const [nodes, setNodes] = useState<ComputeNode[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<ComputeProviderCapabilities | null>(null);
  const [health, setHealth] = useState<ProviderHealthCheck | null>(null);
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
      const [capabilityResult, healthResult, nodeList] = await Promise.all([
        capabilityApi.getCapabilities(),
        capabilityApi.getHealth(),
        capabilityApi.listNodes(),
      ]);
      setProviderId(capabilityResult.providerId);
      setCapabilities(capabilityResult.capabilities);
      setHealth(healthResult.health);
      setNodes(nodeList);
      setLastSyncedAt(new Date());
      setSelectedId((prev) => {
        if (prev && nodeList.some((node) => node.id === prev)) {
          return prev;
        }
        return nodeList.length > 0 ? nodeList[0].id : null;
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
    const timer = setInterval(() => void refresh(false), LIST_REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const runningCount = nodes.filter((node) => node.state === 'Running').length;
  const attentionCount = nodes.filter(
    (node) => node.state === 'Error' || node.state === 'Provisioning',
  ).length;

  return (
    <div className="relative min-h-screen">
      {/* Elevation 0 — spatial background */}
      <div className="pointer-events-none fixed left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[50%] w-[50%] rounded-full bg-blue-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-900/20 blur-[120px] mix-blend-screen" />
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
              <h1 className="text-2xl font-semibold tracking-tight text-white">Nodes</h1>
              <p className="text-sm font-medium text-neutral-400">
                {providerId ? `Provider ${providerId}` : 'Infrastructure inventory'} ·{' '}
                {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'} · {runningCount} running
                {attentionCount > 0 ? ` · ${attentionCount} need attention` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {health ? (
              <StateBadge
                tone={health.isHealthy ? 'emerald' : 'amber'}
                label={health.isHealthy ? 'System Healthy' : 'System Degraded'}
              />
            ) : (
              <StateBadge
                tone="zinc"
                label={loading ? 'Checking…' : 'Health unknown'}
                pulse={loading}
              />
            )}
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
          <SectionCard title="Fleet" subtitle="Node records">
            <PanelMessage
              title="Loading nodes…"
              message="Reading node records from the control plane."
              spinning
            />
          </SectionCard>
        ) : error && nodes.length === 0 ? (
          <SectionCard title="Fleet" subtitle="Node records">
            <PanelMessage
              tone="rose"
              title="Fleet unavailable"
              message={error}
              action={<GlassButton onClick={() => void refresh(true)}>Retry</GlassButton>}
            />
          </SectionCard>
        ) : nodes.length === 0 ? (
          <SectionCard title="Fleet" subtitle="Node records">
            <PanelMessage
              title="No nodes provisioned"
              message="No node records exist yet. Provision nodes through POST /api/v1/nodes; they will appear here for inspection."
            />
          </SectionCard>
        ) : (
          <main className="grid grid-cols-1 gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
            {/* Fleet */}
            <SectionCard title="Fleet" subtitle={`${nodes.length} records`}>
              <ul className="space-y-3 py-2" aria-label="Fleet">
                {nodes.map((node) => (
                  <li key={node.id}>
                    <FleetCard
                      node={node}
                      selected={node.id === selectedId}
                      onInspect={setSelectedId}
                    />
                  </li>
                ))}
              </ul>
              <DetailRow label="Last sync">
                {lastSyncedAt ? formatClockTime(lastSyncedAt) : '—'}
              </DetailRow>
            </SectionCard>

            {/* Inspector */}
            <NodeInspector
              nodeId={selectedId}
              capabilities={capabilities}
              health={health}
              onHealthSampled={setHealth}
              onNodeChanged={() => void refresh(false)}
            />
          </main>
        )}
      </div>
    </div>
  );
}
