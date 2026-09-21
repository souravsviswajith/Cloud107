import React, { useState, useEffect, useRef } from 'react';
import { Monitor, RefreshCcw, WifiOff, Activity, Gauge, Cpu, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StreamQualityProfile, StreamMetrics } from '../types';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { globalInputManager } from '../lib/InputManager';
import { globalCursorManager } from '../lib/CursorManager';

export function StreamingDesktopRenderer() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'failed'>(
    'connecting',
  );
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const [qualityProfile, setQualityProfile] = useState<StreamQualityProfile>('balanced');
  const [showOverlay, setShowOverlay] = useState(false);
  const [metrics, setMetrics] = useState<StreamMetrics>({
    fps: 60,
    bitrate: 8.5,
    latency: 12,
    resolution: { width: 1920, height: 1080 },
    packetLoss: 0.01,
    codec: 'H.264 (NVENC)',
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Focus management
  const { isFocused } = useFocusManagement({
    onFocusLoss: () => globalInputManager.handleFocusLoss(),
    onFocusRegain: () => globalInputManager.handleFocusRegain(),
  });

  // Resolution sync
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // In a real app we would negotiate this with the WebRTC stream
        setMetrics((prev) => ({
          ...prev,
          resolution: { width: clientWidth, height: clientHeight },
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial

    if (containerRef.current) {
      globalCursorManager.attach(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      globalCursorManager.detach();
    };
  }, []);

  // Connection simulation with exponential backoff
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (status === 'connecting' || status === 'reconnecting') {
      // Exponential backoff: 1000ms * 2^attempts, capped at 30 seconds
      const baseDelay = status === 'connecting' ? 1500 : 1000 * Math.pow(2, reconnectAttempts);
      const delay = Math.min(baseDelay, 30000);

      timer = setTimeout(() => {
        // Higher chance to reconnect successfully as attempts increase to ensure they eventually get in
        const successChance = 0.5 + reconnectAttempts * 0.1;

        if (Math.random() < successChance) {
          setStatus('connected');
          setReconnectAttempts(0);
        } else {
          setStatus('reconnecting');
          setReconnectAttempts((prev) => prev + 1);
        }
      }, delay);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [status, reconnectAttempts]);

  // Metrics simulation based on profile
  useEffect(() => {
    if (status !== 'connected') return;

    const interval = setInterval(() => {
      setMetrics((prev) => {
        const jitter = Math.random() * 0.2 - 0.1; // -10% to +10%
        const targetFps = 60;
        let targetBitrate = 8.5;
        let targetLatency = 12;

        if (qualityProfile === 'performance') {
          targetBitrate = 4.0;
          targetLatency = 8;
        } else if (qualityProfile === 'quality') {
          targetBitrate = 16.0;
          targetLatency = 18;
        }

        return {
          ...prev,
          fps: Math.max(
            30,
            Math.min(60, Math.round(targetFps * (1 + (Math.random() * 0.05 - 0.02)))),
          ),
          bitrate: Number(Math.max(1, targetBitrate * (1 + jitter)).toFixed(1)),
          latency: Math.max(2, Math.round(targetLatency * (1 + jitter * 2))),
          packetLoss: Number(
            Math.max(0, prev.packetLoss + (Math.random() * 0.02 - 0.01)).toFixed(2),
          ),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, qualityProfile]);

  const handleManualReconnect = () => {
    setStatus('reconnecting');
    setReconnectAttempts(1);
  };

  return (
    <div
      className="flex-1 relative bg-neutral-950 overflow-hidden flex items-center justify-center"
      ref={containerRef}
    >
      {/* Settings toggle */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className={`p-2 rounded-lg transition-colors ${showOverlay ? 'bg-blue-500/20 text-blue-400' : 'bg-black/40 text-neutral-400 hover:text-white hover:bg-black/60'} backdrop-blur-md border border-white/10`}
          title="Streaming Metrics"
        >
          <Activity size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 z-50 w-72 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden font-mono text-xs shadow-2xl"
          >
            <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-white font-medium flex items-center gap-2">
                <Gauge size={14} className="text-blue-400" />
                Developer Overlay
              </span>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="text-neutral-400 uppercase tracking-wider text-[10px]">
                  Quality Profile
                </div>
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                  {(['performance', 'balanced', 'quality'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setQualityProfile(p)}
                      className={`flex-1 py-1 px-2 rounded-md capitalize transition-colors ${qualityProfile === p ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Monitor size={12} /> Resolution
                  </span>
                  <span className="text-white font-medium">
                    {metrics.resolution.width}x{metrics.resolution.height}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Activity size={12} /> Framerate
                  </span>
                  <span
                    className={`font-medium ${metrics.fps < 45 ? 'text-amber-400' : 'text-emerald-400'}`}
                  >
                    {metrics.fps} FPS
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Network size={12} /> Bitrate
                  </span>
                  <span className="text-blue-400 font-medium">{metrics.bitrate} Mbps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Gauge size={12} /> Latency
                  </span>
                  <span
                    className={`font-medium ${metrics.latency > 30 ? 'text-amber-400' : 'text-emerald-400'}`}
                  >
                    {metrics.latency} ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <WifiOff size={12} /> Packet Loss
                  </span>
                  <span className="text-white font-medium">{metrics.packetLoss}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Cpu size={12} /> Codec
                  </span>
                  <span className="text-white font-medium">{metrics.codec}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative w-full h-full bg-neutral-900 shadow-2xl flex flex-col items-center justify-center border border-white/5"
      >
        {status === 'connected' ? (
          <div className="absolute inset-0 bg-neutral-950">
            {/* The actual stream canvas would go here, we mock it with a grid and subtle moving gradient to look "alive" */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.1) 0%, transparent 50%), linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                backgroundSize: '100% 100%, 40px 40px, 40px 40px',
                backgroundPosition: '0 0, -1px -1px, -1px -1px',
              }}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
              <Monitor
                size={64}
                className={`mb-4 transition-colors ${isFocused ? 'text-blue-500/20' : 'text-neutral-500/20'}`}
              />
              <div
                className={`font-mono text-sm transition-colors ${isFocused ? 'text-blue-500/40' : 'text-neutral-500/40'}`}
              >
                {isFocused ? 'WebRTC Stream Active' : 'Stream Input Paused (Unfocused)'}
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20" />
        )}

        <div className="relative z-10 flex flex-col items-center gap-6">
          {status === 'connecting' && (
            <div className="flex flex-col items-center gap-4">
              <RefreshCcw size={32} className="text-blue-400 animate-spin" />
              <div className="text-white">Establishing WebRTC Connection...</div>
            </div>
          )}

          {status === 'reconnecting' && (
            <div className="flex flex-col items-center gap-4 bg-black/60 p-8 rounded-2xl backdrop-blur-md border border-white/10">
              <RefreshCcw size={32} className="text-amber-400 animate-spin" />
              <div className="text-center">
                <div className="text-amber-400 font-medium mb-1 text-lg">
                  Connection Lost - Reconnecting
                </div>
                <div className="text-neutral-400">Attempt {reconnectAttempts} of 3...</div>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center gap-4 bg-black/60 p-8 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-500/30">
                <WifiOff size={24} className="text-rose-400" />
              </div>
              <div className="text-center mb-2">
                <div className="text-rose-400 font-medium text-lg mb-1">Stream Disconnected</div>
                <div className="text-neutral-400 text-sm">
                  Could not re-establish connection to the workspace.
                </div>
              </div>
              <button
                onClick={handleManualReconnect}
                className="px-6 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-sm font-medium transition-colors border border-rose-500/30"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
