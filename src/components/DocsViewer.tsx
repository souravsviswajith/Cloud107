import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { documents } from '../docs';
import { FileText, CheckCircle, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocsViewerProps {
  onApprove: () => void;
}

export function DocsViewer({ onApprove }: DocsViewerProps) {
  const [activeDoc, setActiveDoc] = useState(documents[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const currentDoc = documents.find((doc) => doc.id === activeDoc) || documents[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-200 flex font-sans">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-[#111111] border-r border-white/10 h-screen sticky top-0 overflow-y-auto z-10"
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <FileText size={18} />
                  </div>
                  <h1 className="font-semibold text-lg tracking-tight text-white">Cloud 107</h1>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 text-neutral-500 hover:text-neutral-300 hover:bg-white/10 rounded-md"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Architecture Blueprints
              </div>

              <nav className="flex-1 space-y-1">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${
                      activeDoc === doc.id
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                    }`}
                  >
                    <span className="truncate">{doc.title}</span>
                    {activeDoc === doc.id && <ChevronRight size={16} className="text-blue-400" />}
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <h3 className="text-sm font-semibold text-amber-400 mb-2">Design Ready</h3>
                <p className="text-xs text-amber-500/80 mb-3">
                  Click below to proceed to the application dashboard.
                </p>
                <button 
                  onClick={onApprove}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-[#0A0A0A] rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Approve Design & Start
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-10 lg:p-12">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mb-8 p-2 text-neutral-400 hover:bg-white/5 rounded-md transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Menu size={20} />
              <span>Show Documents</span>
            </button>
          )}

          <motion.div
            key={currentDoc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="prose prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-400 prose-img:rounded-xl"
          >
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentDoc.content}</ReactMarkdown>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
