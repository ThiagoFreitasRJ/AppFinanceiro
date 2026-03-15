'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({ end, duration = 1500, prefix = '', suffix = '', decimals = 2, className }: CountUpProps) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease out
      setValue(eased * end);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [end, duration]);

  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return <span className={className}>{prefix}{formatted}{suffix}</span>;
}
