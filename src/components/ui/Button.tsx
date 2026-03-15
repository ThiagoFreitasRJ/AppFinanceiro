'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/format';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-[#0066FF] hover:bg-[#0052CC] text-white',
  secondary: 'bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A]',
  ghost: 'bg-transparent hover:bg-[#1F1F1F] text-[#A0A0A0] hover:text-white',
  danger: 'bg-[#FF4444]/10 hover:bg-[#FF4444]/20 text-[#FF4444] border border-[#FF4444]/20',
  success: 'bg-[#00FF88]/10 hover:bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ children, className, variant = 'primary', size = 'md', onClick, type = 'button', disabled, loading, fullWidth }: ButtonProps) {
  return (
    <motion.button
      className={cn(
        'rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  );
}
