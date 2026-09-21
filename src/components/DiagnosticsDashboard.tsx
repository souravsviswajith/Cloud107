import React, { useState, useEffect } from 'react';

import { useShell } from '../contexts/ShellContext';
import { Activity, Server, RefreshCw, ArrowLeft, Zap } from 'lucide-react';
import { BenchmarkRunner } from './BenchmarkRunner';

interface ServiceHealth {
  name: string;
  status: string;
  ping: string;
}

interface HealthData {
  status: string;
  uptime: string;
  services: ServiceHealth[];
}

type MetricsData = Record<string, string | number>;

export function DiagnosticsDashboard() {
  const { setActiveMode } = useShell();
  const [activeTab, setActiveTab] = useState<'health' | 'metrics' | 'logs' | 'benchmark'>('health');

  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Mock fetching diagnostics
    const interval = setInterval(() => {
      setHealthData({
        status: 'healthy',
        uptime: '2d 4h 12m',
        services: [
          { name: 'Workspace Controller', status: 'healthy', ping: '12ms' },
          { name: 'Stream Broker', status: 'healthy', ping: '8ms' },
          { name: 'Agent Gateway', status: 'degraded', ping: '145ms' },
          { name: 'State Store', status: 'healthy', ping: '2ms' },
        ],
      });

      setMetricsData({
        activeSessions: 42,
        cpuUsage: '45%',
        memoryUsage: '12.4GB / 32GB',
        networkRx: '1.2 Gbps',
        networkTx: '4.5 Gbps',
        streamRetries: 12,
        agentRestarts: 3,
        avgFrameRate: '59.8 FPS',
        avgBitrate: '8.4 Mbps',
        avgLatency: '14 ms',
        droppedFrames: '0.02%',
      });

      setLogs((prev) =>
        [
          `[${new Date().toISOString()}] [INFO] [corr_id: ${Math.random().toString(36).substr(2, 8)}] Workspace stream heartbeat OK`,
          ...prev,
        ].slice(0, 50),
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-[#0f0f0f] text-gray-300 flex flex-col font-mono text-sm">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center px-6 justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveMode('dashboard')}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-semibold text-white tracking-wide">Platform Diagnostics</h1>
          </div>
        </div>

        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'health' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/5'}`}
          >
            Health
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'metrics' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/5'}`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'logs' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/5'}`}
          >
            Logs
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'benchmark' ? 'bg-white/10 text-white shadow-sm' : 'hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-2">
              <Zap size={14} className={activeTab === 'benchmark' ? 'text-blue-400' : ''} />
              Benchmark
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'health' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-white/50 mb-1 uppercase tracking-wider text-xs">
                    System Status
                  </div>
                  <div className="text-2xl font-light text-emerald-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    All Systems Operational
                  </div>
                </div>
                <Server className="w-8 h-8 text-white/20" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-white/50 mb-1 uppercase tracking-wider text-xs">Uptime</div>
                  <div className="text-2xl font-light text-white">{healthData?.uptime || '--'}</div>
                </div>
                <RefreshCw className="w-8 h-8 text-white/20" />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 bg-black/20 font-medium text-white">
                Service Status
              </div>
              <div className="divide-y divide-white/5">
                {healthData?.services?.map((service, i: number) => (
                  <div
                    key={i}
                    className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${service.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      />
                      <span className="text-white">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-white/40">{service.ping}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${service.status === 'healthy' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'}`}
                      >
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {metricsData &&
                Object.entries(metricsData).map(([key, value]) => (
                  <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="text-white/50 mb-2 uppercase tracking-wider text-xs">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xl text-white font-light">{String(value)}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex-1 bg-black border border-white/10 rounded-xl p-4 overflow-y-auto font-mono text-xs leading-relaxed">
              {logs.map((log, i) => (
                <div key={i} className="mb-1">
                  <span className="text-white/30">{log.substring(0, 26)}</span>
                  <span
                    className={
                      log.includes('[ERROR]')
                        ? 'text-rose-400'
                        : log.includes('[WARN]')
                          ? 'text-amber-400'
                          : 'text-blue-400'
                    }
                  >
                    {log.substring(26, 33)}
                  </span>
                  <span className="text-white/80">{log.substring(33)}</span>
                </div>
              ))}
              {logs.length === 0 && <div className="text-white/40 italic">Waiting for logs...</div>}
            </div>
          </div>
        )}

        {activeTab === 'benchmark' && <BenchmarkRunner />}
      </div>
    </div>
  );
}
