import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, RotateCw, Home, ShieldCheck, ExternalLink } from 'lucide-react';
import { normalizeBrowserUrl } from './browser107/normalizeBrowserUrl';

const HOME_URL = 'https://example.com';

export function BrowserApp() {
  const [history, setHistory] = useState<string[]>([HOME_URL]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [inputUrl, setInputUrl] = useState(HOME_URL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const url = history[historyIndex] ?? HOME_URL;

  const navigateTo = (rawUrl: string) => {
    let nextUrl: string;
    try {
      nextUrl = normalizeBrowserUrl(rawUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invalid web address.');
      return;
    }

    setError('');
    setHistory((current) => [...current.slice(0, historyIndex + 1), nextUrl]);
    setHistoryIndex((current) => current + 1);
    setInputUrl(nextUrl);
    setIsLoading(true);
  };

  const handleNavigate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateTo(inputUrl);
  };

  const goToHistoryIndex = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= history.length) return;
    setHistoryIndex(nextIndex);
    setInputUrl(history[nextIndex]);
    setError('');
    setIsLoading(true);
  };

  const goHome = () => navigateTo(HOME_URL);

  const refresh = () => {
    setIsLoading(true);
    setReloadKey((current) => current + 1);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white font-sans text-neutral-900">
      <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-100 p-2">
        <button
          type="button"
          aria-label="Back"
          title="Back"
          disabled={historyIndex === 0}
          onClick={() => goToHistoryIndex(historyIndex - 1)}
          className="rounded p-2 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          type="button"
          aria-label="Forward"
          title="Forward"
          disabled={historyIndex >= history.length - 1}
          onClick={() => goToHistoryIndex(historyIndex + 1)}
          className="rounded p-2 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowRight size={16} />
        </button>
        <button type="button" aria-label="Reload" title="Reload" onClick={refresh} className="rounded p-2 hover:bg-neutral-200">
          <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button type="button" aria-label="Home" title="Home" onClick={goHome} className="rounded p-2 hover:bg-neutral-200">
          <Home size={16} />
        </button>
        <form onSubmit={handleNavigate} className="flex min-w-0 flex-1 items-center rounded-full border border-neutral-300 bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500">
          <ShieldCheck size={14} className="mr-2 shrink-0 text-emerald-600" aria-label="Restricted web navigation" />
          <input
            aria-label="Web address"
            autoComplete="url"
            spellCheck={false}
            value={inputUrl}
            onChange={(event) => setInputUrl(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            placeholder="Enter a web address"
          />
        </form>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open website in a new browser tab"
          title="Open website externally"
          className="rounded p-2 hover:bg-neutral-200"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      <div className="relative min-h-0 flex-1 bg-neutral-50">
        {error ? (
          <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <ShieldCheck size={28} className="mb-3 text-amber-600" />
            <h3 className="mb-2 text-lg font-semibold">Cannot navigate</h3>
            <p className="max-w-sm text-sm text-neutral-600">{error}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.iframe
              key={url + ':' + reloadKey}
              ref={iframeRef}
              title={`Browser107 preview of ${url}`}
              src={url}
              sandbox="allow-forms allow-scripts"
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoading(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 h-full w-full border-0 bg-white"
            />
          </AnimatePresence>
        )}
      </div>

      <div className="flex min-h-6 items-center justify-between gap-2 border-t border-neutral-200 bg-neutral-100 px-3 py-1 text-[11px] text-neutral-500">
        <span>{isLoading ? 'Loading embedded preview…' : 'Embedded preview'}</span>
        <span className="truncate">Some sites block embedding. This is not yet a standalone browser engine.</span>
      </div>
    </div>
  );
}
