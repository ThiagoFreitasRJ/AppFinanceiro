import { cn } from '@/lib/utils/format';
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({ children, color = '#0066FF', className, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        className
      )}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: 'paid' | 'overdue' | 'upcoming' | 'normal' }) {
  const config = {
    paid: { color: '#00FF88', icon: '🟢', label: 'Pago' },
    overdue: { color: '#FF4444', icon: '🔴', label: 'Vencido' },
    upcoming: { color: '#FFAA00', icon: '🟡', label: 'Vence em breve' },
    normal: { color: '#A0A0A0', icon: '⚪', label: 'Pendente' },
  };
  const { color, icon, label } = config[status];
  return <Badge color={color}>{icon} {label}</Badge>;
}
