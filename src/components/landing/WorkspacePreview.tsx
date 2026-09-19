import React from 'react';
import { motion } from 'motion/react';
import { Folder, Globe, FileText, Terminal, Settings, Wifi, Battery, Volume2, X, Minus, Square } from 'lucide-react';
import { Container } from '../common/Container';

export function WorkspacePreview() {
  return (
    <section className="py-12 md:py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-[#111111] shadow-[0_0_100px_rgba(59,130,246,0.15)] max-w-6xl mx-auto ring-1 ring-white/5"
        >
          {/* Top Bar */}
          <div className="h-7 bg-neutral-900 border-b border-white/5 flex items-center justify-between px-4 text-[11px] text-neutral-400 select-none">
            <div className="flex items-center gap-4">
              <span className="font-medium text-neutral-300">Cloud 107 Environment</span>
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Wifi size={12} />
                <Volume2 size={12} />
                <Battery size={12} />
              </div>
              <span>Mon 10:42 AM</span>
            </div>
          </div>

          {/* Desktop Area */}
          <div className="relative h-[400px] md:h-[600px] bg-gradient-to-br from-neutral-900 to-[#050505] overflow-hidden p-6">
            
            {/* Desktop Icons */}
            <div className="absolute top-6 right-6 flex flex-col gap-6">
              {[
                { icon: Folder, label: 'Files' },
                { icon: Globe, label: 'Browser' },
                { icon: FileText, label: 'Notes' },
                { icon: Terminal, label: 'Terminal' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 group cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/10">
                    <item.icon size={24} className="text-neutral-300" />
                  </div>
                  <span className="text-[11px] text-neutral-300 drop-shadow-md font-medium tracking-wide">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Open Notes Window */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[500px] bg-neutral-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col">
              <div className="h-10 border-b border-white/5 bg-neutral-800/50 flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-400" />
                  <span className="text-xs font-medium text-neutral-300">Welcome Notes</span>
                </div>
                <div className="flex items-center gap-3 text-neutral-500">
                  <Minus size={14} className="hover:text-neutral-300 transition-colors" />
                  <Square size={12} className="hover:text-neutral-300 transition-colors" />
                  <X size={14} className="hover:text-red-400 transition-colors" />
                </div>
              </div>
              <div className="p-6 text-sm text-neutral-300 space-y-4 leading-relaxed font-sans">
                <p className="text-lg font-semibold text-white">Welcome 👋</p>
                <p>This workspace is running entirely inside your browser.</p>
                <ul className="space-y-2 text-neutral-400 list-disc list-inside ml-1">
                  <li>Launch applications</li>
                  <li>Manage files</li>
                  <li>Open terminals</li>
                  <li>Build anywhere</li>
                </ul>
                <p className="pt-2 text-neutral-500 italic">Ready to explore.</p>
              </div>
            </div>

            {/* Real-Time Monitoring Panel (Bottom Right overlay before dock) */}
            <div className="absolute bottom-24 right-6 w-64 bg-neutral-900/90 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-xl hidden sm:block">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white tracking-wider uppercase">Live Telemetry</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">CPU (8 Cores)</span>
                  <span className="text-emerald-400 font-mono font-medium">22%</span>
                </div>
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-emerald-500 w-[22%]" />
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Memory (32 GB)</span>
                  <span className="text-blue-400 font-mono font-medium">12.4 GB</span>
                </div>
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-blue-500 w-[40%]" />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">GPU (RTX 4070)</span>
                  <span className="text-amber-400 font-mono font-medium">34%</span>
                </div>
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-amber-500 w-[34%]" />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Storage (120GB)</span>
                  <span className="text-indigo-400 font-mono font-medium">38.5 GB</span>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                  <span className="text-neutral-500">Latency</span>
                  <span className="text-neutral-300 font-mono">16 ms</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Uptime</span>
                  <span className="text-neutral-300 font-mono">00:54:05</span>
                </div>
              </div>
            </div>

            {/* Runtime State Panel (Top Right overlay) */}
            <div className="absolute top-24 right-6 w-64 bg-neutral-900/90 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-xl hidden md:block">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <span className="text-xs font-semibold text-white tracking-wider uppercase">Runtime State</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="text-[10px] text-neutral-500 mb-0.5">Node</div>
                    <div className="text-xs font-medium text-white">Ready</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="text-[10px] text-neutral-500 mb-0.5">Runtime</div>
                    <div className="text-xs font-medium text-white">Windows</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-neutral-500">CPU</span><span className="text-neutral-300 font-mono">22%</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Memory</span><span className="text-neutral-300 font-mono">12.4 / 32 GB</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">GPU</span><span className="text-neutral-300 font-mono">34%</span></div>
                  <div className="flex justify-between"><span className="text-neutral-500">Network</span><span className="text-neutral-300 font-mono">18.6 Mbps</span></div>
                  <div className="flex justify-between pt-2 border-t border-white/5"><span className="text-neutral-500">Health</span><span className="text-emerald-400 font-mono">HEALTHY</span></div>
                </div>
              </div>
            </div>

            {/* Dock */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-16 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3 flex items-center gap-2 shadow-2xl">
              {[
                { icon: Folder, color: 'text-blue-400', label: 'Files' },
                { icon: Globe, color: 'text-emerald-400', label: 'Browser' },
                { icon: FileText, color: 'text-amber-400', label: 'Notes', active: true },
                { icon: Terminal, color: 'text-purple-400', label: 'Terminal' },
                { icon: Settings, color: 'text-neutral-400', label: 'Settings' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center relative group cursor-default"
                >
                  <item.icon size={22} className={item.color} />
                  {item.active && (
                    <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-neutral-400" />
                  )}
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-neutral-800 border border-white/10 text-neutral-200 text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
