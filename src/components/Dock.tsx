import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WindowState } from '../types';

interface AppDefLocal {
  id: string;
  name: string;
  icon: React.ElementType; // Using ElementType for the lucide-react icon component reference
  color: string;
}

interface DockProps {
  apps: AppDefLocal[];
  windows: WindowState[];
  activeWindowId: string | null;
  onOpenApp: (appId: string) => void;
}

export function Dock({ apps, windows, activeWindowId, onOpenApp }: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getScale = (index: number) => {
    if (hoveredIndex === null) return 1;
    const distance = Math.abs(hoveredIndex - index);
    if (distance === 0) return 1.5;
    if (distance === 1) return 1.25;
    if (distance === 2) return 1.1;
    return 1;
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[80]">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-3 py-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex items-end gap-3 h-[72px]"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {apps.map((app, idx) => {
          const isOpen = windows.some((w) => w.appId === app.id);
          const isActive =
            activeWindowId && windows.find((w) => w.id === activeWindowId)?.appId === app.id;

          return (
            <motion.button
              key={`dock-${app.id}`}
              onClick={() => onOpenApp(app.id)}
              onMouseEnter={() => setHoveredIndex(idx)}
              animate={{
                scale: getScale(idx),
                y: hoveredIndex === idx ? -10 : 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative flex flex-col items-center justify-end h-full origin-bottom"
              style={{ width: 48 }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 border border-white/20 shadow-lg ${app.color}`}
              >
                <app.icon size={28} className="drop-shadow-md" />
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-10 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] rounded border border-white/10 whitespace-nowrap"
                  >
                    {app.name}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Running Indicator */}
              <div className="absolute -bottom-1.5 w-full flex justify-center">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${isOpen ? (isActive ? 'w-2 bg-white' : 'w-1 bg-white/50') : 'w-0'}`}
                />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
