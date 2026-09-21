import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Monitor,
  Terminal,
  Settings,
  Folder,
  File,
  Code,
  LayoutDashboard,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import { useShell } from '../contexts/ShellContext';

export function CommandPalette() {
  const { setCommandPaletteOpen, setActiveMode, setActiveApp } = useShell();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setCommandPaletteOpen(false);
  };

  const ITEMS = [
    {
      type: 'action',
      title: 'Go to Dashboard',
      icon: LayoutDashboard,
      color: 'text-blue-400',
      action: () => {
        setActiveMode('dashboard');
        handleClose();
      },
    },
    {
      type: 'action',
      title: 'Switch to Desktop Mode',
      icon: Monitor,
      color: 'text-emerald-400',
      action: () => {
        setActiveMode('desktop');
        handleClose();
      },
    },
    {
      type: 'action',
      title: 'Open Application Library',
      icon: Terminal,
      color: 'text-purple-400',
      action: () => {
        setActiveMode('application');
        setActiveApp(null);
        handleClose();
      },
    },
    {
      type: 'action',
      title: 'Open Platform Diagnostics',
      icon: Settings,
      color: 'text-rose-400',
      action: () => {
        setActiveMode('diagnostics');
        handleClose();
      },
    },
    {
      type: 'action',
      title: 'Open Node Inspector',
      icon: LayoutDashboard,
      color: 'text-sky-400',
      action: () => {
        setActiveMode('nodes');
        handleClose();
      },
    },
    {
      type: 'action',
      title: 'Open Operations Stream',
      icon: Terminal,
      color: 'text-amber-400',
      action: () => {
        setActiveMode('operations');
        handleClose();
      },
    },

    { type: 'app', title: 'VS Code', icon: Code, color: 'text-blue-500' },
    { type: 'app', title: 'Browser', icon: Globe, color: 'text-emerald-500' },
    { type: 'app', title: 'File Explorer', icon: Folder, color: 'text-yellow-400' },

    { type: 'file', title: 'Project Proposal.docx', icon: File, color: 'text-blue-300' },
    { type: 'file', title: 'Q3 Financials.xlsx', icon: File, color: 'text-emerald-300' },
    { type: 'file', title: 'Design System.fig', icon: ImageIcon, color: 'text-purple-300' },

    { type: 'setting', title: 'Workspace Settings', icon: Settings, color: 'text-neutral-400' },
    { type: 'setting', title: 'Display Resolution', icon: Monitor, color: 'text-neutral-400' },
  ];

  const filteredItems = ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  );

  const actions = filteredItems.filter((i) => i.type === 'action');
  const apps = filteredItems.filter((i) => i.type === 'app');
  const files = filteredItems.filter((i) => i.type === 'file');
  const settings = filteredItems.filter((i) => i.type === 'setting');

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[70vh]"
      >
        <div className="flex items-center px-4 py-4 border-b border-white/10">
          <Search size={20} className="text-neutral-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for apps, files, settings, commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-lg text-white placeholder-neutral-500 focus:outline-none"
          />
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white/5 rounded text-xs text-neutral-400 font-mono border border-white/10">
              ESC
            </kbd>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {actions.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Quick Actions
              </div>
              {actions.map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-left text-neutral-200 transition-colors"
                >
                  <item.icon size={18} className={item.color} />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          )}

          {apps.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Applications
              </div>
              {apps.map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-left text-neutral-200 transition-colors"
                >
                  <item.icon size={18} className={item.color} />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Recent Files
              </div>
              {files.map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-left text-neutral-200 transition-colors"
                >
                  <item.icon size={18} className={item.color} />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          )}

          {settings.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Settings
              </div>
              {settings.map((item, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-left text-neutral-200 transition-colors"
                >
                  <item.icon size={18} className={item.color} />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="py-12 text-center text-neutral-500">No results found for "{query}"</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
