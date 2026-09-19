import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { WorkspacePreview } from '../components/landing/WorkspacePreview';
import { PlatformFeatures } from '../components/landing/PlatformFeatures';
import { FeatureCards } from '../components/landing/FeatureCards';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Footer } from '../components/landing/Footer';

export function LandingPage({ onLaunch, launchState = 'idle' }: { onLaunch: () => void, launchState?: string }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-blue-500/30 selection:text-white">
      <Navbar onLaunch={onLaunch} launchState={launchState} />
      <main>
        <Hero onLaunch={onLaunch} launchState={launchState} />
        <WorkspacePreview />
        <FeatureCards />
        <PlatformFeatures />
        <HowItWorks />
        <FinalCTA onLaunch={onLaunch} launchState={launchState} />
      </main>
      <Footer />
    </div>
  );
}
