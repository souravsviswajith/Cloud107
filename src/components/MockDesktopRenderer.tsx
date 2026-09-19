import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { 
  Folder, Globe, Code2, Terminal, Settings, 
  Minus, Square, X, Image as ImageIcon,
  Grid, Menu, 
} from 'lucide-react';
import { VmInstance } from '../types';
import { Dock } from './Dock';

interface MockDesktopRendererProps {
  vm: VmInstance;
}

interface AppDef {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

const APPS: AppDef[] = [
  { id: 'explorer', name: 'File Explorer', icon: Folder, color: 'text-yellow-400' },
  { id: 'edge', name: 'Browser', icon: Globe, color: 'text-blue-500' },
  { id: 'vscode', name: 'VS Code', icon: Code2, color: 'text-blue-400' },
  { id: 'terminal', name: 'Terminal', icon: Terminal, color: 'text-neutral-300' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'text-neutral-400' }
];

const WALLPAPERS = [
  "https://images.unsplash.com/photo-1617042375876-a13e36732a30?q=80&w=3840&auto=format&fit=crop", // Default Windows-y
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=3840&auto=format&fit=crop", // Abstract gradient
  "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=3840&auto=format&fit=crop", // Dark minimal
];

interface WindowState {
  id: string;
  appId: string;
  title: string;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}

function WindowComponent({ 
  win, app, activeWindowId, desktopRef, 
  focusWindow, toggleMinimize, toggleMaximize, closeWindow 
}: {
  win: WindowState, app: AppDef, activeWindowId: string | null, 
  desktopRef: React.RefObject<HTMLDivElement | null>,
  focusWindow: (id: string) => void, toggleMinimize: (id: string) => void, 
  toggleMaximize: (id: string) => void, closeWindow: (id: string) => void
}) {
  const dragControls = useDragControls();

  if (win.isMinimized) return null;

  return (
    <motion.div
      drag={!win.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={desktopRef}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.95, y: 50 }}
      animate={win.isMaximized ? { 
        opacity: 1, scale: 1, x: 0, y: 0, width: '100%', height: '100%' 
      } : { 
        opacity: 1, scale: 1, width: 800, height: 600, x: 50, y: 50 
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      style={{ zIndex: win.zIndex }}
      onMouseDown={() => focusWindow(win.id)}
      className={`absolute bg-neutral-900/95 backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden ${
        win.isMaximized ? 'rounded-none' : 'resize overflow-auto'
      } ${activeWindowId === win.id ? 'ring-1 ring-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'shadow-[0_0_30px_rgba(0,0,0,0.3)]'}`}
    >
      {/* Titlebar */}
      <div 
        className="window-titlebar h-12 flex items-center justify-between px-4 bg-transparent select-none cursor-move border-b border-white/5"
        onPointerDown={(e) => dragControls.start(e)}
        onDoubleClick={() => toggleMaximize(win.id)}
      >
        <div className="flex items-center gap-3 pointer-events-none">
          <div className={`p-1.5 rounded-lg bg-white/5 ${app.color}`}>
            <app.icon size={14} />
          </div>
          <span className="text-sm font-medium text-neutral-200">{win.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => { e.stopPropagation(); toggleMinimize(win.id); }} 
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-neutral-400 transition-colors"
          >
            <Minus size={14} />
          </button>
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id); }} 
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 text-neutral-400 transition-colors"
          >
            <Square size={12} />
          </button>
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} 
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-rose-500 hover:text-white text-neutral-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="flex-1 bg-neutral-900 p-6 text-white overflow-auto relative">
        <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-4">
          <div className={`p-8 rounded-full bg-white/5 ${app.color}`}>
            <app.icon size={64} className="opacity-50" />
          </div>
          <h2 className="text-xl font-medium text-neutral-300">Welcome to {win.title}</h2>
          <p className="text-sm max-w-md text-center">
            This is a simulated application window running inside the Cloud 107 environment. 
            In a real environment, this would stream the native application pixel-perfectly.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function MockDesktopRenderer({ vm }: MockDesktopRendererProps) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const [wallpaperIdx, setWallpaperIdx] = useState(0);
  
  const desktopRef = useRef<HTMLDivElement>(null);

  const openApp = (appId: string) => {
    const app = APPS.find(a => a.id === appId);
    if (!app) return;

    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        toggleMinimize(existingWindow.id);
      }
      focusWindow(existingWindow.id);
      return;
    }

    const newWindow: WindowState = {
      id: `win-${Date.now()}`,
      appId,
      title: app.name,
      isMaximized: false,
      isMinimized: false,
      zIndex: windows.length + 1,
    };
    
    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const toggleMaximize = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const toggleMinimize = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  };

  const focusWindow = (id: string) => {
    const maxZ = Math.max(0, ...windows.map(w => w.zIndex));
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    setActiveWindowId(id);
  };

  const handleDesktopClick = () => {
    setContextMenu(null);
    setActiveWindowId(null);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.target === desktopRef.current) {
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const cycleWallpaper = () => {
    setWallpaperIdx((prev) => (prev + 1) % WALLPAPERS.length);
    setContextMenu(null);
  };

  return (
    <div 
      ref={desktopRef}
      className="flex-1 relative overflow-hidden bg-neutral-900"
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Animated Wallpaper Layer */}
      <AnimatePresence initial={false}>
        <motion.div
          key={wallpaperIdx}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${WALLPAPERS[wallpaperIdx]}')` }}
        />
      </AnimatePresence>

      {/* Desktop Widgets / Folders */}
      <div className="absolute top-20 right-8 flex flex-col gap-6 z-0 pointer-events-none">
        <div className="w-64 h-40 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 p-4 shadow-xl pointer-events-auto">
          <div className="text-white/80 font-medium mb-1">Workspace Status</div>
          <div className="text-3xl font-light text-white mb-4">Healthy</div>
          <div className="flex justify-between text-xs text-white/60">
            <span>VM: {vm.name}</span>
            <span>Uptime: 4h 12m</span>
          </div>
        </div>
      </div>

      <div className="absolute top-20 left-4 flex flex-col gap-4 z-0">
        <div 
          className="flex flex-col items-center gap-1 w-20 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
          onDoubleClick={() => openApp('explorer')}
        >
          <Folder size={36} className="text-blue-400 drop-shadow-md group-hover:scale-105 transition-transform" />
          <span className="text-white text-xs font-medium text-center drop-shadow-md truncate w-full select-none bg-black/20 px-1 rounded">Projects</span>
        </div>
      </div>

      {/* Windows */}
      {windows.map(win => {
        const app = APPS.find(a => a.id === win.appId)!;
        return (
          <WindowComponent
            key={win.id}
            win={win}
            app={app}
            activeWindowId={activeWindowId}
            desktopRef={desktopRef}
            focusWindow={focusWindow}
            toggleMinimize={toggleMinimize}
            toggleMaximize={toggleMaximize}
            closeWindow={closeWindow}
          />
        );
      })}

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute bg-neutral-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 min-w-[220px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setContextMenu(null)} className="w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors">
              <Grid size={16} className="text-neutral-400" /> View Options
            </button>
            <button onClick={() => setContextMenu(null)} className="w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors">
              <Menu size={16} className="text-neutral-400" /> Sort by
            </button>
            <div className="h-px bg-white/10 my-1.5 mx-2" />
            <button onClick={cycleWallpaper} className="w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors">
              <ImageIcon size={16} className="text-neutral-400" /> Next Background
            </button>
            <button onClick={() => setContextMenu(null)} className="w-full text-left px-4 py-2 text-sm text-neutral-200 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors">
              <Settings size={16} className="text-neutral-400" /> Personalize Desktop
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mac-style Dock */}
      <Dock 
        apps={APPS} 
        windows={windows} 
        activeWindowId={activeWindowId} 
        onOpenApp={openApp} 
      />
    </div>
  );
}
