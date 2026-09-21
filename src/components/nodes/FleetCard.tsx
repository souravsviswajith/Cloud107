import { Server } from 'lucide-react';
import type { ComputeNode } from '../../types';
import { DetailRow, GlassButton, StateBadge } from '../ui/Glass';
import {
  formatBytes,
  nodePlatformLabel,
  nodeStateDescription,
  nodeStateTone,
} from './nodePresentation';

/**
 * Layer 1 fleet card. Projects one real node record: identity, human-readable
 * state, platform/architecture, and resource summary. The shell reuses the
 * Glass E2 elevation recipe (bg-white/10, backdrop-blur-xl, shadow-2xl);
 * every repeated element is an existing Glass primitive. Selecting
 * Inspect opens the node in the Layer 2 inspector — there are no
 * unimplemented affordances on this card.
 */
export function FleetCard({
  node,
  selected,
  onInspect,
}: {
  node: ComputeNode;
  selected: boolean;
  onInspect: (id: string) => void;
}) {
  return (
    <article
      aria-current={selected ? 'true' : undefined}
      className={`rounded-2xl border bg-white/10 p-4 backdrop-blur-xl transition-all ${
        selected ? 'border-white/30 shadow-2xl' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <Server size={14} className="shrink-0 text-neutral-400" />
          <span className="truncate text-sm font-medium text-white">{node.name}</span>
        </span>
        <StateBadge tone={nodeStateTone(node.state)} label={node.state} />
      </div>
      <p className="mt-1 truncate font-mono text-[11px] text-neutral-500">{node.id}</p>
      <p className="mt-1 text-xs text-neutral-400">{nodeStateDescription(node.state)}</p>
      <div className="mt-1 border-t border-white/5 pt-1">
        <DetailRow label="Platform">{nodePlatformLabel(node)}</DetailRow>
        <DetailRow label="Resources">
          {node.vcpuCount} vCPU · {formatBytes(node.memoryBytes)} ·{' '}
          {formatBytes(node.diskSizeBytes)} disk
        </DetailRow>
        <DetailRow label="Address">{node.primaryIpAddress ?? 'Not reported'}</DetailRow>
      </div>
      <div className="mt-3">
        <GlassButton size="sm" onClick={() => onInspect(node.id)} disabled={selected}>
          {selected ? 'Inspecting' : 'Inspect'}
        </GlassButton>
      </div>
    </article>
  );
}
