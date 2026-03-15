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
  glow?: 'blue' | 'green' | 'red' | 'purple';
}

const glowMap = {
  blue: 'shadow-blue-500/10 border-blue-500/20 hover:border-blue-500/30',
  green: 'shadow-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/30',
  red: 'shadow-red-500/10 border-red-500/20 hover:border-red-500/30',
  purple: 'shadow-purple-500/10 border-purple-500/20 hover:border-purple-500/30',
};

export function Card({ children, className, glass, hover, onClick, animate = true, delay = 0, glow }: CardProps) {
  const base = cn(
    'rounded-2xl border p-5 transition-all duration-300',
    glass
      ? 'bg-[rgba(15,15,26,0.7)] backdrop-blur-xl border-white/[0.05]'
      : 'bg-[#0f0f1a] border-[#1e1e32]',
    hover && 'cursor-pointer hover:border-[#2a2a45] hover:bg-[#121220] hover:-translate-y-0.5 hover:shadow-xl',
    glow && `shadow-lg ${glowMap[glow]}`,
    className
  );

  if (!animate) return <div className={base} onClick={onClick}>{children}</div>;

  return (
    <motion.div
      className={base}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { scale: 1.01 } : undefined}
    >
      {children}
    </motion.div>
  );
}
