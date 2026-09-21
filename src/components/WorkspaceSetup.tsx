import React from 'react';
import { motion } from 'motion/react';
import { Server, ShieldCheck } from 'lucide-react';

export function WorkspaceSetup() {
  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white tracking-tight">Workspace Setup</h2>
        <p className="text-sm text-neutral-400 mt-0.5">
          Choose how this environment is attached to infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Remote / Self-Managed Node */}
        <motion.button
          whileHover={{ y: -2 }}
          className="group bg-[#111111] border border-white/10 hover:border-white/20 p-6 rounded-2xl transition-all shadow-sm text-left flex flex-col h-full relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Remote / Self-Managed Node</h3>
              <p className="text-xs text-blue-400 font-medium mt-0.5">
                Use infrastructure you control.
              </p>
            </div>
          </div>

          <p className="text-neutral-400 text-sm leading-relaxed flex-1 mb-6">
            Attach a remote node or provider-managed resource while retaining Cloud107 as the
            control surface. Configure the provider, node, network, and storage according to your
            policy.
          </p>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 font-medium uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
        </motion.button>

        {/* Integrated Environment */}
        <motion.button
          whileHover={{ y: -2 }}
          className="group bg-[#111111] border border-white/10 hover:border-white/20 p-6 rounded-2xl transition-all shadow-sm text-left flex flex-col h-full relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Server size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Integrated Environment</h3>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                Preconfigured execution environment.
              </p>
            </div>
          </div>

          <p className="text-neutral-400 text-sm leading-relaxed flex-1 mb-6">
            Provision a reproducible environment with its required runtime, applications, storage,
            and capabilities. Environment state remains visible to the control plane.
          </p>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
            <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300 font-medium uppercase tracking-wider">
              Coming Soon
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
