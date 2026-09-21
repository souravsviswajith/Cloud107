import { useState } from 'react';
import { ApiClientError, workspaceApi } from '../../lib/apiClient';
import type { Workspace } from '../../types';
import { GlassButton, PanelMessage, SectionCard } from '../ui/Glass';

const MAX_NAME_LENGTH = 100;

type Phase = 'idle' | 'submitting' | 'created' | 'error';

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
 * Layer 1 provisioning surface. Backs the verified REST contract only:
 * POST /api/v1/workspaces with `{ name }` (1-100 chars) -> 201 Workspace.
 * There are deliberately no CPU/RAM/disk/OS/provider fields: the public
 * endpoint does not accept them. States are Idle -> Submitting -> Created
 * (or Error); the returned backend `state` is displayed verbatim and no
 * progress percentage is ever synthesized.
 */
export function ProvisionWorkspaceForm({
  onCreated,
  onCancel,
}: {
  onCreated: (workspace: Workspace) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<Workspace | null>(null);

  const reset = () => {
    setName('');
    setPhase('idle');
    setValidationError(null);
    setSubmitError(null);
    setCreated(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setValidationError('Workspace name is required.');
      return;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setValidationError(`Workspace name must be ${MAX_NAME_LENGTH} characters or fewer.`);
      return;
    }
    setValidationError(null);
    setSubmitError(null);
    setPhase('submitting');
    try {
      const workspace = await workspaceApi.createWorkspace(trimmed);
      setCreated(workspace);
      setPhase('created');
      onCreated(workspace);
    } catch (error: unknown) {
      setSubmitError(errorText(error));
      setPhase('error');
    }
  };

  return (
    <SectionCard
      title="Provision Workspace"
      subtitle="Create a new workspace on the control plane."
    >
      {phase === 'created' && created ? (
        <PanelMessage
          tone="emerald"
          title="Workspace created"
          message={`"${created.name}" is ${created.state}. It will appear in Environments.`}
          action={
            <GlassButton size="sm" onClick={reset}>
              Provision another
            </GlassButton>
          }
        />
      ) : phase === 'error' ? (
        <PanelMessage
          tone="rose"
          title="Provisioning failed"
          message={submitError ?? 'The control plane rejected the request.'}
          action={
            <GlassButton size="sm" onClick={() => setPhase('idle')}>
              Back
            </GlassButton>
          }
        />
      ) : (
        <form onSubmit={(event) => void submit(event)} className="py-2">
          <label
            htmlFor="provision-workspace-name"
            className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-neutral-500"
          >
            Workspace name
          </label>
          {/* No Glass input primitive exists; field follows the E1 surface recipe. */}
          <input
            id="provision-workspace-name"
            type="text"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            placeholder="My Workspace"
            autoComplete="off"
            disabled={phase === 'submitting'}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none backdrop-blur-md placeholder:text-neutral-500 focus:border-white/25 disabled:opacity-50"
          />
          {validationError ? (
            <p role="alert" className="mt-1.5 text-xs text-rose-300">
              {validationError}
            </p>
          ) : null}
          <div className="mt-4 flex items-center gap-2">
            <GlassButton type="submit" disabled={phase === 'submitting'}>
              {phase === 'submitting' ? 'Provisioning…' : 'Provision Workspace'}
            </GlassButton>
            {onCancel ? (
              <GlassButton variant="ghost" onClick={onCancel} disabled={phase === 'submitting'}>
                Cancel
              </GlassButton>
            ) : null}
          </div>
        </form>
      )}
    </SectionCard>
  );
}
