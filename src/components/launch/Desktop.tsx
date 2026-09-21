import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder,
  Globe,
  FileText,
  Terminal,
  Settings,
  Wifi,
  Battery,
  Volume2,
  Activity,
  Gauge,
  Monitor,
  Network,
  WifiOff,
  Cpu,
} from 'lucide-react';
import { Window } from './window/Window';
import { NotesApp } from './apps/NotesApp';
import { TerminalApp } from './apps/TerminalApp';
import { BrowserApp } from './apps/BrowserApp';
import type { VmInstance } from '../../types';

type AppId = 'notes' | 'terminal' | 'browser' | 'files' | 'settings';

const APP_REGISTRY = {
  notes: {
    id: 'notes' as AppId,
    title: 'Notes',
    icon: <FileText size={16} className="text-amber-400" />,
    component: <NotesApp />,
    defaultPosition: { x: 50, y: 50 },
    defaultSize: { width: 600, height: 450 },
  },
  terminal: {
    id: 'terminal' as AppId,
    title: 'Terminal',
    icon: <Terminal size={16} className="text-purple-400" />,
    component: <TerminalApp />,
    defaultPosition: { x: 100, y: 100 },
    defaultSize: { width: 650, height: 400 },
  },
  browser: {
    id: 'browser' as AppId,
    title: 'Browser',
    icon: <Globe size={16} className="text-emerald-400" />,
    component: <BrowserApp />,
    defaultPosition: { x: 150, y: 150 },
    defaultSize: { width: 800, height: 500 },
  },
};

interface DesktopProps {
  vm?: VmInstance;
}

export function Desktop({ vm }: DesktopProps) {
  const [time, setTime] = useState(new Date());
  const [cpu, setCpu] = useState(14);
  const [memory, setMemory] = useState(2.4);
  const [showNotification, setShowNotification] = useState(false);
  const [showWebRTCOverlay, setShowWebRTCOverlay] = useState(false);
  const [qualityProfile, setQualityProfile] = useState<'performance' | 'balanced' | 'quality'>(
    'balanced',
  );
  const [metrics, setMetrics] = useState({
    fps: 60,
    bitrate: 8.5,
    latency: 12,
    resolution: { width: 1920, height: 1080 },
    packetLoss: 0.01,
    codec: 'H.264 (NVENC)',
  });
  const [windowOrder, setWindowOrder] = useState<AppId[]>(['notes']);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const statTimer = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        fps: qualityProfile === 'performance' ? 60 : qualityProfile === 'quality' ? 30 : 60,
        latency: prev.latency + (Math.random() * 2 - 1),
        bitrate: 8.5 + Math.random() * 0.5,
      }));
      setCpu((prev) => Math.max(5, Math.min(95, prev + (Math.random() * 10 - 5))));
      setMemory((prev) => Math.max(1.0, Math.min(16.0, prev + (Math.random() * 0.2 - 0.1))));
    }, 2000);
    return () => clearInterval(statTimer);
  }, []);

  useEffect(() => {
    const notifTimer = setTimeout(() => {
      setShowNotification(true);
    }, 1000);

    const dismissTimer = setTimeout(() => {
      setShowNotification(false);
    }, 4000);

    return () => {
      clearTimeout(notifTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const openApp = (id: AppId) => {
    if (!windowOrder.includes(id)) {
      setWindowOrder((prev) => [...prev, id]);
    } else {
      focusApp(id);
    }
  };

  const focusApp = (id: AppId) => {
    setWindowOrder((prev) => {
      if (!prev.includes(id)) return prev;
      const filtered = prev.filter((w) => w !== id);
      return [...filtered, id];
    });
  };

  const closeApp = (id: AppId) => {
    setWindowOrder((prev) => prev.filter((w) => w !== id));
  };

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString([], { weekday: 'short' });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-900 to-[#050505] bg-fixed flex flex-col font-sans relative selection:bg-blue-500/30 selection:text-white">
      {/* Top Bar */}
      <div className="h-7 bg-neutral-900 border-b border-white/5 flex items-center justify-between px-4 text-[12px] text-neutral-400 select-none z-[100] shadow-sm relative">
        <div className="flex items-center gap-4">
          <span className="font-medium text-neutral-200">Workspace{vm ? ` · ${vm.name}` : ''}</span>
          <span className="hover:text-neutral-200 cursor-default">File</span>
          <span className="hover:text-neutral-200 cursor-default">Edit</span>
          <span className="hover:text-neutral-200 cursor-default">View</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowWebRTCOverlay(!showWebRTCOverlay)}
            className="hover:text-white transition-colors"
          >
            <Activity size={14} className="text-neutral-300" />
          </button>
          <div className="flex items-center gap-3">
            <Wifi size={14} className="text-neutral-300" />
            <Volume2 size={14} className="text-neutral-300" />
            <Battery size={14} className="text-neutral-300" />
          </div>
          <span className="text-neutral-200 font-medium">
            {dateString} {timeString}
          </span>
        </div>
      </div>

      {/* Desktop Area */}
      <div className="flex-1 relative">
        {/* Desktop Icons */}
        <div className="absolute top-6 right-6 flex flex-col gap-6 z-0">
          {[
            { id: 'files' as AppId, icon: Folder, label: 'Files', disabled: true },
            { id: 'browser' as AppId, icon: Globe, label: 'Browser', disabled: false },
            { id: 'notes' as AppId, icon: FileText, label: 'Notes', disabled: false },
            { id: 'terminal' as AppId, icon: Terminal, label: 'Terminal', disabled: false },
            { id: 'settings' as AppId, icon: Settings, label: 'Settings', disabled: true },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 group cursor-default ${item.disabled ? 'opacity-50' : ''}`}
              onDoubleClick={() => !item.disabled && openApp(item.id)}
            >
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/10 relative">
                <item.icon size={28} className="text-neutral-200" />
                {item.disabled && (
                  <div className="absolute -top-10 bg-neutral-800 border border-white/10 text-neutral-200 text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Coming Soon
                  </div>
                )}
              </div>
              <span className="text-xs text-neutral-200 drop-shadow-md font-medium tracking-wide">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Status Panel (Bottom Right overlay before dock) */}
        <div className="absolute bottom-24 right-6 w-56 bg-neutral-900/80 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-2xl z-0 pointer-events-none">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Workspace</span>
              <span className="text-emerald-400 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Running
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">CPU</span>
              <span className="text-neutral-200 font-medium font-mono">{cpu.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Memory</span>
              <span className="text-neutral-200 font-medium font-mono">{memory.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400">Network</span>
              <span className="text-neutral-200 font-medium">Connected</span>
            </div>
          </div>
        </div>

        {/* WebRTC Developer Overlay */}
        <AnimatePresence>
          {showWebRTCOverlay && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-10 right-4 z-[200] w-72 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-2xl"
            >
              <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <span className="text-white font-medium flex items-center gap-2">
                  <Gauge size={14} className="text-blue-400" />
                  Developer Overlay
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="text-neutral-400 uppercase tracking-wider text-[10px]">
                    Quality Profile
                  </div>
                  <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                    {(['performance', 'balanced', 'quality'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setQualityProfile(p)}
                        className={`flex-1 py-1 px-2 rounded-md capitalize transition-colors ${qualityProfile === p ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Monitor size={12} /> Resolution
                    </span>
                    <span className="text-white font-medium">
                      {metrics.resolution.width}x{metrics.resolution.height}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Activity size={12} /> Framerate
                    </span>
                    <span
                      className={`font-medium ${metrics.fps < 45 ? 'text-amber-400' : 'text-emerald-400'}`}
                    >
                      {Math.round(metrics.fps)} FPS
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Network size={12} /> Bitrate
                    </span>
                    <span className="text-blue-400 font-medium">
                      {metrics.bitrate.toFixed(1)} Mbps
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Gauge size={12} /> Latency
                    </span>
                    <span
                      className={`font-medium ${metrics.latency > 30 ? 'text-amber-400' : 'text-emerald-400'}`}
                    >
                      {Math.round(metrics.latency)} ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <WifiOff size={12} /> Packet Loss
                    </span>
                    <span className="text-white font-medium">{metrics.packetLoss}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      <Cpu size={12} /> Codec
                    </span>
                    <span className="text-white font-medium">{metrics.codec}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Windows */}
        <AnimatePresence>
          {windowOrder.map((id, index) => {
            const app = APP_REGISTRY[id as keyof typeof APP_REGISTRY];
            if (!app) return null;
            const isActive = index === windowOrder.length - 1;
            const zIndex = 10 + index;

            return (
              <Window
                key={id}
                id={id}
                title={app.title}
                icon={app.icon}
                isActive={isActive}
                zIndex={zIndex}
                onClose={() => closeApp(id)}
                onFocus={() => focusApp(id)}
                defaultPosition={app.defaultPosition}
                defaultSize={app.defaultSize}
              >
                {app.component}
              </Window>
            );
          })}
        </AnimatePresence>

        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute top-10 right-6 w-80 bg-neutral-800 border border-white/10 rounded-xl p-4 shadow-2xl z-[150] flex gap-4 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Wifi size={16} className="text-blue-400" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-white">Workspace Ready</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Applications below are running remotely.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-16 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3 flex items-center gap-3 shadow-2xl z-[100]">
        {[
          {
            id: 'files' as AppId,
            icon: Folder,
            color: 'text-blue-400',
            label: 'Files',
            disabled: true,
          },
          {
            id: 'browser' as AppId,
            icon: Globe,
            color: 'text-emerald-400',
            label: 'Browser',
            disabled: false,
          },
          {
            id: 'notes' as AppId,
            icon: FileText,
            color: 'text-amber-400',
            label: 'Notes',
            disabled: false,
          },
          {
            id: 'terminal' as AppId,
            icon: Terminal,
            color: 'text-purple-400',
            label: 'Terminal',
            disabled: false,
          },
          {
            id: 'settings' as AppId,
            icon: Settings,
            color: 'text-neutral-400',
            label: 'Settings',
            disabled: true,
          },
        ].map((item, i) => {
          const isActive = windowOrder.includes(item.id);

          return (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl transition-colors flex items-center justify-center relative group ${item.disabled ? 'opacity-50 cursor-default' : 'hover:bg-white/10 cursor-pointer'}`}
              onClick={() => !item.disabled && openApp(item.id)}
            >
              <item.icon size={24} className={item.color} />
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-neutral-300" />
              )}
              {/* Tooltip */}
              <div className="absolute -top-12 bg-neutral-800 border border-white/10 text-neutral-200 text-xs font-medium px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                {item.disabled ? 'Coming Soon' : item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
