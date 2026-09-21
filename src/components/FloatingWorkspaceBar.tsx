import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Monitor,
  SignalHigh,
  Activity,
  Settings,
  LayoutDashboard,
  AppWindow,
  Maximize,
  Search,
  Sparkles,
} from 'lucide-react';
import { VmInstance } from '../types';
import { useShell } from '../contexts/ShellContext';
import { PerformanceOverlay } from './PerformanceOverlay';

interface FloatingWorkspaceBarProps {
  vm: VmInstance;
}

export function FloatingWorkspaceBar({ vm }: FloatingWorkspaceBarProps) {
  const {
    setActiveMode,
    setActiveApp,
    setActiveVm,
    setCommandPaletteOpen,
    setAIAssistantOpen,
    activeMode,
  } = useShell();

  const [isHovered, setIsHovered] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [latency, setLatency] = useState(12);
  const [fps, setFps] = useState(60);

  // Simulate metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(12 + Math.floor(Math.random() * 5));
      setFps(59 + Math.floor(Math.random() * 2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] h-14 w-[800px] flex items-start justify-center pt-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: isHovered ? 0 : -32, opacity: isHovered ? 1 : 0.4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-4 py-2 flex items-center justify-between w-full mx-4 overflow-hidden"
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveMode('dashboard');
                setActiveVm(null);
              }}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 ${activeMode === 'dashboard' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
              title="Dashboard"
            >
              <LayoutDashboard size={16} />
            </button>
            <button
              onClick={() => {
                setActiveMode('desktop');
                setActiveApp(null);
              }}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 ${activeMode === 'desktop' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
              title="Desktop"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => {
                setActiveMode('application');
                setActiveApp(null);
              }}
              className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 ${activeMode === 'application' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
              title="Applications"
            >
              <AppWindow size={16} />
            </button>

            <div className="h-4 w-px bg-white/10 mx-2" />

            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-xs font-medium text-neutral-200">Windows 11 Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <Search size={14} />
              <span className="text-xs">Search</span>
              <div className="flex items-center gap-0.5 ml-2 hidden sm:flex">
                <kbd className="bg-black/30 px-1 rounded text-[10px] font-mono text-neutral-500">
                  Ctrl
                </kbd>
                <kbd className="bg-black/30 px-1 rounded text-[10px] font-mono text-neutral-500">
                  K
                </kbd>
              </div>
            </button>

            <button
              onClick={() => setAIAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
            >
              <Sparkles size={14} />
              <span className="text-xs font-medium">AI</span>
            </button>

            <div
              className="hidden lg:flex items-center gap-3 text-xs font-medium text-neutral-400 ml-1 cursor-pointer hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              onClick={() => setShowPerformance(true)}
              title="View Performance Diagnostics"
            >
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md">
                <SignalHigh size={12} />
                <span>{latency}ms</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md">
                <Activity size={12} />
                <span>{fps} FPS</span>
              </div>
            </div>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <div className="flex items-center gap-1">
              <button
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              <button
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Fullscreen"
              >
                <Maximize size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Invisible hover zone below the bar to keep it expanded */}
        <div className="absolute top-14 left-0 w-full h-8" />
      </div>

      <AnimatePresence>
        {showPerformance && (
          <PerformanceOverlay vm={vm} onClose={() => setShowPerformance(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
