import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';

const steps = [
  'Reserving Compute',
  'Allocating Resources',
  'Starting Workspace',
  'Configuring Network',
  'Preparing Applications',
];

export function ProvisioningScreen() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // 5 steps, 1 second each roughly.
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < steps.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full px-6">
        <h2 className="text-2xl font-semibold text-white mb-8 text-center tracking-tight">Provisioning Workspace</h2>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const isPending = index > activeStep;

            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-4 p-4 rounded-xl border ${isActive ? 'bg-white/5 border-white/10' : 'border-transparent'}`}
              >
                <div className={`w-6 h-6 flex items-center justify-center rounded-full ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-neutral-500'}`}>
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isActive ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                  )}
                </div>
                <span className={`text-sm font-medium ${isCompleted ? 'text-neutral-300' : isActive ? 'text-white' : 'text-neutral-500'}`}>
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: activeStep >= steps.length ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8 text-center text-sm font-medium text-blue-400 flex items-center justify-center gap-2"
        >
          <Loader2 size={16} className="animate-spin" />
          Connecting...
        </motion.div>
      </div>
    </div>
  );
}
