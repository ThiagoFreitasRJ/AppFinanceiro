'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { formatCurrency } from '@/lib/utils/format';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CountUp({ end, duration = 1500, prefix = '', suffix = '', decimals = 2, className, style }: CountUpProps) {
  const [value, setValue] = useState(end);
  const startTime = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const prevEnd = useRef(end);

  useEffect(() => {
    if (prevEnd.current === end) return;
    const start = prevEnd.current;
    prevEnd.current = end;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (end - start) * eased);
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
      else setValue(end);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [end, duration]);

  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return <span className={className} style={style}>{prefix}{formatted}{suffix}</span>;
}

// Simple currency display — uses formatCurrency directly (no animation, no hydration issues)
export function CurrencyDisplay({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={className} style={style}>
      {formatCurrency(value)}
    </span>
  );
}
