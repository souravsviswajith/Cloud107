import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchControlPlaneHealth, type ControlPlaneHealthSnapshot } from '../../lib/diagnosticsApi';
import { capabilityApi } from '../../lib/capabilityApi';
import type { ProviderHealthCheck } from '../../types';
import {
  DIAG_STATE_LABEL,
  DIAG_STATE_TONE,
  aggregateDiagState,
  controlPlaneReport,
  hasAnySignal,
  meshReport,
  persistenceReport,
  providerReport,
  type SubsystemReport,
} from './diagnosticsPresentation';
import { SectionCard, GlassButton, StateBadge, GlassTerminal, PanelMessage } from '../ui/Glass';

const POLL_MS = 15000;

interface ProviderOutcome {
  health: ProviderHealthCheck | null;
  failed: boolean;
  failureMessage: string | null;
}

function SubsystemRow({ report }: { report: SubsystemReport }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-white/90">{report.name}</div>
        <div className="text-xs text-white/50 leading-relaxed">{report.explanation}</div>
      </div>
      <StateBadge tone={DIAG_STATE_TONE[report.state]} label={DIAG_STATE_LABEL[report.state]} />
    </div>
  );
}

export function DiagnosticsView() {
  const [snapshot, setSnapshot] = useState<ControlPlaneHealthSnapshot | null>(null);
  const [provider, setProvider] = useState<ProviderOutcome | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    try {
      const [snap, prov] = await Promise.all([
        fetchControlPlaneHealth(),
        (async (): Promise<ProviderOutcome> => {
          try {
            const res = await capabilityApi.getHealth();
            return { health: res.health, failed: false, failureMessage: null };
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Provider health request failed.';
            return { health: null, failed: true, failureMessage: message };
          }
        })(),
      ]);
      if (!mounted.current) return;
      setSnapshot(snap);
      setProvider(prov);
      setLastUpdated(new Date());
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh(true);
    const timer = setInterval(() => refresh(false), POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [refresh]);

  if (loading) {
    return (
      <SectionCard title="Platform Diagnostics">
        <PanelMessage title="Loading diagnostics…" spinning />
      </SectionCard>
    );
  }

  if (snapshot?.kind === 'unreachable' && provider?.failed !== false) {
    return (
      <SectionCard title="Platform Diagnostics">
        <PanelMessage
          tone="rose"
          title="Diagnostics API unavailable"
          message={`${snapshot.message} Check that the control plane is running and reachable.`}
          action={
            <GlassButton size="sm" onClick={() => refresh(false)} disabled={refreshing}>
              {refreshing ? 'Retrying…' : 'Retry'}
            </GlassButton>
          }
        />
      </SectionCard>
    );
  }

  const reports: SubsystemReport[] = snapshot
    ? [
        controlPlaneReport(snapshot),
        persistenceReport(snapshot),
        providerReport(
          provider?.health ?? null,
          provider?.failed ?? false,
          provider?.failureMessage ?? null,
        ),
        meshReport(),
      ]
    : [];
  const overall = aggregateDiagState(reports.map((r) => r.state));
  const empty = !hasAnySignal(snapshot, provider?.health ?? null);
  const rawPayload = {
    fetchedAt: lastUpdated?.toISOString() ?? null,
    controlPlane: snapshot?.kind === 'ok' || snapshot?.kind === 'http-error' ? snapshot.raw : null,
    provider: provider?.health ?? null,
  };

  return (
    <div className="space-y-3">
      <SectionCard
        title="Platform Diagnostics"
        subtitle={lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : undefined}
        action={
          <GlassButton size="sm" onClick={() => refresh(false)} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </GlassButton>
        }
      >
        <div className="flex items-center gap-3 pb-2">
          <span className="text-xs text-white/50">Overall status</span>
          <StateBadge tone={DIAG_STATE_TONE[overall]} label={DIAG_STATE_LABEL[overall]} />
        </div>
        {empty ? (
          <PanelMessage
            title="No diagnostic signals reported by the control plane."
            message="The control plane responded, but the response carried no recognizable health signals."
          />
        ) : (
          <div>
            {reports.map((r) => (
              <SubsystemRow key={r.name} report={r} />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Raw Payload">
        <p className="text-xs text-white/40 pb-2">
          Last snapshot received
          {lastUpdated ? ` at ${lastUpdated.toLocaleTimeString()}` : ''}. Snapshot only — not a live
          feed.
        </p>
        <GlassTerminal title="diagnostics snapshot">
          {JSON.stringify(rawPayload, null, 2)}
        </GlassTerminal>
      </SectionCard>
    </div>
  );
}
