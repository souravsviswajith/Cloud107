import { useState, useEffect } from 'react';
import {
  Search,
  ArrowLeft,
  Terminal,
  LayoutDashboard,
  Code2,
  Paintbrush,
  Database,
  Box,
  StickyNote,
  Globe,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { VmInstance, Application } from '../types';
import { applicationApi } from '../lib/apiClient';

interface AppLibraryProps {
  vm: VmInstance;
  onBack: () => void;
  onLaunchApp: (app: Application) => void;
}

const categories = ['All', 'Development', 'Creative', 'AI', 'Engineering', 'Utilities'];

const IconMap: Record<string, React.ElementType> = {
  Code2,
  LayoutDashboard,
  Box,
  Paintbrush,
  Terminal,
  Database,
  StickyNote,
  Globe,
};

export function AppLibrary({ vm, onBack, onLaunchApp }: AppLibraryProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const data = await applicationApi.listApplications();
        setApps(data);
      } catch (error) {
        console.error('Failed to fetch applications', error);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || app.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLaunchApp = async (app: Application) => {
    try {
      await applicationApi.launchApplication(app.id, vm.id);
      onLaunchApp(app);
    } catch (error) {
      console.error('Failed to launch application', error);
      alert('Failed to launch application: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-neutral-500 hover:text-neutral-200 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-semibold text-2xl tracking-tight text-white">
                Application Library
              </h1>
              <p className="text-sm text-neutral-400 font-medium">Launching on {vm.name}</p>
            </div>
          </div>

          <div className="relative max-w-sm w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#111111] text-white placeholder-neutral-500 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'bg-[#111111] text-neutral-400 border border-white/10 hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredApps.map((app) => {
                const IconComponent = IconMap[app.icon] || LayoutDashboard;
                const isAvailable = ['Browser', 'Notes', 'Terminal'].includes(app.name);

                return (
                  <motion.button
                    key={app.id}
                    onClick={() => isAvailable && handleLaunchApp(app)}
                    whileHover={{ y: isAvailable ? -2 : 0 }}
                    className={`p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-4 transition-all group ${
                      isAvailable
                        ? 'bg-[#111111] border-white/10 hover:border-blue-500/50 hover:shadow-md cursor-pointer'
                        : 'bg-[#111111]/50 border-white/5 opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                        isAvailable ? 'bg-white/5 group-hover:bg-blue-500/10' : 'bg-white/5'
                      }`}
                    >
                      <IconComponent
                        size={32}
                        className={`transition-colors ${
                          isAvailable
                            ? 'text-neutral-400 group-hover:text-blue-400'
                            : 'text-neutral-600'
                        }`}
                      />
                    </div>
                    <div className="text-center relative w-full flex flex-col items-center">
                      <h3
                        className={`font-medium text-sm ${isAvailable ? 'text-neutral-200' : 'text-neutral-400'}`}
                      >
                        {app.name}
                      </h3>
                      {isAvailable ? (
                        <p className="text-xs text-neutral-500 mt-0.5">{app.category}</p>
                      ) : (
                        <div className="mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-medium text-neutral-400 uppercase tracking-wider">
                          Coming Soon
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {filteredApps.length === 0 && (
              <div className="text-center py-20">
                <p className="text-neutral-500">No applications found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
