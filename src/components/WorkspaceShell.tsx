import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  ChevronRight,
  Command,
  LayoutDashboard,
  Menu,
  Monitor,
  Terminal,
  X,
} from 'lucide-react';
import { useShell } from '../contexts/ShellContext';
import { Dashboard } from './Dashboard';
import { Workspace } from './Workspace';
import { AppLibrary } from './AppLibrary';
import { ApplicationMode } from './ApplicationMode';
import { CommandPalette } from './CommandPalette';
import { NotificationsPanel } from './NotificationsPanel';
import { AIAssistantPanel } from './AIAssistantPanel';
import { DiagnosticsDashboard } from './DiagnosticsDashboard';
import { FloatingWorkspaceBar } from './FloatingWorkspaceBar';
import { GlassButton, GlassSurface } from './Glass';

export function WorkspaceShell() {
  const {
    activeMode,
    activeVm,
    activeApp,
    setActiveMode,
    setActiveVm,
    setActiveApp,
    isCommandPaletteOpen,
    isNotificationsOpen,
    isAIAssistantOpen,
    addNotification,
  } = useShell();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      addNotification({
        title: 'Workspace Ready',
        message: 'Cloud107 control plane is ready.',
        type: 'success',
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [addNotification]);

  const handleCloseSession = () => {
    setActiveMode('dashboard');
    setActiveVm(null);
    setActiveApp(null);
  };

  const openMode = (mode: 'dashboard' | 'diagnostics') => {
    setActiveMode(mode);
    setActiveVm(null);
    setActiveApp(null);
    setMobileNavOpen(false);
  };

  const showControlPlaneShell = activeMode === 'dashboard' || activeMode === 'diagnostics';

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      {showControlPlaneShell && (
        <>
          <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-white/[0.06] bg-neutral-950/80 px-4 backdrop-blur-xl lg:hidden">
            <GlassButton
              size="sm"
              aria-label="Open navigation"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
              className="w-9 px-0"
            >
              <Menu size={17} />
            </GlassButton>
            <div className="ml-3 flex min-w-0 items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
              <span className="truncate text-sm font-medium">Cloud107</span>
              <span className="text-xs text-neutral-500">Control Plane</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500">
              <Activity size={12} className="text-emerald-400" />
              connected
            </div>
          </div>

          <AnimatePresence>
            {mobileNavOpen && (
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileNavOpen(false)}
              >
                <motion.aside
                  className="h-full w-[280px] border-r border-white/[0.08] bg-neutral-950/95 p-4 shadow-2xl"
                  initial={{ x: -24, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -24, opacity: 0 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <ShellNavigation activeMode={activeMode} onNavigate={openMode} onClose={() => setMobileNavOpen(false)} />
                </motion.aside>
              </motion.div>
            )}
          </AnimatePresence>

          <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-white/[0.06] bg-neutral-950/75 p-3 backdrop-blur-2xl lg:block">
            <ShellNavigation activeMode={activeMode} onNavigate={openMode} />
          </aside>
        </>
      )}

      <main className={showControlPlaneShell ? 'pt-14 lg:pl-60 lg:pt-0' : ''}>
        <AnimatePresence mode="wait">
          {activeMode === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-screen"
            >
              <Dashboard
                onLaunchDesktop={(vm) => {
                  setActiveVm(vm);
                  setActiveMode('desktop');
                }}
                onLaunchAppLibrary={(vm) => {
                  setActiveVm(vm);
                  setActiveMode('application');
                }}
              />
            </motion.div>
          )}

          {activeMode === 'desktop' && activeVm && (
            <motion.div
              key="desktop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="min-h-screen"
            >
              <Workspace
                vm={activeVm}
                onClose={handleCloseSession}
                onLaunchApps={() => setActiveMode('application')}
              />
            </motion.div>
          )}

          {activeMode === 'application' && activeVm && !activeApp && (
            <motion.div
              key="app-library"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-screen"
            >
              <AppLibrary
                vm={activeVm}
                onBack={() => {
                  setActiveMode('dashboard');
                  setActiveVm(null);
                }}
                onLaunchApp={(app) => setActiveApp(app)}
              />
            </motion.div>
          )}

          {activeMode === 'application' && activeVm && activeApp && (
            <motion.div
              key="app-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-screen"
            >
              <ApplicationMode
                vm={activeVm}
                app={activeApp}
                onClose={handleCloseSession}
                onBackToLibrary={() => setActiveApp(null)}
              />
            </motion.div>
          )}

          {activeMode === 'diagnostics' && (
            <motion.div
              key="diagnostics"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-screen"
            >
              <DiagnosticsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {(activeMode === 'desktop' || (activeMode === 'application' && activeApp)) && activeVm && (
        <FloatingWorkspaceBar vm={activeVm} />
      )}

      <AnimatePresence>
        {isCommandPaletteOpen && <CommandPalette />}
        {isNotificationsOpen && <NotificationsPanel />}
        {isAIAssistantOpen && <AIAssistantPanel />}
      </AnimatePresence>
    </div>
  );
}

function ShellNavigation({
  activeMode,
  onNavigate,
  onClose,
}: {
  activeMode: string;
  onNavigate: (mode: 'dashboard' | 'diagnostics') => void;
  onClose?: () => void;
}) {
  const items = [
    { mode: 'dashboard' as const, label: 'Overview', icon: LayoutDashboard },
    { mode: 'diagnostics' as const, label: 'Diagnostics', icon: Activity },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
            <Monitor size={17} className="text-neutral-200" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">Cloud107</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">Control Plane</div>
          </div>
        </div>
        {onClose && (
          <GlassButton size="sm" aria-label="Close navigation" onClick={onClose} className="w-8 px-0">
            <X size={15} />
          </GlassButton>
        )}
      </div>

      <div className="mt-7 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-600">
        Workspace
      </div>

      <nav className="mt-2 space-y-1">
        {items.map(({ mode, label, icon: Icon }) => {
          const active = activeMode === mode;
          return (
            <button
              key={mode}
              onClick={() => onNavigate(mode)}
              className={[
                'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
                active
                  ? 'border-white/[0.08] bg-white/[0.06] text-white'
                  : 'border-transparent text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-200',
              ].join(' ')}
            >
              <Icon size={16} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-neutral-500" />}
            </button>
          );
        })}
      </nav>

      <GlassSurface className="mt-auto rounded-2xl p-3">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          Mesh connected
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-600">
          <Command size={11} />
          <span>Ctrl K command palette</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-600">
          <Terminal size={11} />
          <span>Terminal surface coming next</span>
        </div>
      </GlassSurface>
    </div>
  );
}
