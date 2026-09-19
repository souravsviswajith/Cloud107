import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useShell } from '../contexts/ShellContext';

export function NotificationsPanel() {
  const { notifications, markNotificationRead } = useShell();

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    const unreadNotifs = notifications.filter(n => !n.read);
    unreadNotifs.forEach(notif => {
      const timer = setTimeout(() => {
        markNotificationRead(notif.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [notifications, markNotificationRead]);

  const visibleNotifications = notifications.filter(n => !n.read);

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none flex flex-col justify-end p-6 pb-20 items-end">
      <div className="w-80 flex flex-col gap-3 pointer-events-auto">
        <AnimatePresence>
          {visibleNotifications.map(notif => {
            const Icon = 
              notif.type === 'success' ? CheckCircle2 :
              notif.type === 'warning' ? AlertTriangle :
              notif.type === 'error' ? XCircle : Info;
              
            const color = 
              notif.type === 'success' ? 'text-emerald-400' :
              notif.type === 'warning' ? 'text-yellow-400' :
              notif.type === 'error' ? 'text-rose-400' : 'text-blue-400';

            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 flex gap-3 relative overflow-hidden"
              >
                <div className="mt-0.5">
                  <Icon size={18} className={color} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-white">{notif.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{notif.message}</p>
                </div>
                <button 
                  onClick={() => markNotificationRead(notif.id)}
                  className="absolute top-2 right-2 p-1 text-neutral-500 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
