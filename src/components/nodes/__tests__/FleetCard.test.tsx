import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FleetCard } from '../FleetCard';
import { NodeState, type ComputeNode } from '../../../types';

function makeNode(overrides: Partial<ComputeNode> = {}): ComputeNode {
  return {
    id: 'node-1',
    name: 'alpha',
    providerId: 'mock',
    state: NodeState.Running,
    userId: 1,
    vcpuCount: 4,
    memoryBytes: 17179869184,
    diskSizeBytes: 107374182400,
    primaryIpAddress: '10.0.0.4',
    metadata: { platform: 'kvm', arch: 'x86_64' },
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:00.000Z',
    startedAt: '2026-09-21T00:01:00.000Z',
    ...overrides,
  };
}

describe('FleetCard', () => {
  it('renders identity, human-readable state, platform, and resources', () => {
    render(<FleetCard node={makeNode()} selected={false} onInspect={() => {}} />);
    expect(screen.getByText('alpha')).toBeDefined();
    expect(screen.getByText('node-1')).toBeDefined();
    expect(screen.getByText('Running')).toBeDefined();
    expect(screen.getByText('Node is active and executing workloads.')).toBeDefined();
    expect(screen.getByText('kvm · x86_64')).toBeDefined();
    expect(screen.getByText(/4 vCPU/)).toBeDefined();
    expect(screen.getByText(/16 GB/)).toBeDefined();
    expect(screen.getByText(/100 GB disk/)).toBeDefined();
    expect(screen.getByText('10.0.0.4')).toBeDefined();
  });

  it('degrades honestly when platform and address are not reported', () => {
    render(
      <FleetCard
        node={makeNode({ metadata: {}, primaryIpAddress: null })}
        selected={false}
        onInspect={() => {}}
      />,
    );
    expect(screen.getByText('—')).toBeDefined();
    expect(screen.getByText('Not reported')).toBeDefined();
  });

  it('calls onInspect with the node id when Inspect is clicked', () => {
    const onInspect = vi.fn();
    render(<FleetCard node={makeNode()} selected={false} onInspect={onInspect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inspect' }));
    expect(onInspect).toHaveBeenCalledWith('node-1');
  });

  it('marks the selected card as inspecting with a disabled button', () => {
    render(<FleetCard node={makeNode()} selected onInspect={() => {}} />);
    const button = screen.getByRole('button', { name: 'Inspecting' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
