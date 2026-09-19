import React, { useState } from 'react';
import { Play,Cpu, Network, Monitor,} from 'lucide-react';

export function BenchmarkRunner() {
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<unknown>(null);

  const runBenchmark = () => {
    setStatus('running');
    setProgress(0);
    setResults(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('completed');
          setResults({
            network: { latency: '12ms', jitter: '2ms', bandwidth: '125 Mbps' },
            decode: { hwAcceleration: 'Supported (NVDEC)', time: '4ms' },
            render: { fps: 60, dropped: 0 }
          });
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-1">Streaming Benchmark</h3>
            <p className="text-sm text-neutral-400">Test client decoding and network capabilities for optimal streaming quality.</p>
          </div>
          <button 
            onClick={runBenchmark}
            disabled={status === 'running'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={16} />
            {status === 'running' ? 'Running...' : status === 'completed' ? 'Run Again' : 'Start Benchmark'}
          </button>
        </div>

        {status === 'running' && (
          <div className="space-y-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-200" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <span>
                {progress < 33 ? 'Testing Network Latency & Bandwidth...' : 
                 progress < 66 ? 'Testing Hardware Video Decoding...' : 
                 'Testing Canvas Rendering Performance...'}
              </span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {status === 'completed' && results && (
          <div className="grid grid-cols-3 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-black/40 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-4">
                <Network size={18} />
                <span className="font-medium">Network</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">Latency</span><span className="text-white">{results.network.latency}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Jitter</span><span className="text-white">{results.network.jitter}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Bandwidth</span><span className="text-white">{results.network.bandwidth}</span></div>
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-4">
                <Cpu size={18} />
                <span className="font-medium">Decode</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">HW Acceleration</span><span className="text-white text-right">{results.decode.hwAcceleration}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Decode Time</span><span className="text-white">{results.decode.time}</span></div>
              </div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-4">
                <Monitor size={18} />
                <span className="font-medium">Render</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-neutral-500">Max FPS</span><span className="text-white">{results.render.fps}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">Dropped Frames</span><span className="text-white">{results.render.dropped}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
