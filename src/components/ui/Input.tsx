'use client';

import { cn } from '@/lib/utils/format';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, prefix, suffix, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm text-[#A0A0A0] font-medium">{label}</label>}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-[#666666] text-sm pointer-events-none">{prefix}</span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg text-white placeholder-[#666666]',
              'focus:outline-none focus:border-[#0066FF] transition-colors duration-200',
              'text-sm py-2.5',
              prefix ? 'pl-8 pr-4' : 'px-4',
              suffix ? 'pr-10' : '',
              error && 'border-[#FF4444]',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-[#666666] text-sm pointer-events-none">{suffix}</span>
          )}
        </div>
        {error && <span className="text-xs text-[#FF4444]">{error}</span>}
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
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-[#A0A0A0] font-medium">{label}</label>}
      <select
        className={cn(
          'w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg text-white',
          'focus:outline-none focus:border-[#0066FF] transition-colors duration-200',
          'text-sm py-2.5 px-4 appearance-none cursor-pointer',
          error && 'border-[#FF4444]',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.icon ? `${opt.icon} ` : ''}{opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-[#FF4444]">{error}</span>}
    </div>
  );
}
