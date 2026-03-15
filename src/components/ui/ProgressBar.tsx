'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/format';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  className?: string;
  animated?: boolean;
  showLabel?: boolean;
}

export function ProgressBar({ value, color = '#3b82f6', height = 8, className, animated = true, showLabel }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('relative', className)}>
      <div
        className="w-full rounded-full bg-[#1e1e32] overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={animated ? { width: '0%' } : undefined}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', type: 'spring', stiffness: 45 }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-[#475569] -mt-4">
          {clampedValue.toFixed(0)}%
        </span>
      )}
    </div>
  );
}

export function XPBar({ xp, maxXp, level }: { xp: number; maxXp: number; level: number }) {
  const progress = (xp / maxXp) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-blue-400 font-bold min-w-[40px]">Nv.{level}</span>
      <div className="flex-1">
        <ProgressBar value={progress} color="#3b82f6" height={5} />
      </div>
      <span className="text-xs text-[#475569] min-w-[80px] text-right font-mono-numbers">{xp}/{maxXp} XP</span>
    </div>
  );
}
