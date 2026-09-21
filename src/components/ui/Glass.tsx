import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Cloud107 Liquid Glass material language.
 *
 * Three elevations give the interface spatial hierarchy instead of applying
 * `backdrop-blur` uniformly:
 *
 * - Elevation 1 — primary information:    bg-black/40, backdrop-blur-md, border-white/10
 * - Elevation 2 — interactive controls:   bg-white/10, backdrop-blur-xl, border-white/20, shadow-2xl
 * - Elevation 3 — technical diagnostics:  bg-black/60, shadow-inner, font-mono
 *
 * (Elevation 0 is the page / spatial background owned by each surface.)
 */

export type Tone = 'emerald' | 'amber' | 'rose' | 'sky' | 'zinc';

const DOT_CLASSES: Record<Tone, string> = {
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
  sky: 'bg-sky-400',
  zinc: 'bg-zinc-500',
};

const TEXT_CLASSES: Record<Tone, string> = {
  emerald: 'text-emerald-300',
  amber: 'text-amber-300',
  rose: 'text-rose-300',
  sky: 'text-sky-300',
  zinc: 'text-zinc-300',
};

/**
 * State indicator. Visual state is NEVER the only representation: the dot is
 * always paired with a human-readable label.
 */
export function StateBadge({
  tone,
  label,
  pulse = false,
}: {
  tone: Tone;
  label: string;
  pulse?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        data-testid="state-dot"
        className={`h-2 w-2 shrink-0 rounded-full ${DOT_CLASSES[tone]} ${pulse ? 'animate-pulse' : ''}`}
      />
      <span className={`text-sm font-medium ${TEXT_CLASSES[tone]}`}>{label}</span>
    </span>
  );
}

/** Elevation 1 — primary information panel with a titled header. */
export function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
      <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className="px-5 py-3">{children}</div>
    </section>
  );
}

/** Label/value row for Elevation 1 panels. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 pt-0.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <span className="min-w-0 text-right text-sm text-neutral-100">{children}</span>
    </div>
  );
}

type ButtonVariant = 'default' | 'danger' | 'ghost';

/** Elevation 2 — interactive control. */
export function GlassButton({
  variant = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium backdrop-blur-xl transition-all disabled:cursor-not-allowed disabled:opacity-40';
  const variants: Record<ButtonVariant, string> = {
    default: 'border-white/20 bg-white/10 text-white shadow-2xl hover:bg-white/15',
    danger:
      'border-rose-400/30 bg-rose-500/10 text-rose-200 shadow-2xl hover:bg-rose-500/20 disabled:hover:bg-rose-500/10',
    ghost: 'border-transparent text-neutral-300 hover:bg-white/10 hover:text-white',
  };
  return <button {...props} className={`${base} ${variants[variant]} ${props.className ?? ''}`} />;
}

/** Elevation 3 — technical diagnostics block. Renders real data only. */
export function GlassTerminal({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-black/60 shadow-inner">
      {title ? (
        <div className="border-b border-white/5 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
          {title}
        </div>
      ) : null}
      <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed text-neutral-300">
        {children}
      </pre>
    </div>
  );
}

/** Loading / empty / error projection for panels. Always text-first. */
export function PanelMessage({
  tone = 'zinc',
  title,
  message,
  action,
  spinning = false,
}: {
  tone?: Tone;
  title: string;
  message?: string;
  action?: ReactNode;
  spinning?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      {spinning ? (
        <Loader2 size={20} className="animate-spin text-neutral-400" aria-hidden="true" />
      ) : (
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${DOT_CLASSES[tone]}`} />
      )}
      <p className={`text-sm font-medium ${TEXT_CLASSES[tone]}`}>{title}</p>
      {message ? <p className="max-w-md text-xs text-neutral-400">{message}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
