import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Send, Bot } from 'lucide-react';
import { useShell } from '../contexts/ShellContext';

export function AIAssistantPanel() {
  const { setAIAssistantOpen, addNotification, activeVm, activeMode } = useShell();
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: `Hi! I am your Workspace AI. I can see you are currently in ${activeMode} mode on ${activeVm?.name || 'the dashboard'}. How can I help you optimize your session today?` }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate AI thinking and acting
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: 'I have analyzed your request. As a frontend prototype, I can read your intent but backend execution is mocked. Imagine me seamlessly orchestrating your cloud resources!' }]);
      addNotification({
        title: 'AI Action Completed',
        message: 'Mock action executed successfully.',
        type: 'info'
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[140] pointer-events-none flex justify-end">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-96 h-full bg-neutral-900/95 backdrop-blur-3xl border-l border-white/10 shadow-2xl pointer-events-auto flex flex-col"
      >
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-black/20">
          <div className="flex items-center gap-2 text-purple-400">
            <Bot size={20} />
            <span className="font-medium text-white">Workspace AI</span>
          </div>
          <button 
            onClick={() => setAIAssistantOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-sm' 
                  : 'bg-white/10 text-neutral-200 rounded-bl-sm border border-white/5'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        
        <div className="p-4 border-t border-white/10 bg-black/20">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask AI to do something..."
              className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors shadow-inner"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-purple-400 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
