import { describe, expect, it, vi, beforeEach, type MockedFunction } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProvisionWorkspaceForm } from '../ProvisionWorkspaceForm';
import { ApiClientError, workspaceApi } from '../../../lib/apiClient';
import { WorkspaceState, type Workspace } from '../../../types';

vi.mock('../../../lib/apiClient', () => ({
  ApiClientError: class ApiClientError extends Error {},
  workspaceApi: { createWorkspace: vi.fn() },
}));

const mockCreate = workspaceApi.createWorkspace as MockedFunction<
  typeof workspaceApi.createWorkspace
>;

function makeWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    id: 'ws-1',
    name: 'ND-01',
    state: WorkspaceState.Starting,
    userId: 1,
    createdAt: '2026-09-21T00:00:00.000Z',
    updatedAt: '2026-09-21T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProvisionWorkspaceForm', () => {
  it('renders the name field and provision button', () => {
    render(<ProvisionWorkspaceForm onCreated={() => {}} />);
    expect(screen.getByLabelText('Workspace name')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Provision Workspace' })).toBeDefined();
  });

  it('rejects an empty name without calling the API', () => {
    render(<ProvisionWorkspaceForm onCreated={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Provision Workspace' }));
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Workspace name is required.')).toBeDefined();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rejects names longer than 100 characters without calling the API', () => {
    render(<ProvisionWorkspaceForm onCreated={() => {}} />);
    fireEvent.change(screen.getByLabelText('Workspace name'), {
      target: { value: 'x'.repeat(101) },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Provision Workspace' }));
    expect(screen.getByText('Workspace name must be 100 characters or fewer.')).toBeDefined();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('submits the trimmed name and reports the real backend state on success', async () => {
    const onCreated = vi.fn();
    mockCreate.mockResolvedValue(makeWorkspace());
    render(<ProvisionWorkspaceForm onCreated={onCreated} />);
    fireEvent.change(screen.getByLabelText('Workspace name'), {
      target: { value: '  ND-01  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Provision Workspace' }));
    expect(await screen.findByText('Workspace created')).toBeDefined();
    expect(mockCreate).toHaveBeenCalledWith('ND-01');
    expect(screen.getByText('"ND-01" is Starting. It will appear in Environments.')).toBeDefined();
    expect(onCreated).toHaveBeenCalledWith(makeWorkspace());
  });

  it('shows the backend failure message and returns to the form on Back', async () => {
    mockCreate.mockRejectedValue(new ApiClientError('Workspace name already exists', 400));
    render(<ProvisionWorkspaceForm onCreated={() => {}} />);
    fireEvent.change(screen.getByLabelText('Workspace name'), {
      target: { value: 'taken' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Provision Workspace' }));
    expect(await screen.findByText('Provisioning failed')).toBeDefined();
    expect(screen.getByText('Workspace name already exists')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Workspace name')).toBeDefined();
    expect((screen.getByLabelText('Workspace name') as HTMLInputElement).value).toBe('taken');
  });

  it('resets to an empty form on Provision another', async () => {
    mockCreate.mockResolvedValue(makeWorkspace());
    render(<ProvisionWorkspaceForm onCreated={() => {}} />);
    fireEvent.change(screen.getByLabelText('Workspace name'), {
      target: { value: 'ND-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Provision Workspace' }));
    expect(await screen.findByText('Workspace created')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Provision another' }));
    expect((screen.getByLabelText('Workspace name') as HTMLInputElement).value).toBe('');
  });

  it('renders Cancel only when onCancel is provided', () => {
    const { rerender } = render(<ProvisionWorkspaceForm onCreated={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    const onCancel = vi.fn();
    rerender(<ProvisionWorkspaceForm onCreated={() => {}} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
