import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  MonitorPlay,
  ShieldCheck,
  Settings2,
  Activity,
  Gauge,
  AppWindow,
  Server,
} from 'lucide-react';
import { Container } from '../common/Container';
import { Section } from '../common/Section';

export function FeatureCards() {
  const features = [
    {
      icon: Zap,
      title: 'Launch in Seconds',
      description: 'Instant provisioning. No waiting for instances to boot.',
    },
    {
      icon: MonitorPlay,
      title: 'Browser-Based Environment',
      description:
        'Full graphical environment rendering directly in your tab without installation.',
    },
    {
      icon: ShieldCheck,
      title: 'Policy-Bound Environment',
      description: 'Isolated environments protecting your data and privacy.',
    },
    {
      icon: Settings2,
      title: 'Declare Resources Before Launch',
      description:
        'Tailor your CPU, GPU, RAM, and Storage exactly to your workload needs before booting.',
    },
    {
      icon: Activity,
      title: 'Live Resource Monitoring',
      description:
        'Track real-time CPU, Memory, GPU, Storage, and Network usage with low-latency telemetry.',
    },
    {
      icon: Gauge,
      title: 'Observed Resource State',
      description:
        'Inspect live CPU, memory, GPU, storage, network, runtime, and health state from the control plane.',
    },
    {
      icon: AppWindow,
      title: 'Application Runtime',
      description: 'Access a curated library of pre-installed developer and creative applications.',
    },
    {
      icon: Server,
      title: 'Provider-Agnostic Control',
      description: 'Run your workspaces on any cloud infrastructure without vendor lock-in.',
    },
  ];

  return (
    <Section className="py-12 bg-neutral-950/50">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-8 rounded-2xl bg-[#111111] border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-medium text-white mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
