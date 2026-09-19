import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VmInstance, WorkspaceMode, Application, Notification} from '../types';

interface ShellContextType {
  activeMode: WorkspaceMode;
  setActiveMode: (mode: WorkspaceMode) => void;
  activeVm: VmInstance | null;
  setActiveVm: (vm: VmInstance | null) => void;
  activeApp: Application | null;
  setActiveApp: (app: Application | null) => void;
  
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  isNotificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  
  isAIAssistantOpen: boolean;
  setAIAssistantOpen: (open: boolean) => void;
  
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [activeMode, setActiveMode] = useState<WorkspaceMode>('dashboard');
  const [activeVm, setActiveVm] = useState<VmInstance | null>(null);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isAIAssistantOpen, setAIAssistantOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + Space or Ctrl + K for Command Palette
      if ((e.ctrlKey && e.shiftKey && e.code === 'Space') || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <ShellContext.Provider value={{
      activeMode, setActiveMode,
      activeVm, setActiveVm,
      activeApp, setActiveApp,
      isCommandPaletteOpen, setCommandPaletteOpen,
      isNotificationsOpen, setNotificationsOpen,
      isAIAssistantOpen, setAIAssistantOpen,
      notifications, addNotification, markNotificationRead, clearNotifications
    }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  const context = useContext(ShellContext);
  if (context === undefined) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
}
