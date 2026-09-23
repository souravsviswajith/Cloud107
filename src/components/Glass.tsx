import React from 'react';

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export function GlassSurface({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'bg-white/[0.025] backdrop-blur-xl border border-white/[0.08] shadow-[0_18px_60px_rgba(0,0,0,0.22)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-2xl',
        className,
      )}
    >
      {children}
    </div>
  );
}

type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export function GlassButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: GlassButtonProps) {
  const variants = {
    default:
      'bg-white/[0.05] hover:bg-white/[0.09] text-white border-white/[0.08]',
    primary:
      'bg-white text-black hover:bg-neutral-200 border-white/80 shadow-[0_8px_30px_rgba(255,255,255,0.08)]',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 border-rose-400/20',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    md: 'h-9 px-3.5 text-sm rounded-xl',
    lg: 'h-11 px-4 text-sm rounded-xl',
  };

  return (
    <button
      {...props}
      className={cx(
        'inline-flex items-center justify-center gap-2 border backdrop-blur-md transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

const stateStyles: Record<string, string> = {
  running: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  online: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  healthy: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  ready: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  warning: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  degraded: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  error: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  failed: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
  offline: 'bg-neutral-400/10 text-neutral-300 border-neutral-400/15',
  pending: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  starting: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  connecting: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
};

export function StateBadge({ state }: { state: string }) {
  const normalized = state.toLowerCase();
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium uppercase tracking-wider',
        stateStyles[normalized] ?? stateStyles.offline,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {state}
    </span>
  );
}

export function GlassTerminal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'bg-black/60 shadow-inner border border-white/[0.06] rounded-xl font-mono text-[11px] custom-scrollbar overflow-y-auto',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PanelMessage({
  title,
  message,
  className,
}: {
  title: string;
  message?: string;
  className?: string;
}) {
  return (
    <GlassPanel className={cx('p-8 text-center', className)}>
      <h3 className="text-sm font-medium text-white">{title}</h3>
      {message && <p className="mt-1 text-xs text-neutral-500">{message}</p>}
    </GlassPanel>
  );
}
