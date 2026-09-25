import { useState, useEffect } from 'react';
import {
  Monitor,
  Play,
  Settings,
  Server,
  Plus,
  Loader2,
  AppWindow,
  PlayCircle,
  Cpu,
  HardDrive,
  MoreVertical,
  LayoutGrid,
  Clock,
  ChevronRight,
  Activity,
  CheckCircle2,
  XCircle,
  Circle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VmInstance, WorkspaceState, Workspace } from '../types';
import { workspaceApi } from '../lib/apiClient';
import { useShell } from '../contexts/ShellContext';

import { ProvisioningScreen } from './launch/ProvisioningScreen';
import { ConnectionScreen } from './launch/ConnectionScreen';
import { WorkspaceSetup } from './WorkspaceSetup';
import { ResourceMonitoringPanel } from './ResourceMonitoringPanel';

interface DashboardProps {
  onLaunchDesktop: (vm: VmInstance) => void;
  onLaunchAppLibrary: (vm: VmInstance) => void;
}

type DashboardTab = 'overview' | 'nodes' | 'operations';

type OperationEvent = {
  id: string;
  time: string;
  action: string;
  target: string;
  status: 'running' | 'success' | 'error';
};

type WorkspaceConfig = {
  cpuClass: string;
  cpuCores: number;
  cpuThreads: number;
  ram: string;
  gpu: string;
  storageCapacity: string;
  storageType: string;
  storage: string;
};

const DEFAULT_CONFIG: WorkspaceConfig = {
  cpuClass: 'AMD EPYC Class',
  cpuCores: 8,
  cpuThreads: 16,
  ram: '16 GB',
  gpu: 'AI Standard Class',
  storageCapacity: '250 GB',
  storageType: 'NVMe SSD',
  get storage() {
    return `${this.storageCapacity} ${this.storageType}`;
  },
};

const STORAGE_CAPACITIES = ['50 GB', '100 GB', '250 GB', '500 GB', '1 TB', '2 TB', '5 TB'];
const STORAGE_TYPES = ['Standard SSD', 'Premium SSD', 'NVMe SSD'];

const CPU_CLASSES = ['Intel Xeon Class', 'AMD EPYC Class', 'ARM Neoverse Class'];
const CPU_CORES = [
  { cores: 2, threads: 4 },
  { cores: 4, threads: 8 },
  { cores: 8, threads: 16 },
  { cores: 16, threads: 32 },
  { cores: 32, threads: 64 },
];
const RAM_OPTIONS = ['4 GB', '8 GB', '16 GB', '32 GB', '64 GB'];
const GPU_OPTIONS = [
  { label: 'CPU Only', category: 'Basic' },
  { label: 'RTX 3060 Class', category: 'Gaming & Creative' },
  { label: 'RTX 4070 Class', category: 'Gaming & Creative' },
  { label: 'RTX 4090 Class', category: 'Gaming & Creative' },
  { label: 'Professional Graphics Class', category: 'Professional' },
  { label: 'AI Standard Class', category: 'AI Development' },
  { label: 'AI High Performance Class', category: 'AI Training' },
];

export function Dashboard({ onLaunchDesktop, onLaunchAppLibrary }: DashboardProps) {
  const { addNotification } = useShell();
  const [vms, setVms] = useState<VmInstance[]>([]);
  const [selectedVm, setSelectedVm] = useState<VmInstance | null>(null);
  const [connectionPhase, setConnectionPhase] = useState<
    'idle' | 'provisioning' | 'connecting' | 'ready'
  >('idle');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [deletingVm, setDeletingVm] = useState<VmInstance | null>(null);
  const [configs, setConfigs] = useState<Record<string, WorkspaceConfig>>({});
  const [monitoredVmId, setMonitoredVmId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [operations, setOperations] = useState<OperationEvent[]>([]);

  const recordOperation = (action: string, target: string, status: OperationEvent['status'] = 'running') => {
    const event = { id: crypto.randomUUID(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), action, target, status };
    setOperations((prev) => [event, ...prev].slice(0, 30));
    return event.id;
  };

  const finishOperation = (id: string, status: 'success' | 'error') => {
    setOperations((prev) => prev.map((event) => (event.id === id ? { ...event, status } : event)));
  };

  const monitoredVm =
    vms.find((v) => v.id === monitoredVmId) ||
    vms.find((v) => v.status === 'ready') ||
    vms[0] ||
    null;

  const getConfig = (vmId: string): WorkspaceConfig => {
    const cfg = configs[vmId] || DEFAULT_CONFIG;
    const capacity = cfg.storageCapacity || '250 GB';
    const type = cfg.storageType || 'NVMe SSD';
    return {
      ...cfg,
      storageCapacity: capacity,
      storageType: type,
      storage: `${capacity} ${type}`,
    };
  };
  const updateConfig = (vmId: string, field: keyof WorkspaceConfig, value: string | number) => {
    setConfigs((prev) => ({ ...prev, [vmId]: { ...getConfig(vmId), [field]: value } }));
  };

  useEffect(() => {
    fetchWorkspaces();
    const interval = setInterval(fetchWorkspaces, 5000);
    return () => clearInterval(interval);
  }, []);

  const mapWorkspaceToVm = (ws: Workspace): VmInstance => {
    let status: VmInstance['status'] = 'offline';
    if (ws.state === WorkspaceState.Starting || ws.state === WorkspaceState.Connecting) {
      status = 'provisioning';
    } else if (ws.state === WorkspaceState.Running || ws.state === WorkspaceState.Streaming) {
      status = 'ready';
    } else if (ws.state === WorkspaceState.Stopping) {
      status = 'provisioning'; // treating stopping as provisioning to show spinner
    }

    return {
      id: ws.id,
      name: ws.name,
      status,
      gpu: 'NVIDIA T4',
      ram: '16GB',
      vCPU: 4,
    };
  };

  const fetchWorkspaces = async () => {
    try {
      const data = await workspaceApi.listWorkspaces();
      setVms(data.map(mapWorkspaceToVm));
    } catch (e) {
      console.error('Failed to fetch workspaces', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    const operationId = recordOperation('Create environment', `Workspace ${vms.length + 1}`);
    try {
      await workspaceApi.createWorkspace(`Workspace ${vms.length + 1}`);
      await fetchWorkspaces();
      finishOperation(operationId, 'success');
    } catch (e) {
      console.error('Failed to create workspace', e);
      finishOperation(operationId, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (vm: VmInstance) => {
    setMenuOpenFor(null);
    const operationId = recordOperation('Delete environment', vm.name);
    const previousVms = [...vms];
    setVms((prev) => prev.filter((v) => v.id !== vm.id));
    try {
      await workspaceApi.deleteWorkspace(vm.id);
      fetchWorkspaces();
      finishOperation(operationId, 'success');
    } catch (e) {
      console.error('Failed to delete workspace', e);
      addNotification({
        title: 'Delete Failed',
        message: 'Failed to delete workspace. Please try again.',
        type: 'error',
      });
      setVms(previousVms);
      fetchWorkspaces();
      finishOperation(operationId, 'error');
    }
  };

  const handleStop = async (vm: VmInstance) => {
    const operationId = recordOperation('Stop environment', vm.name);
    setVms((prev) => prev.map((v) => (v.id === vm.id ? { ...v, status: 'provisioning' } : v)));
    try {
      await workspaceApi.stopWorkspace(vm.id);
      fetchWorkspaces();
      finishOperation(operationId, 'success');
    } catch (e) {
      console.error('Failed to stop workspace', e);
      fetchWorkspaces();
      finishOperation(operationId, 'error');
    }
  };

  useEffect(() => {
    if (connectionPhase === 'provisioning') {
      const timer = setTimeout(() => {
        setConnectionPhase('connecting');
      }, 6500);
      return () => clearTimeout(timer);
    } else if (connectionPhase === 'connecting') {
      const timer = setTimeout(() => {
        setConnectionPhase('ready');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [connectionPhase]);

  const handleConnect = (vm: VmInstance) => {
    const config = getConfig(vm.id);
    setSelectedVm({
      ...vm,
      gpu: config.gpu,
      ram: config.ram,
      vCPU: config.cpuCores,
    });
    setConnectionPhase('provisioning');
  };

  const handleBoot = async (vm: VmInstance) => {
    const operationId = recordOperation('Start environment', vm.name);
    setVms((prev) => prev.map((v) => (v.id === vm.id ? { ...v, status: 'provisioning' } : v)));
    try {
      await workspaceApi.startWorkspace(vm.id);
      fetchWorkspaces();
      finishOperation(operationId, 'success');
    } catch (e) {
      console.error('Failed to start workspace', e);
      fetchWorkspaces();
      finishOperation(operationId, 'error');
    }
  };

  if (loading && vms.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <Loader2 size={32} className="animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-8 lg:p-12 font-sans relative">
      {/* Premium Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-neutral-900">
              <img
                src="/assets/cloud107-logo.png"
                alt="Cloud 107"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-semibold text-2xl tracking-tight text-white">Cloud 107</h1>
              <p className="text-sm text-neutral-400 font-medium">Infrastructure Control Plane</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-all border border-white/10 backdrop-blur-md">
              <Settings size={16} className="text-neutral-400" />
              Settings
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-semibold rounded-xl hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              New Environment
            </button>
          </div>
        </header>

        <main>
          <div className="flex items-center justify-between mb-8 mt-2">
            <div className="flex items-center gap-6 border-b border-white/10 w-full pb-4">
              {([['overview', 'Overview'], ['nodes', 'Nodes'], ['operations', 'Operations']] as const).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-medium pb-4 mb-[-17px] border-b-2 transition-colors ${activeTab === tab ? 'text-white border-white' : 'text-neutral-500 hover:text-neutral-300 border-transparent'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'operations' && (
            <section className="rounded-3xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Activity size={18} className="text-blue-400" />
                    <h2 className="text-lg font-semibold">Operations Stream</h2>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1">Recent control-plane actions from this session.</p>
                </div>
                <span className="text-xs text-neutral-500">{operations.length} events</span>
              </div>
              {operations.length === 0 ? (
                <div className="py-20 text-center text-neutral-500">
                  <Circle size={28} className="mx-auto mb-3 text-neutral-700" />
                  No operations recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {operations.map((event) => (
                    <div key={event.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="shrink-0">
                        {event.status === 'running' && <Loader2 size={18} className="animate-spin text-amber-400" />}
                        {event.status === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
                        {event.status === 'error' && <XCircle size={18} className="text-red-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-neutral-200">{event.action}</div>
                        <div className="text-xs text-neutral-500 truncate">{event.target}</div>
                      </div>
                      <div className="text-xs text-neutral-600 font-mono">{event.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'nodes' && (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vms.map((vm) => (
                <div key={vm.id} className="rounded-2xl border border-white/10 bg-neutral-900/40 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Server size={18} className="text-neutral-400" />
                      <span className="font-medium">{vm.name}</span>
                    </div>
                    <span className="text-xs text-neutral-500 uppercase">{vm.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><div className="text-neutral-600">CPU</div><div className="text-neutral-300 mt-1">{getConfig(vm.id).cpuCores} vCPU</div></div>
                    <div><div className="text-neutral-600">Memory</div><div className="text-neutral-300 mt-1">{getConfig(vm.id).ram}</div></div>
                    <div><div className="text-neutral-600">GPU</div><div className="text-neutral-300 mt-1 truncate">{getConfig(vm.id).gpu}</div></div>
                  </div>
                </div>
              ))}
              {vms.length === 0 && <div className="md:col-span-2 xl:col-span-3 py-20 text-center text-neutral-500 border border-white/5 rounded-3xl">No environments are available to inspect.</div>}
            </section>
          )}

          {activeTab === 'overview' && vms.length === 0 && !loading && (

            <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.01]">
              <Server size={48} className="mx-auto text-neutral-600 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Environments</h3>
              <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                Create an environment to begin.
              </p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="bg-white/10 hover:bg-white/15 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all"
              >
                {creating ? 'Creating...' : 'New Environment'}
              </button>
            </div>
          )}

          {activeTab === 'overview' && <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {vms.map((vm) => (
              <motion.div
                key={vm.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-1 border border-white/10 shadow-2xl group flex flex-col h-full relative overflow-hidden"
              >
                {/* Hover gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="bg-neutral-950/50 rounded-[22px] p-6 h-full flex flex-col relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                          vm.status === 'ready'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : vm.status === 'provisioning'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : 'bg-neutral-800 border-white/5 text-neutral-400'
                        }`}
                      >
                        <Monitor size={22} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white tracking-tight">
                          {vm.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              vm.status === 'ready'
                                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                                : vm.status === 'provisioning'
                                  ? 'bg-amber-500 animate-pulse'
                                  : 'bg-neutral-600'
                            }`}
                          />
                          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                            {vm.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenFor(menuOpenFor === vm.id ? null : vm.id)}
                        className="p-2 text-neutral-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      >
                        <MoreVertical size={18} />
                      </button>
                      <AnimatePresence>
                        {menuOpenFor === vm.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                          >
                            <button
                              onClick={() => {
                                setMenuOpenFor(null);
                                // Rename logic placeholder
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/10 transition-colors"
                            >
                              Rename Environment
                            </button>
                            <button
                              disabled
                              className="w-full text-left px-4 py-2.5 text-sm text-neutral-500 bg-transparent cursor-not-allowed flex items-center justify-between"
                            >
                              Duplicate{' '}
                              <span className="text-[10px] uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                Soon
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setMenuOpenFor(null);
                                handleStop(vm);
                              }}
                              disabled={vm.status !== 'ready'}
                              className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Stop Environment
                            </button>
                            <div className="h-px bg-white/10 my-1"></div>
                            <button
                              onClick={() => {
                                setMenuOpenFor(null);
                                setDeletingVm(vm);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              Delete Workspace
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {/* CPU */}
                    <div className="col-span-2 bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <Cpu size={14} />
                        <span className="text-xs font-medium">CPU</span>
                      </div>
                      {vm.status === 'offline' ? (
                        <div className="space-y-2">
                          <select
                            value={getConfig(vm.id).cpuClass}
                            onChange={(e) => updateConfig(vm.id, 'cpuClass', e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                          >
                            {CPU_CLASSES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <select
                            value={getConfig(vm.id).cpuCores}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              const option = CPU_CORES.find((c) => c.cores === val);
                              if (option) {
                                updateConfig(vm.id, 'cpuCores', option.cores);
                                updateConfig(vm.id, 'cpuThreads', option.threads);
                              }
                            }}
                            className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                          >
                            {CPU_CORES.map((c) => (
                              <option key={c.cores} value={c.cores}>
                                {c.cores} Cores / {c.threads} Threads
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-neutral-200">
                          <div>{getConfig(vm.id).cpuClass}</div>
                          <div className="text-neutral-400 font-normal mt-0.5">
                            {getConfig(vm.id).cpuCores} Cores / {getConfig(vm.id).cpuThreads}{' '}
                            Threads
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RAM */}
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <HardDrive size={14} />
                        <span className="text-xs font-medium">Memory</span>
                      </div>
                      {vm.status === 'offline' ? (
                        <select
                          value={getConfig(vm.id).ram}
                          onChange={(e) => updateConfig(vm.id, 'ram', e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                        >
                          {RAM_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm font-medium text-neutral-200">
                          {getConfig(vm.id).ram}
                        </div>
                      )}
                    </div>

                    {/* Storage */}
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <Server size={14} />
                        <span className="text-xs font-medium">Storage</span>
                      </div>
                      {vm.status === 'offline' ? (
                        <div className="space-y-2">
                          <select
                            value={getConfig(vm.id).storageCapacity}
                            onChange={(e) => updateConfig(vm.id, 'storageCapacity', e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                          >
                            {STORAGE_CAPACITIES.map((sc) => (
                              <option key={sc} value={sc}>
                                {sc}
                              </option>
                            ))}
                          </select>
                          <select
                            value={getConfig(vm.id).storageType}
                            onChange={(e) => updateConfig(vm.id, 'storageType', e.target.value)}
                            className="w-full bg-[#111111] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                          >
                            {STORAGE_TYPES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-neutral-200">
                          {getConfig(vm.id).storage}
                        </div>
                      )}
                    </div>

                    {/* GPU */}
                    <div className="col-span-2 bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-neutral-500 mb-2">
                        <LayoutGrid size={14} />
                        <span className="text-xs font-medium">Graphics</span>
                      </div>
                      {vm.status === 'offline' ? (
                        <select
                          value={getConfig(vm.id).gpu}
                          onChange={(e) => updateConfig(vm.id, 'gpu', e.target.value)}
                          className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                        >
                          {Array.from(new Set(GPU_OPTIONS.map((g) => g.category))).map(
                            (category) => (
                              <optgroup
                                key={category}
                                label={category}
                                className="bg-neutral-800 text-neutral-400"
                              >
                                {GPU_OPTIONS.filter((g) => g.category === category).map((g) => (
                                  <option key={g.label} value={g.label} className="text-white">
                                    {g.label}
                                  </option>
                                ))}
                              </optgroup>
                            ),
                          )}
                        </select>
                      ) : (
                        <div className="text-sm font-medium text-neutral-200">
                          {getConfig(vm.id).gpu}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto">
                    {vm.status === 'ready' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConnect(vm)}
                          className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                        >
                          Open Environment
                        </button>
                        <button
                          onClick={() => handleStop(vm)}
                          className="py-3.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center border border-white/10 bg-neutral-800 text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                          title="Stop Environment"
                        >
                          Stop
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBoot(vm)}
                        disabled={vm.status === 'provisioning'}
                        className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border ${
                          vm.status === 'provisioning'
                            ? 'bg-neutral-900 border-white/5 text-neutral-500 cursor-not-allowed'
                            : 'bg-neutral-800 border-white/10 text-white hover:bg-neutral-700 hover:border-white/20'
                        }`}
                      >
                        {vm.status === 'provisioning' && (
                          <Loader2 size={16} className="animate-spin" />
                        )}
                        {vm.status === 'offline' && <Play size={16} />}
                        {vm.status === 'provisioning'
                          ? 'Starting Environment...'
                          : 'Start Environment'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>}

          {activeTab === 'overview' && vms.length > 0 && (
            <div className="mt-12">
              <ResourceMonitoringPanel
                vm={monitoredVm}
                config={getConfig(monitoredVm?.id || '')}
                allVms={vms}
                onSelectVm={(v) => setMonitoredVmId(v.id)}
              />
            </div>
          )}

          {activeTab === 'overview' && <div className="mt-16">
            <WorkspaceSetup />
          </div>}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingVm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setDeletingVm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative z-10 w-full max-w-sm overflow-hidden"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Delete Environment?</h3>
              <p className="text-sm text-neutral-400 mb-6">
                Are you sure you want to remove this environment? This action cannot be undone in
                the demo.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingVm(null)}
                  className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(deletingVm);
                    setDeletingVm(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 rounded-xl transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Mode Modal */}
      <AnimatePresence>
        {selectedVm && connectionPhase === 'ready' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => {
                setSelectedVm(null);
                setConnectionPhase('idle');
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111111] border border-white/10 rounded-3xl p-1 shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-neutral-950 rounded-[22px] p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Monitor size={16} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white tracking-tight">
                      {selectedVm.name}
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Select an execution surface for this environment.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      onLaunchDesktop(selectedVm);
                      setSelectedVm(null);
                      setConnectionPhase('idle');
                    }}
                    className="w-full flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <Monitor size={26} />
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-white mb-1">Desktop Mode</div>
                        <div className="text-sm text-neutral-400">
                          Open the complete graphical environment with multi-window support.
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-neutral-600 group-hover:text-white transition-colors"
                    />
                  </button>

                  <button
                    onClick={() => {
                      onLaunchAppLibrary(selectedVm);
                      setSelectedVm(null);
                      setConnectionPhase('idle');
                    }}
                    className="w-full flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                        <AppWindow size={26} />
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-white mb-1">
                          Application Mode
                        </div>
                        <div className="text-sm text-neutral-400">
                          Open a single application through the application runtime.
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-neutral-600 group-hover:text-white transition-colors"
                    />
                  </button>

                  <div className="pt-4 mt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        onLaunchDesktop(selectedVm);
                        setSelectedVm(null);
                        setConnectionPhase('idle');
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-transparent hover:bg-white/[0.03] transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-white/5 text-neutral-400 flex items-center justify-center shrink-0">
                          <Clock size={20} />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-200">
                            Resume Previous Session
                          </div>
                          <div className="text-xs text-neutral-500">
                            Reconnect to your last active mode.
                          </div>
                        </div>
                      </div>
                      <PlayCircle
                        size={18}
                        className="text-neutral-600 group-hover:text-white transition-colors"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Progress Overlays */}
      <AnimatePresence>
        {connectionPhase === 'provisioning' && (
          <motion.div
            key="provisioning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0A0A0A]"
          >
            <ProvisioningScreen />
          </motion.div>
        )}
        {connectionPhase === 'connecting' && (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0A0A0A]"
          >
            <ConnectionScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
