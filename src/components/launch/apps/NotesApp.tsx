import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, RefreshCcw, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List } from 'lucide-react';

const DEFAULT_DOC = `# Welcome to Cloud 107
This is a browser-based cloud desktop prototype.

Demo Highlights
• Interactive Notes
• Interactive Terminal
• Minimal Browser
• Window Management
• Cloud 107 Architecture

Quick Start
1. Edit this document.
2. Open Terminal.
3. Type "help".
4. Open Browser.
5. Explore the workspace.

Enjoy the demo.`;

type SaveState = 'saved' | 'unsaved' | 'saving';

export function NotesApp() {
  const [content, setContent] = useState(DEFAULT_DOC);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [cursorLn, setCursorLn] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  const updateCursorPosition = () => {
    if (textareaRef.current) {
      const pos = textareaRef.current.selectionStart;
      const textUpToCursor = content.substring(0, pos);
      const lines = textUpToCursor.split('\n');
      setCursorLn(lines.length);
      setCursorCol(lines[lines.length - 1].length + 1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaveState('unsaved');
    updateCursorPosition();
  };

  useEffect(() => {
    // Auto-focus on mount
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(0, 0);
      updateCursorPosition();
    }
  }, []);

  useEffect(() => {
    if (saveState === 'unsaved') {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        setSaveState('saving');
        setTimeout(() => {
          setSaveState('saved');
        }, 1000); 
      }, 1500); 
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [saveState, content]);

  return (
    <div className="flex flex-col h-full bg-[#111111] text-neutral-300 font-sans" onClick={() => textareaRef.current?.focus()}>
      {/* Top Toolbar */}
      <div className="h-12 border-b border-white/5 bg-neutral-900/50 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Bold size={14} /></button>
          <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Italic size={14} /></button>
          <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Underline size={14} /></button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><AlignLeft size={14} /></button>
          <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><AlignCenter size={14} /></button>
          <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><AlignRight size={14} /></button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><List size={14} /></button>
        </div>
        
        {/* Save Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
          <AnimatePresence mode="wait">
            {saveState === 'unsaved' && (
              <motion.div key="unsaved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-1.5 text-amber-400/80">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                Unsaved
              </motion.div>
            )}
            {saveState === 'saving' && (
              <motion.div key="saving" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-1.5 text-blue-400">
                <RefreshCcw size={12} className="animate-spin" />
                Saving
              </motion.div>
            )}
            {saveState === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-1.5 text-neutral-400">
                <Check size={12} />
                Saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyUp={updateCursorPosition}
        onMouseUp={updateCursorPosition}
        onFocus={updateCursorPosition}
        className="flex-1 w-full bg-transparent p-6 outline-none resize-none overflow-y-auto leading-relaxed text-sm font-sans tracking-wide selection:bg-blue-500/30 text-neutral-200"
        spellCheck={false}
      />
      
      {/* Bottom Status Bar */}
      <div className="h-6 bg-black/20 text-neutral-500 flex items-center justify-end px-4 text-[10px] font-medium uppercase tracking-widest select-none flex-shrink-0 gap-6 border-t border-white/5">
        <span>Ln {cursorLn}, Col {cursorCol}</span>
        <span>{words} WORDS</span>
        <span>{chars} CHARS</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
