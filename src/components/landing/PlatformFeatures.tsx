import React from 'react';

import { Code2, Cloud, CheckCircle2 } from 'lucide-react';
import { Container } from '../common/Container';
import { Section } from '../common/Section';

const ecosystemFeatures = [
  { name: 'Sovereign Infrastructure & Auth', items: ['WebAuthn / FIDO2', 'Cloud107 Identity', 'Self-Hosted Storage', 'S3-Compatible Storage', 'Local Secret Vault', 'c107 CLI', 'Audit Logging', 'WireGuard VPN'] },
  { name: 'Cloud Platform Support', items: ['Google Cloud', 'AWS', 'Microsoft Azure', 'Cloudflare', 'DigitalOcean', 'Oracle Cloud', 'Self-Hosted Servers'] },
  { name: 'AI Integration', items: ['Google AI Studio', 'Gemini API', 'Vertex AI', 'OpenAI API', 'Anthropic API', 'Ollama', 'OpenRouter'] },
];

const managedFeatures = [
  { name: 'Supported Languages', items: ['Python', 'Java', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'C', 'C++', 'C#', 'PHP', 'Kotlin', 'Swift', 'Ruby'] },
  { name: 'Frameworks', items: ['React', 'Next.js', 'Vue', 'Angular', 'Express', 'NestJS', 'ASP.NET Core', 'Django', 'Flask', 'Spring Boot', 'Flutter'] },
  { name: 'Developer Tools', items: ['VS Code', 'Terminal', 'Git', 'GitHub CLI', 'c107 CLI', 'Google Cloud CLI', 'AWS CLI', 'Docker', 'Kubernetes'] },
];

const benefits = [
  'Ready-to-code Environment',
  'Managed Infrastructure Benefits',
  'Developer Experience',
  'No manual setup required',
  'Automatic updates and backups',
  'Collaborative features',
  'Pre-configured AI integration',
  'Zero vendor lock-in'
];

export function PlatformFeatures() {
  return (
    <Section className="py-16 md:py-24 bg-[#0a0a0a]">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">Complete Developer Ecosystem</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Everything you need to build, test, and deploy applications, integrated into the Cloud107 control plane.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div className="bg-[#111111] border border-white/5 p-8 md:p-10 rounded-3xl shadow-sm">
            <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
              <Cloud size={24} className="text-blue-400" /> Infrastructure & Services
            </h3>
            <div className="space-y-8">
              {ecosystemFeatures.map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-medium text-neutral-300 mb-4">{category.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map(item => (
                      <span key={item} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-neutral-400">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-white/5 p-8 md:p-10 rounded-3xl shadow-sm">
            <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-3">
              <Code2 size={24} className="text-emerald-400" /> Built-in Technologies
            </h3>
            <div className="space-y-8">
              {managedFeatures.map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-medium text-neutral-300 mb-4">{category.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map(item => (
                      <span key={item} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-neutral-400">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-blue-500/5 border border-blue-500/20 p-8 rounded-3xl">
          <h3 className="text-lg font-semibold text-white mb-6 text-center">Cloud107 Operating Model</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {benefits.map(benefit => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-blue-400 shrink-0" />
                <span className="text-sm text-neutral-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
