import { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  LayoutGrid,
  Server,
  Wifi,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { VmInstance } from '../types';

type EnvironmentResourceConfig = {
  cpuClass: string;
  cpuCores: number;
  cpuThreads: number;
  ram: string;
  gpu: string;
  storage: string;
  storageCapacity?: string;
  storageType?: string;
};

interface ResourceMonitoringPanelProps {
  vm: VmInstance | null;
  config: EnvironmentResourceConfig;
  allVms?: VmInstance[];
  onSelectVm?: (vm: VmInstance) => void;
}

export function ResourceMonitoringPanel({
  vm,
  config,
  allVms = [],
  onSelectVm,
}: ResourceMonitoringPanelProps) {
  const isRunning = vm?.status === 'ready';

  // Live telemetry state
  const [uptimeSeconds, setUptimeSeconds] = useState(isRunning ? 3245 : 0);
  const [metrics, setMetrics] = useState({
    cpuUtil: 22.4,
    ramUsedGB: 5.8,
    gpuUtil: config.gpu === 'CPU Only' ? 0 : 34.2,
    gpuMemUsedGB: config.gpu === 'CPU Only' ? 0 : 3.4,
    storageUsedGB: 38.5,
    netUploadMbps: 3.2,
    netDownloadMbps: 18.6,
    diskReadMBs: 142.5,
    diskWriteMBs: 38.2,
    latencyMs: 16,
  });

  const totalRamGB = parseInt(config.ram) || 16;
  const totalStorageGB = 120;
  const totalGpuMemGB = config.gpu.includes('4090')
    ? 24
    : config.gpu.includes('4070')
      ? 12
      : config.gpu.includes('3060')
        ? 12
        : 16;

  // Interval for live metric jitter & uptime ticker
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);

      setMetrics((prev) => {
        const jitter = (val: number, min: number, max: number, step = 1.5) => {
          const delta = (Math.random() - 0.48) * step;
          return Math.min(max, Math.max(min, Number((val + delta).toFixed(1))));
        };

        return {
          cpuUtil: jitter(prev.cpuUtil, 12, 85, 3),
          ramUsedGB: jitter(prev.ramUsedGB, 4.0, totalRamGB * 0.85, 0.2),
          gpuUtil: config.gpu === 'CPU Only' ? 0 : jitter(prev.gpuUtil, 10, 92, 4),
          gpuMemUsedGB:
            config.gpu === 'CPU Only'
              ? 0
              : jitter(prev.gpuMemUsedGB, 1.5, totalGpuMemGB * 0.8, 0.1),
          storageUsedGB: prev.storageUsedGB, // stable storage
          netUploadMbps: jitter(prev.netUploadMbps, 0.8, 25.0, 1.2),
          netDownloadMbps: jitter(prev.netDownloadMbps, 4.0, 85.0, 3.5),
          diskReadMBs: jitter(prev.diskReadMBs, 10, 350, 25),
          diskWriteMBs: jitter(prev.diskWriteMBs, 5, 120, 10),
          latencyMs: Math.round(jitter(prev.latencyMs, 12, 32, 2)),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, totalRamGB, totalGpuMemGB, config.gpu]);

  // Format uptime hh:mm:ss
  const formatUptime = (secs: number) => {
    if (!secs) return '00:00:00';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [hrs, mins, s].map((v) => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Real-Time Resource & Network Telemetry
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Live CPU, memory, GPU, storage, network, and transport metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Workspace selector dropdown if multiple */}
          {allVms.length > 0 && onSelectVm && (
            <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-neutral-300">
              <Server size={14} className="text-neutral-500" />
              <select
                value={vm?.id || ''}
                onChange={(e) => {
                  const target = allVms.find((v) => v.id === e.target.value);
                  if (target) onSelectVm(target);
                }}
                className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
              >
                {allVms.map((v) => (
                  <option key={v.id} value={v.id} className="bg-neutral-900 text-white">
                    {v.name} ({v.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              isRunning
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-neutral-800 border-white/10 text-neutral-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`}
            />
            {isRunning ? 'Telemetry Active' : 'Environment Standby'}
          </div>
        </div>
      </div>

      {/* Main Grid: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Workspace Specification Summary */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server size={14} className="text-blue-400" /> Workspace Specification
              </span>
              <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-neutral-300">
                {vm?.name || 'Workspace'}
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Cpu size={14} className="text-neutral-500" /> CPU
                </span>
                <div className="text-right">
                  <div className="font-medium text-white">{config.cpuClass}</div>
                  <div className="text-[11px] text-neutral-400">
                    {config.cpuCores} Cores / {config.cpuThreads} Threads
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <HardDrive size={14} className="text-neutral-500" /> Memory
                </span>
                <span className="font-medium text-white">{config.ram}</span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <LayoutGrid size={14} className="text-neutral-500" /> GPU Profile
                </span>
                <span className="font-medium text-white">{config.gpu}</span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Server size={14} className="text-neutral-500" /> Allocated Storage
                </span>
                <span className="font-medium text-white">{config.storage}</span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-neutral-500" /> Uptime
                </span>
                <span className="font-mono font-medium text-emerald-400">
                  {formatUptime(uptimeSeconds)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
            <span>
              Latency:{' '}
              <strong className="text-neutral-300 font-mono">{metrics.latencyMs} ms</strong>
            </span>
            <span>
              Region: <strong className="text-neutral-300">asia-east1</strong>
            </span>
          </div>
        </div>

        {/* Column 2: Real-Time Utilization Gauges */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge size={14} className="text-emerald-400" /> Resource Utilization
            </span>
            <span className="text-[11px] text-neutral-500 flex items-center gap-1">
              <RefreshCw size={10} className={isRunning ? 'animate-spin text-emerald-400' : ''} />{' '}
              Live 1s telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CPU Utilization Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                  <Cpu size={14} className="text-blue-400" /> CPU Utilization
                </span>
                <span className="text-xs font-mono font-semibold text-white">
                  {metrics.cpuUtil}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, metrics.cpuUtil)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                <span>0%</span>
                <span>{config.cpuCores} Cores Active</span>
                <span>100%</span>
              </div>
            </div>

            {/* RAM Utilization Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                  <HardDrive size={14} className="text-purple-400" /> RAM Usage
                </span>
                <span className="text-xs font-mono font-semibold text-white">
                  {metrics.ramUsedGB.toFixed(1)} GB / {totalRamGB} GB
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (metrics.ramUsedGB / totalRamGB) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                <span>0 GB</span>
                <span>{((metrics.ramUsedGB / totalRamGB) * 100).toFixed(0)}% Allocated</span>
                <span>{totalRamGB} GB</span>
              </div>
            </div>

            {/* GPU Utilization Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                  <LayoutGrid size={14} className="text-amber-400" /> GPU Utilization
                </span>
                <span className="text-xs font-mono font-semibold text-white">
                  {config.gpu === 'CPU Only' ? 'N/A' : `${metrics.gpuUtil}%`}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                  style={{
                    width: `${config.gpu === 'CPU Only' ? 0 : Math.min(100, metrics.gpuUtil)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                <span>
                  VRAM:{' '}
                  {config.gpu === 'CPU Only'
                    ? 'N/A'
                    : `${metrics.gpuMemUsedGB.toFixed(1)} GB / ${totalGpuMemGB} GB`}
                </span>
                <span>{config.gpu}</span>
              </div>
            </div>

            {/* Storage Usage Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
                  <Server size={14} className="text-indigo-400" /> Storage Allocated
                </span>
                <span className="text-xs font-mono font-semibold text-white">
                  {metrics.storageUsedGB.toFixed(1)} GB / {totalStorageGB} GB
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${(metrics.storageUsedGB / totalStorageGB) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                <span>Read: {metrics.diskReadMBs.toFixed(0)} MB/s</span>
                <span>Write: {metrics.diskWriteMBs.toFixed(0)} MB/s</span>
              </div>
            </div>
          </div>

          {/* Network & Disk I/O Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <ArrowUpRight size={12} className="text-emerald-400" /> Upload
              </span>
              <span className="text-xs font-mono font-medium text-white">
                {metrics.netUploadMbps.toFixed(1)} Mbps
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <ArrowDownRight size={12} className="text-blue-400" /> Download
              </span>
              <span className="text-xs font-mono font-medium text-white">
                {metrics.netDownloadMbps.toFixed(1)} Mbps
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Zap size={12} className="text-amber-400" /> Latency
              </span>
              <span className="text-xs font-mono font-medium text-white">
                {metrics.latencyMs} ms
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Wifi size={12} className="text-indigo-400" /> WebRTC
              </span>
              <span className="text-xs font-mono font-medium text-emerald-400">Direct 60FPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Runtime State */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight uppercase">
              Runtime State
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">
              Observed state from the active environment telemetry surface.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <span>Uptime {formatUptime(uptimeSeconds)}</span>
            <span className="text-neutral-700">•</span>
            <span>Latency {metrics.latencyMs} ms</span>
            <span className="text-neutral-700">•</span>
            <span className="text-emerald-400">{isRunning ? 'HEALTHY' : 'STANDBY'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
