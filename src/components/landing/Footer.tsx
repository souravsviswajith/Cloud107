import React from 'react';
import { Container } from '../common/Container';
import { Cloud } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0A0A0A] py-12">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Cloud size={18} className="text-neutral-500" />
            <span className="font-medium text-sm text-neutral-400 tracking-tight">Cloud 107</span>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              Documentation
            </a>
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
              GitHub
            </a>
          </nav>
          
          <div className="text-sm text-neutral-600">
            v1.1
          </div>
        </div>
      </Container>
    </footer>
  );
}
