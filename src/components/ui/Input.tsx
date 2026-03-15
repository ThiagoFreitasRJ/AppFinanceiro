'use client';

import { cn } from '@/lib/utils/format';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, prefix, suffix, hint, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm text-[#94a3b8] font-medium">{label}</label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3.5 text-[#475569] text-sm pointer-events-none font-medium">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#0f0f1a] border border-[#1e1e32] rounded-xl text-white placeholder-[#334155]',
              'focus:outline-none focus:border-blue-500/50 focus:bg-[#0f0f1a] focus:ring-1 focus:ring-blue-500/20',
              'transition-all duration-200 text-sm py-2.5 font-medium',
              prefix ? 'pl-10 pr-4' : 'px-4',
              suffix ? 'pr-10' : '',
              error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-[#475569] text-sm pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {hint && !error && <span className="text-xs text-[#475569]">{hint}</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; icon?: string }>;
}

export function Select({ label, error, className, options, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-[#94a3b8] font-medium">{label}</label>}
      <select
        className={cn(
          'w-full bg-[#0f0f1a] border border-[#1e1e32] rounded-xl text-white',
          'focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20',
          'transition-all duration-200 text-sm py-2.5 px-4 appearance-none cursor-pointer',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#0f0f1a]">
            {opt.icon ? `${opt.icon} ` : ''}{opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
