import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Lock } from 'lucide-react';

export function BrowserApp() {
  const [url, setUrl] = useState('https://example.com');
  const [inputUrl, setInputUrl] = useState('https://example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = (e?: React.FormEvent) => {
    e?.preventDefault();
    let finalUrl = inputUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    // Check if it's likely to be blocked
    if (finalUrl.includes('google.com') || finalUrl.includes('openai.com')) {
      setHasError(true);
      setUrl(finalUrl);
      setInputUrl(finalUrl);
      setIsLoading(false);
      return;
    }

    setHasError(false);
    setUrl(finalUrl);
    setInputUrl(finalUrl);
    setIsLoading(true);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleHome = () => {
    setInputUrl('https://example.com');
    setUrl('https://example.com');
    setHasError(false);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      // Basic refresh simulation
      setIsLoading(true);
      const currentUrl = url;
      setUrl('');
      setTimeout(() => setUrl(currentUrl), 50);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-black overflow-hidden font-sans">
      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-2 bg-neutral-200 border-b border-neutral-300">
        <button className="p-1.5 rounded hover:bg-neutral-300 text-neutral-600">
          <ArrowLeft size={16} />
        </button>
        <button className="p-1.5 rounded hover:bg-neutral-300 text-neutral-600">
          <ArrowRight size={16} />
        </button>
        <button
          className="p-1.5 rounded hover:bg-neutral-300 text-neutral-600"
          onClick={handleRefresh}
        >
          <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          className="p-1.5 rounded hover:bg-neutral-300 text-neutral-600"
          onClick={handleHome}
        >
          <Home size={16} />
        </button>

        <form
          onSubmit={handleNavigate}
          className="flex-1 flex items-center bg-white rounded-full border border-neutral-300 px-3 py-1 text-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
        >
          <Lock size={12} className="text-emerald-600 mr-2" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          />
        </form>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-white">
        <AnimatePresence mode="wait">
          {hasError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-neutral-50"
            >
              <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mb-4">
                <Lock size={24} className="text-neutral-500" />
              </div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">Refused to Connect</h3>
              <p className="text-neutral-500 text-sm mb-6 max-w-sm">
                The destination website prevents embedding due to its security policy
                (X-Frame-Options).
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Open in New Tab
              </a>
            </motion.div>
          ) : (
            url && (
              <motion.iframe
                key="iframe"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0.3 : 1 }}
                transition={{ duration: 0.3 }}
                ref={iframeRef}
                src={url}
                className="absolute inset-0 w-full h-full border-none bg-white"
                onLoad={handleLoad}
                title="Browser Content"
              />
            )
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#f3f4f6] border-t border-neutral-200 px-3 flex items-center text-[11px] text-neutral-500">
        {isLoading ? 'Waiting for response...' : 'Done'}
      </div>
    </div>
  );
}
