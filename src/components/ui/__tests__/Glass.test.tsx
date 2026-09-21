import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StateBadge, PanelMessage } from '../Glass';

describe('StateBadge', () => {
  it('always pairs the visual dot with a human-readable label', () => {
    render(<StateBadge tone="emerald" label="Online" />);
    // The text label is the accessible representation — never dot-only.
    expect(screen.getByText('Online')).toBeDefined();
    expect(screen.getByTestId('state-dot')).toBeDefined();
  });

  it('renders transitional states with explicit text', () => {
    render(<StateBadge tone="sky" label="Synchronizing node capabilities" pulse />);
    expect(screen.getByText('Synchronizing node capabilities')).toBeDefined();
  });
});

describe('PanelMessage', () => {
  it('renders text-first loading states', () => {
    render(<PanelMessage title="Loading nodes…" spinning />);
    expect(screen.getByText('Loading nodes…')).toBeDefined();
  });

  it('renders errors with message text', () => {
    render(<PanelMessage tone="rose" title="Request failed" message="boom" />);
    expect(screen.getByText('Request failed')).toBeDefined();
    expect(screen.getByText('boom')).toBeDefined();
  });
});
