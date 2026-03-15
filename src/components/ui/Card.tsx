'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/format';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  onClick?: () => void;
  animate?: boolean;
  delay?: number;
}

export function Card({ children, className, glass, hover, onClick, animate = true, delay = 0 }: CardProps) {
  const base = cn(
    'rounded-xl border border-[#2A2A2A] p-4',
    glass ? 'bg-[rgba(255,255,255,0.03)] backdrop-blur-sm' : 'bg-[#111111]',
    hover && 'cursor-pointer transition-all duration-300 hover:border-[#0066FF]/40 hover:bg-[#1A1A1A]',
    className
  );

  if (!animate) return <div className={base} onClick={onClick}>{children}</div>;

  return (
    <motion.div
      className={base}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      whileHover={hover ? { scale: 1.01 } : undefined}
    >
      {children}
    </motion.div>
  );
}
