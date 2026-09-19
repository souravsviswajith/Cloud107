import React from 'react';
import { motion } from 'motion/react';
import { Container } from '../common/Container';
import { Section } from '../common/Section';
import { Button } from '../common/Button';

export function FinalCTA({ onLaunch, launchState = 'idle' }: { onLaunch: () => void, launchState?: string }) {
  const isLaunching = launchState !== 'idle';
  
  return (
    <Section className="py-24 md:py-32 bg-gradient-to-b from-transparent to-[#0A0A0A] border-t border-white/5 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-blue-500/5 blur-[150px] pointer-events-none" />
      
      <Container className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-8 leading-tight">
            Ready to operate your <br className="hidden sm:block" /> first environment?
          </h2>
          
          <Button variant="primary" size="lg" className="mb-10 px-8" onClick={onLaunch} disabled={isLaunching}>
            {isLaunching ? 'Launching...' : 'Launch Demo'}
          </Button>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-neutral-500 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              No installation.
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              No setup.
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              No mandatory platform intermediary.
            </span>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
