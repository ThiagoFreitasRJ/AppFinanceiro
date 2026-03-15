'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/format';

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ className, rounded }: SkeletonProps) {
  return (
    <motion.div
      className={cn('bg-[#1F1F1F]', rounded ? 'rounded-full' : 'rounded-lg', className)}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="w-10 h-10" rounded />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}
