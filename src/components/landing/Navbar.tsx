import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Container } from '../common/Container';
import { Button } from '../common/Button';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar({
  onLaunch,
  launchState = 'idle',
}: {
  onLaunch: () => void;
  launchState?: string;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLaunching = launchState !== 'idle';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'bg-[#0A0A0A]/80 backdrop-blur-md border-white/10'
          : 'bg-transparent border-transparent'
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src="/assets/cloud107-logo.png"
              alt="Cloud 107"
              className="w-9 h-9 rounded-lg object-cover border border-white/10"
            />
            <span className="font-semibold text-white tracking-tight">Cloud 107</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#"
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Documentation
            </a>
            <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
              Sign In
            </button>
            <Button variant="primary" size="sm" onClick={onLaunch} disabled={isLaunching}>
              {isLaunching ? 'Launching...' : 'Launch Demo'}
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-neutral-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </Container>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-[#0A0A0A] border-b border-white/10"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="#" className="text-sm font-medium text-neutral-300">
                Documentation
              </a>
              <button className="text-sm font-medium text-neutral-300 text-left">Sign In</button>
              <Button
                variant="primary"
                className="w-full mt-2"
                onClick={onLaunch}
                disabled={isLaunching}
              >
                {isLaunching ? 'Launching...' : 'Launch Demo'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
