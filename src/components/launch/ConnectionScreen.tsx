import React from 'react';
import { motion } from 'motion/react';
import { Loader2, ShieldCheck, Activity, Globe } from 'lucide-react';

export function ConnectionScreen() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20"
        >
          <Loader2 size={32} className="text-blue-400 animate-spin" />
        </motion.div>

        <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Connecting...</h2>
        <p className="text-neutral-400 text-sm mb-12">Establishing secure session</p>

        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <Activity size={18} className="text-emerald-400" />
            <span className="text-xs text-neutral-400">Latency</span>
            <span className="text-sm font-medium text-neutral-200">21 ms</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <Globe size={18} className="text-blue-400" />
            <span className="text-xs text-neutral-400">Protocol</span>
            <span className="text-sm font-medium text-neutral-200">WebRTC</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <ShieldCheck size={18} className="text-purple-400" />
            <span className="text-xs text-neutral-400">Encryption</span>
            <span className="text-sm font-medium text-neutral-200">TLS</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
