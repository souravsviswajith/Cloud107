import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-white text-black hover:bg-neutral-200',
      secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm',
      ghost: 'text-neutral-400 hover:text-white hover:bg-white/10',
    };

    const sizes = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-5 py-2.5',
      lg: 'text-base px-6 py-3',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';
