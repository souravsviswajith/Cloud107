import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LandingPage } from '../pages/LandingPage';
import { ProvisioningScreen } from './launch/ProvisioningScreen';
import { ConnectionScreen } from './launch/ConnectionScreen';
import { Desktop } from './launch/Desktop';

type LaunchState = 'idle' | 'provisioning' | 'connecting' | 'desktop';

export function LaunchExperience() {
  const [launchState, setLaunchState] = useState<LaunchState>('idle');

  const handleLaunch = () => {
    setLaunchState('provisioning');
  };

  useEffect(() => {
    if (launchState === 'provisioning') {
      // Provisioning takes 6 seconds (6 steps, 1s each roughly)
      const timer = setTimeout(() => {
        setLaunchState('connecting');
      }, 6500);
      return () => clearTimeout(timer);
    } else if (launchState === 'connecting') {
      // Connecting takes 1.5 seconds
      const timer = setTimeout(() => {
        setLaunchState('desktop');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [launchState]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans overflow-hidden relative">
      <AnimatePresence mode="wait">
        {launchState === 'idle' && (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <LandingPage onLaunch={handleLaunch} launchState={launchState} />
          </motion.div>
        )}

        {launchState === 'provisioning' && (
          <motion.div
            key="provisioning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <ProvisioningScreen />
          </motion.div>
        )}

        {launchState === 'connecting' && (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <ConnectionScreen />
          </motion.div>
        )}

        {launchState === 'desktop' && (
          <motion.div
            key="desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Desktop />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
