import React from 'react';
import { motion } from 'motion/react';
import { Activity, SignalHigh, Cpu, MemoryStick, X } from 'lucide-react';
import { VmInstance } from '../types';

interface PerformanceOverlayProps {
  vm: VmInstance;
  onClose: () => void;
}

export function PerformanceOverlay({ vm, onClose }: PerformanceOverlayProps) {
  return (
    <div className="fixed inset-0 z-[120] pointer-events-none flex justify-center pt-20">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-[600px] bg-neutral-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-6 pointer-events-auto flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Activity className="text-blue-400" size={20} />
            Performance & Diagnostics
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <SignalHigh size={16} />
              <span className="text-sm">Network Latency</span>
            </div>
            <div className="text-3xl font-light text-emerald-400">
              12<span className="text-sm text-emerald-500/50 ml-1">ms</span>
            </div>
            <div className="mt-2 text-xs text-neutral-500">Jitter: 1.2ms | Packet Loss: 0%</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
            <div className="flex items-center gap-2 text-neutral-400 mb-2">
              <Activity size={16} />
              <span className="text-sm">Stream Quality</span>
            </div>
            <div className="text-3xl font-light text-blue-400">
              60<span className="text-sm text-blue-500/50 ml-1">fps</span>
            </div>
            <div className="mt-2 text-xs text-neutral-500">Bitrate: 15 Mbps | AV1 Codec</div>
          </div>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-6">
          <h4 className="text-sm font-medium text-neutral-300">VM Hardware ({vm.name})</h4>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Cpu size={14} />
                <span className="text-xs">CPU Usage</span>
              </div>
              <div className="text-lg text-white">24%</div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-indigo-400 w-1/4 rounded-full" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Activity size={14} />
                <span className="text-xs">GPU Usage</span>
              </div>
              <div className="text-lg text-white">45%</div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-purple-400 w-[45%] rounded-full" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <MemoryStick size={14} />
                <span className="text-xs">Memory</span>
              </div>
              <div className="text-lg text-white">
                12 GB <span className="text-xs text-neutral-500">/ {vm.ram}</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-blue-400 w-[60%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
