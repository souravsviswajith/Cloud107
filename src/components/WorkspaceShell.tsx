import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useShell } from '../contexts/ShellContext';
import { Dashboard } from './Dashboard';
import { Workspace } from './Workspace';
import { AppLibrary } from './AppLibrary';
import { ApplicationMode } from './ApplicationMode';
import { CommandPalette } from './CommandPalette';
import { NotificationsPanel } from './NotificationsPanel';
import { AIAssistantPanel } from './AIAssistantPanel';
import { DiagnosticsView } from './diagnostics/DiagnosticsView';
import { NodesView } from './nodes/NodesView';
import { OperationsView } from './operations/OperationsView';
import { FloatingWorkspaceBar } from './FloatingWorkspaceBar';

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

  // Initial welcome notification
  useEffect(() => {
    setTimeout(() => {
      addNotification({
        title: 'Workspace Ready',
        message: 'Cloud107 control plane is ready.',
        type: 'success',
      });
    }, 1000);
  }, []);

  const handleCloseSession = () => {
    setActiveMode('dashboard');
    setActiveVm(null);
    setActiveApp(null);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">
      {/* Background/Base layer for transitions */}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeMode === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full min-h-screen"
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
            className="w-full h-full min-h-screen"
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
            className="w-full h-full min-h-screen"
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
            className="w-full h-full min-h-screen"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full min-h-screen"
          >
            <DiagnosticsView />
          </motion.div>
        )}
        {activeMode === 'nodes' && (
          <motion.div
            key="nodes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full min-h-screen"
          >
            <NodesView />
          </motion.div>
        )}
        {activeMode === 'operations' && (
          <motion.div
            key="operations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full min-h-screen"
          >
            <OperationsView />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays that persist across modes */}
      {(activeMode === 'desktop' || (activeMode === 'application' && activeApp)) && activeVm && (
        <FloatingWorkspaceBar vm={activeVm} />
      )}

      {/* Global Panels */}
      <AnimatePresence>
        {isCommandPaletteOpen && <CommandPalette />}
        {isNotificationsOpen && <NotificationsPanel />}
        {isAIAssistantOpen && <AIAssistantPanel />}
      </AnimatePresence>
    </div>
  );
}
