import React from 'react';
import { motion } from 'motion/react';
import { Container } from '../common/Container';
import { Section } from '../common/Section';
import { Button } from '../common/Button';

export function Hero({ onLaunch, launchState = 'idle' }: { onLaunch: () => void, launchState?: string }) {
  const isLaunching = launchState !== 'idle';
  
  return (
    <Section className="pt-40 md:pt-52 pb-12 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-6 leading-tight">
            Infrastructure Under Your Control. <br className="hidden sm:block" />
            <span className="text-neutral-400">Nodes, Workloads, Runtimes.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Operate environments through a unified control plane.<br className="hidden md:block" />
            Discover nodes, schedule workloads, manage runtimes, and observe state from one surface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg" className="w-full sm:w-auto" onClick={onLaunch} disabled={isLaunching}>
              {isLaunching ? 'Launching...' : 'Launch Demo'}
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Create Environment
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
