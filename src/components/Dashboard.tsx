import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cloud,
  FolderKanban,
  Layout,
  Server,
  Settings,
  Shield,
  Terminal,
  AlertCircle,
} from 'lucide-react';
import { Workspace, WorkspaceState, VmInstance } from '../types';
import { workspaceApi } from '../lib/apiClient';

interface DashboardProps {
  onLaunchDesktop: (vm: VmInstance) => void;
  onLaunchAppLibrary: (vm: VmInstance) => void;
}

type ViewMode = 'overview' | 'projects' | 'nodes' | 'operations' | 'terminal' | 'settings';

type OperationEvent = {
  id: string;
  name: string;
  status: 'Running' | 'Completed' | 'Failed';
  node: string;
  time: string;
};

function mapWorkspace(ws: Workspace): VmInstance {
  const status: VmInstance['status'] =
    ws.state === WorkspaceState.Running || ws.state === WorkspaceState.Streaming
      ? 'ready'
      : ws.state === WorkspaceState.Starting || ws.state === WorkspaceState.Connecting || ws.state === WorkspaceState.Stopping
        ? 'provisioning'
        : 'offline';

  return { id: ws.id, name: ws.name, status, gpu: 'N/A', ram: 'N/A', vCPU: 0 };
}

export function Dashboard({ onLaunchDesktop, onLaunchAppLibrary }: DashboardProps) {
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [operations, setOperations] = useState<OperationEvent[]>([]);
  const [settingsSection, setSettingsSection] = useState('General');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>(['Cloud107 terminal', 'Type a command to continue.']);
  const [health, setHealth] = useState<'Healthy' | 'Degraded' | 'Offline'>('Offline');
  const [billingConnected, setBillingConnected] = useState(false);
  const [billingMessage, setBillingMessage] = useState('No billing provider is connected.');
  const [updateStatus, setUpdateStatus] = useState<{
    currentVersion: string;
    platform: string;
    architecture: string;
    nodeVersion: string;
    checkpointCount: number;
    latestCheckpoint: { id: string; targetVersion: string; status: string; timestamp: number } | null;
    updateManager: { mode: string; verification: string; rollback: string };
  } | null>(null);

  const refresh = async () => {
    try {
      const current = await workspaceApi.listWorkspaces();
      setWorkspaces(current);
    } catch (error) {
      console.error('Failed to fetch workspaces', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const checkBilling = async () => {
      try {
        const response = await fetch('/api/v1/billing');
        if (!response.ok) {
          if (active) {
            setBillingConnected(false);
            setBillingMessage(response.status === 404 ? 'Billing API not configured.' : 'Billing service unavailable.');
          }
          return;
        }
        const payload = await response.json();
        if (active) {
          const connected = Boolean(payload.success && payload.data?.providerId);
          setBillingConnected(connected);
          setBillingMessage(
            connected
              ? `Live data from ${payload.data.providerId}.`
              : 'No billing provider is connected.',
          );
        }
      } catch {
        if (active) {
          setBillingConnected(false);
          setBillingMessage('Billing service unavailable.');
        }
      }
    };
    checkBilling();
    const timer = setInterval(checkBilling, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/v1/health');
        if (!response.ok) {
          if (active) setHealth('Degraded');
          return;
        }
        const payload = await response.json();
        if (!active) return;
        setHealth(payload.success && payload.data?.status === 'ok' ? 'Healthy' : 'Degraded');
      } catch {
        if (active) setHealth('Offline');
      }
    };
    checkHealth();
    const timer = setInterval(checkHealth, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (settingsSection !== 'Updates') return;
    let active = true;
    const loadUpdateStatus = async () => {
      try {
        const response = await fetch('/api/v1/updates/status');
        if (!response.ok) {
          if (active) setUpdateStatus(null);
          return;
        }
        const payload = await response.json();
        if (active) setUpdateStatus(payload.success ? payload.data : null);
      } catch {
        if (active) setUpdateStatus(null);
      }
    };
    loadUpdateStatus();
    const timer = setInterval(loadUpdateStatus, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [settingsSection]);

  const nodes = useMemo(() => workspaces.map(mapWorkspace), [workspaces]);
  const online = nodes.filter((node) => node.status === 'ready').length;
  const offline = nodes.length - online;

  const record = (name: string, node: string, status: OperationEvent['status']) => {
    setOperations((current) => [
      {
        id: crypto.randomUUID(),
        name,
        status,
        node,
        time: 'Just now',
      },
      ...current,
    ].slice(0, 30));
  };

  const createWorkspace = async () => {
    try {
      const name = `Workspace ${workspaces.length + 1}`;
      await workspaceApi.createWorkspace(name);
      record('Create workspace', name, 'Completed');
      await refresh();
    } catch {
      record('Create workspace', 'System', 'Failed');
    }
  };

  const changeWorkspaceState = async (node: VmInstance, action: 'start' | 'stop') => {
    const label = action === 'start' ? 'Start workspace' : 'Stop workspace';
    const operationId = crypto.randomUUID();
    setOperations((current) => [
      { id: operationId, name: label, status: 'Running', node: node.name, time: 'Just now' },
      ...current,
    ].slice(0, 30));
    try {
      if (action === 'start') await workspaceApi.startWorkspace(node.id);
      else await workspaceApi.stopWorkspace(node.id);
      setOperations((current) => current.map((op) => op.id === operationId ? { ...op, status: 'Completed' } : op));
      await refresh();
    } catch {
      setOperations((current) => current.map((op) => op.id === operationId ? { ...op, status: 'Failed' } : op));
    }
  };

  const openWorkspace = (node: VmInstance, mode: 'desktop' | 'app') => {
    record(mode === 'desktop' ? `Open ${node.name}` : `Open applications on ${node.name}`, node.name, 'Completed');
    if (mode === 'desktop') onLaunchDesktop(node);
    else onLaunchAppLibrary(node);
  };

  const navItems: { id: ViewMode; label: string; icon: typeof Layout }[] = [
    { id: 'overview', label: 'Overview', icon: Layout },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'nodes', label: 'Nodes', icon: Server },
    { id: 'operations', label: 'Operations', icon: Activity },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const readyNode = nodes.find((node) => node.status === 'ready') ?? nodes[0];

  if (loading && workspaces.length === 0) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-neutral-500">Loading Cloud107…</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <aside className="w-56 shrink-0 border-r border-white/5 bg-[#0a0a0a] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Cloud size={16} className="text-neutral-400" />
            <span className="font-medium tracking-tight">Cloud107</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <div key={item.id}>
                {index === 4 && <div className="h-6" />}
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02]'}`}
                >
                  <Icon size={16} className={active ? 'text-white' : 'text-neutral-500'} />
                  {item.label}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Shield size={12} />
            Sovereign Identity
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between px-10 border-b border-white/5">
          <h1 className="text-lg font-medium capitalize">{activeView}</h1>
          <span className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full border backdrop-blur-lg ${
            health === 'Healthy'
              ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
              : health === 'Degraded'
                ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                : 'text-neutral-400 bg-white/5 border-white/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              health === 'Healthy' ? 'bg-emerald-400' : health === 'Degraded' ? 'bg-amber-400' : 'bg-neutral-500'
            }`} />
            {health}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="max-w-4xl space-y-10">
            {activeView === 'overview' && (
              <>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Workspace</p>
                    <h2 className="text-2xl font-medium">Overview</h2>
                  </div>
                  <button onClick={createWorkspace} className="px-3 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-neutral-200">New Workspace</button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <section className={`${liquidGlass} rounded-xl p-5`}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Live Bill</h2>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-600">Provider</span>
                    </div>
                    <div className="text-2xl font-medium text-neutral-300">{billingConnected ? 'Connected' : 'Unavailable'}</div>
                    <p className="text-xs text-neutral-600 mt-2">{billingMessage}</p>
                  </section>
                  <section>
                    <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Nodes</h2>
                    <div className="space-y-2 text-sm text-neutral-300">
                      <div className="flex justify-between border-b border-white/5 pb-2"><span>Online</span><span className="text-white font-medium">{online}</span></div>
                      <div className="flex justify-between pb-2"><span>Offline</span><span className="text-neutral-500 font-medium">{offline}</span></div>
                    </div>
                  </section>
                  <section>
                    <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Operations</h2>
                    <div className="space-y-2 text-sm text-neutral-300">
                      <div className="flex justify-between border-b border-white/5 pb-2"><span>Running</span><span className="text-blue-400 font-medium">{operations.filter((op) => op.status === 'Running').length}</span></div>
                      <div className="flex justify-between pb-2"><span>Needs Attention</span><span className="text-amber-400 font-medium">{operations.filter((op) => op.status === 'Failed').length}</span></div>
                    </div>
                  </section>
                </div>

                <section>
                  <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {operations.slice(0, 5).map((op) => (
                      <div key={op.id} className="text-sm flex items-center gap-4">
                        <span className="text-neutral-500 w-20 shrink-0">{op.time}</span>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${op.status === 'Running' ? 'bg-blue-400' : op.status === 'Failed' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-neutral-300">{op.name}</span>
                        <span className="text-neutral-600 ml-auto">{op.node}</span>
                      </div>
                    ))}
                    {operations.length === 0 && <p className="text-sm text-neutral-600">No activity recorded in this session.</p>}
                  </div>
                </section>
              </>
            )}

            {activeView === 'projects' && (
              <section>
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Projects</h2>
                <div className="divide-y divide-white/5 border-y border-white/5">
                  {nodes.map((node) => (
                    <button key={node.id} onClick={() => openWorkspace(node, 'desktop')} className="w-full py-4 flex items-center text-left hover:bg-white/[0.02]">
                      <span className={`w-1.5 h-1.5 rounded-full mr-4 ${node.status === 'ready' ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                      <span className="text-sm text-neutral-200">{node.name}</span>
                      <span className="ml-auto text-xs text-neutral-600">{node.status}</span>
                    </button>
                  ))}
                  {nodes.length === 0 && <p className="py-12 text-sm text-neutral-600">No projects are currently available.</p>}
                </div>
              </section>
            )}

            {activeView === 'nodes' && (
              <section>
                {selectedNodeId ? (
                  (() => {
                    const node = nodes.find((item) => item.id === selectedNodeId);
                    if (!node) return null;
                    return (
                      <div>
                        <button onClick={() => setSelectedNodeId(null)} className="text-xs text-neutral-500 hover:text-white mb-6">
                          ← Back to Nodes
                        </button>
                        <div className="border-b border-white/5 pb-6 mb-8">
                          <h2 className="text-xl font-medium mb-2">{node.name}</h2>
                          <div className="flex items-center gap-5 text-sm text-neutral-500">
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${node.status === 'ready' ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                              {node.status}
                            </span>
                            <span>Cloud107 runtime</span>
                            <span>{node.id}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-10 mb-8">
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Workspace</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span className="text-neutral-500">State</span><span className="text-neutral-200">{node.status}</span></div>
                              <div className="flex justify-between"><span className="text-neutral-500">CPU</span><span className="text-neutral-200">{node.vCPU || 'N/A'}</span></div>
                              <div className="flex justify-between"><span className="text-neutral-500">Memory</span><span className="text-neutral-200">{node.ram}</span></div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Actions</h3>
                            <div className="flex flex-wrap gap-2">
                              {node.status === 'ready' && <button onClick={() => openWorkspace(node, 'desktop')} className={`px-3 py-2 bg-white/[0.07] hover:bg-white/15 text-white text-xs rounded-md backdrop-blur-lg border border-white/10`}>Open Workspace</button>}
                              {node.status === 'ready' ? (
                                <button onClick={() => changeWorkspaceState(node, 'stop')} className={`px-3 py-2 bg-white/5 hover:bg-white/[0.07] text-neutral-300 text-xs rounded-md backdrop-blur-lg border border-white/10`}>Stop</button>
                              ) : (
                                <button onClick={() => changeWorkspaceState(node, 'start')} className={`px-3 py-2 bg-white/5 hover:bg-white/[0.07] text-neutral-300 text-xs rounded-md backdrop-blur-lg border border-white/10`}>Start</button>
                              )}
                              <button onClick={() => openWorkspace(node, 'app')} className={`px-3 py-2 bg-white/5 hover:bg-white/[0.07] text-neutral-300 text-xs rounded-md backdrop-blur-lg border border-white/10`}>Applications</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <>
                    <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Nodes</h2>
                    <div className="divide-y divide-white/5 border-y border-white/5">
                      {nodes.map((node) => (
                        <button key={node.id} onClick={() => setSelectedNodeId(node.id)} className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/[0.02]">
                          <span className={`w-2 h-2 rounded-full ${node.status === 'ready' ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                          <span className="text-sm text-neutral-200">{node.name}</span>
                          <span className="text-xs text-neutral-500">{node.status}</span>
                          <span className="text-xs text-neutral-600 ml-auto">Cloud107</span>
                        </button>
                      ))}
                      {nodes.length === 0 && <p className="py-12 text-sm text-neutral-600">No nodes are currently registered.</p>}
                    </div>
                  </>
                )}
              </section>
            )}

            {activeView === 'operations' && (
              <>
                <section>
                  <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2"><AlertCircle size={12} className="text-amber-400" /> Needs Attention</h2>
                  <div className="space-y-3 border-l-2 border-amber-500/30 pl-4">
                    {operations.filter((op) => op.status === 'Failed').map((op) => <div key={op.id}><div className="text-sm text-white">{op.name}</div><div className="text-xs text-neutral-500">{op.node}</div></div>)}
                    {operations.filter((op) => op.status === 'Failed').length === 0 && <div className="text-sm text-neutral-600">Nothing requires attention.</div>}
                  </div>
                </section>
                <section>
                  <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2"><CheckCircle2 size={12} className="text-neutral-600" /> Completed</h2>
                  <div className="space-y-4 border-l-2 border-white/5 pl-4">
                    {operations.filter((op) => op.status === 'Completed').map((op) => <div key={op.id}><div className="text-sm text-neutral-400">{op.name}</div><div className="text-xs text-neutral-600 mt-0.5">{op.node} · {op.time}</div></div>)}
                  </div>
                </section>
              </>
            )}

            {activeView === 'terminal' && (
              <section>
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Terminal</h2>
                {readyNode ? (
                  <div className="border border-white/5 bg-black/40 rounded-md overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/5 text-xs text-neutral-500">{readyNode.name}</div>
                    <div className="p-4 h-72 overflow-y-auto font-mono text-xs text-neutral-300 space-y-1">
                      {terminalLines.map((line, index) => <div key={index}>{line}</div>)}
                    </div>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const command = terminalInput.trim();
                        if (!command) return;
                        setTerminalLines((lines) => [...lines, `$ ${command}`, command === 'clear' ? '' : `Command queued: ${command}`].slice(-100));
                        setTerminalInput('');
                      }}
                      className="border-t border-white/5 flex items-center px-4"
                    >
                      <span className="text-neutral-600 font-mono text-xs mr-2">$</span>
                      <input value={terminalInput} onChange={(event) => setTerminalInput(event.target.value)} placeholder="command" className="flex-1 bg-transparent py-3 outline-none font-mono text-xs text-white placeholder:text-neutral-700" />
                    </form>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600">No online node is available.</p>
                )}
              </section>
            )}

            {activeView === 'settings' && (
              <section className="grid grid-cols-[180px_1fr] gap-10">
                <div className="space-y-1">
                  {['General', 'Identity', 'Security', 'Nodes', 'Providers', 'Runtime', 'Updates', 'Storage', 'Network'].map((item) => (
                    <button key={item} onClick={() => setSettingsSection(item)} className={`w-full text-left px-3 py-1.5 text-sm rounded ${settingsSection === item ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'}`}>{item}</button>
                  ))}
                  <div className="pt-5 pb-2 text-[10px] uppercase tracking-wider text-neutral-600">Advanced</div>
                  {['Capabilities', 'Policies', 'Schedulers', 'Reconciliation', 'Diagnostics', 'Events', 'Logs'].map((item) => (
                    <button key={item} onClick={() => setSettingsSection(item)} className={`w-full text-left px-3 py-1.5 text-sm rounded ${settingsSection === item ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}>{item}</button>
                  ))}
                </div>
                <div>
                  <h2 className="text-lg font-medium mb-6">{settingsSection} Configuration</h2>
                  <div className="space-y-5 text-sm">
                    <div><div className="text-neutral-500 mb-1">Environment Name</div><div className="text-neutral-200">Cloud107</div></div>
                    <div><div className="text-neutral-500 mb-1">Execution</div><div className="text-neutral-200">Local Execution</div></div>
                    {settingsSection === 'Updates' ? (
                      updateStatus ? (
                        <>
                          <div><div className="text-neutral-500 mb-1">Current Version</div><div className="text-neutral-200">v{updateStatus.currentVersion}</div></div>
                          <div><div className="text-neutral-500 mb-1">Target</div><div className="text-neutral-200">{updateStatus.platform} · {updateStatus.architecture}</div></div>
                          <div><div className="text-neutral-500 mb-1">Verification</div><div className="text-neutral-200">{updateStatus.updateManager.verification}</div></div>
                          <div><div className="text-neutral-500 mb-1">Rollback</div><div className="text-neutral-200">{updateStatus.updateManager.rollback}</div></div>
                          <div><div className="text-neutral-500 mb-1">Checkpoints</div><div className="text-neutral-200">{updateStatus.checkpointCount}</div></div>
                          {updateStatus.latestCheckpoint && <div><div className="text-neutral-500 mb-1">Latest Checkpoint</div><div className="text-neutral-200">{updateStatus.latestCheckpoint.id} · {updateStatus.latestCheckpoint.status}</div></div>}
                        </>
                      ) : (
                        <div className="text-neutral-500">Update status unavailable.</div>
                      )
                    ) : settingsSection !== 'General' && <div><div className="text-neutral-500 mb-1">Status</div><div className="text-neutral-200">Configured surface</div></div>}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
