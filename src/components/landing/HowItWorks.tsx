import React from 'react';
import { motion } from 'motion/react';
import { Container } from '../common/Container';
import { Section } from '../common/Section';
import { Play, Link2, LayoutGrid, Settings2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Settings2,
      title: 'Configure',
      description: 'Select CPU, GPU, RAM, and Storage',
    },
    {
      icon: Play,
      title: 'Launch',
      description: 'Click to start your workspace instance',
    },
    {
      icon: Link2,
      title: 'Connect',
      description: 'Secure WebRTC connection established',
    },
    {
      icon: LayoutGrid,
      title: 'Work',
      description: 'Interact with your desktop instantly',
    },
  ];

  return (
    <Section className="py-24">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            A seamless experience from click to desktop in seconds.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 relative max-w-4xl mx-auto">
          {/* Connecting lines for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="flex flex-col items-center flex-1 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center mb-6 shadow-xl text-neutral-300">
                  <step.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-400">{step.description}</p>
              </motion.div>

              {/* Arrow for mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden w-px h-12 bg-gradient-to-b from-white/10 to-transparent" />
              )}
            </React.Fragment>
          ))}
        </div>
      </Container>
    </Section>
  );
}
