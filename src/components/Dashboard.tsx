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
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Healthy
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

                <div className="grid grid-cols-2 gap-8">
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
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Nodes</h2>
                <div className="divide-y divide-white/5 border-y border-white/5">
                  {nodes.map((node) => (
                    <button key={node.id} onClick={() => openWorkspace(node, 'desktop')} className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/[0.02]">
                      <span className={`w-2 h-2 rounded-full ${node.status === 'ready' ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                      <span className="text-sm text-neutral-200">{node.name}</span>
                      <span className="text-xs text-neutral-500">{node.status}</span>
                      <span className="text-xs text-neutral-600 ml-auto">Cloud107</span>
                    </button>
                  ))}
                </div>
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
                <p className="text-sm text-neutral-500 mb-6">Open the terminal through an available workspace.</p>
                {readyNode ? (
                  <button onClick={() => openWorkspace(readyNode, 'app')} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-md">Open Terminal</button>
                ) : (
                  <p className="text-sm text-neutral-600">No online node is available.</p>
                )}
              </section>
            )}

            {activeView === 'settings' && (
              <section className="grid grid-cols-[180px_1fr] gap-10">
                <div className="space-y-1">
                  {['General', 'Identity', 'Security', 'Nodes', 'Providers', 'Runtime', 'Updates', 'Storage', 'Network'].map((item) => (
                    <button key={item} className={`w-full text-left px-3 py-1.5 text-sm rounded ${item === 'General' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'}`}>{item}</button>
                  ))}
                  <div className="pt-5 pb-2 text-[10px] uppercase tracking-wider text-neutral-600">Advanced</div>
                  {['Capabilities', 'Policies', 'Schedulers', 'Reconciliation', 'Diagnostics', 'Events', 'Logs'].map((item) => (
                    <button key={item} className="w-full text-left px-3 py-1.5 text-sm rounded text-neutral-500 hover:text-white">{item}</button>
                  ))}
                </div>
                <div>
                  <h2 className="text-lg font-medium mb-6">General Configuration</h2>
                  <div className="space-y-5 text-sm">
                    <div><div className="text-neutral-500 mb-1">Environment Name</div><div className="text-neutral-200">Cloud107</div></div>
                    <div><div className="text-neutral-500 mb-1">Execution</div><div className="text-neutral-200">Local Execution</div></div>
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
