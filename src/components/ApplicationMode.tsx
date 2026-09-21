import { Application, VmInstance } from '../types';
import { motion } from 'motion/react';
import { AppWindow, Maximize, Minus, X } from 'lucide-react';
import { TerminalApp } from './launch/apps/TerminalApp';
import { NotesApp } from './launch/apps/NotesApp';
import { BrowserApp } from './launch/apps/BrowserApp';

interface ApplicationModeProps {
  vm: VmInstance;
  app: Application;
  onClose: () => void;
  onBackToLibrary: () => void;
}

export function ApplicationMode({ vm, app, onBackToLibrary }: ApplicationModeProps) {
  // Application Mode simulates running a single app seamlessly as if it was native.
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col font-sans relative z-50">
      {/* 
        The FloatingWorkspaceBar handles global navigation now, so we only need to render 
        the actual application window.
      */}

      <div className="flex-1 flex flex-col relative">
        {/* Mock Application Titlebar */}
        <div className="h-10 bg-[#111] border-b border-white/5 flex items-center justify-between px-4 select-none">
          <div className="flex items-center gap-3">
            <AppWindow size={16} className={app.color || 'text-neutral-400'} />
            <span className="text-sm font-medium text-neutral-300">{app.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 text-neutral-400 transition-colors">
              <Minus size={16} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-white/10 text-neutral-400 transition-colors">
              <Maximize size={14} />
            </button>
            <button
              onClick={onBackToLibrary}
              className="w-10 h-10 flex items-center justify-center hover:bg-red-500 hover:text-white text-neutral-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Actual Application Content */}
        <div className="flex-1 relative bg-black">
          {app.name === 'Terminal' ? (
            <TerminalApp />
          ) : app.name === 'Notes' ? (
            <NotesApp />
          ) : app.name === 'Browser' ? (
            <BrowserApp />
          ) : (
            <div className="flex-1 p-8 h-full relative flex flex-col items-center justify-center bg-[#1e1e1e]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center gap-6"
              >
                <div
                  className={`w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl ${app.color || 'text-white'}`}
                >
                  <AppWindow size={64} className="opacity-80" />
                </div>
                <div className="text-center">
                  <h1 className="text-3xl font-semibold mb-2">Streaming {app.name}</h1>
                  <p className="text-neutral-400 max-w-md mx-auto">
                    This application is running remotely on {vm.name} ({vm.vCPU} vCPUs, {vm.ram}{' '}
                    RAM) and streaming seamlessly to your browser.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
