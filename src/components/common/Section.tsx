import React from 'react';

export function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`py-20 md:py-32 ${className}`}>
      {children}
    </section>
  );
}
