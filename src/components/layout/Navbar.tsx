'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ArrowLeftRight, CalendarClock,
  Target, TrendingUp, BarChart2, User
} from 'lucide-react';
import { cn } from '@/lib/utils/format';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
  { href: '/fixed-expenses', icon: CalendarClock, label: 'Fixos' },
  { href: '/goals', icon: Target, label: 'Objetivos' },
  { href: '/stocks', icon: TrendingUp, label: 'Ações' },
  { href: '/economy', icon: BarChart2, label: 'Economia' },
  { href: '/profile', icon: User, label: 'Perfil' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-[#0a0a16] border-r border-[#1e1e32] h-screen sticky top-0 overflow-hidden">
        {/* Logo area */}
        <div className="px-6 py-6 border-b border-[#1e1e32]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/20">
              F
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">FinanceApp</span>
              <p className="text-[10px] text-[#475569] tracking-widest uppercase mt-0.5">Gamificado</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-[#475569] font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  active
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-white/[0.03]'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon
                  size={17}
                  className={active ? 'text-blue-400' : 'text-[#475569] group-hover:text-[#64748b]'}
                />
                <span className="text-sm font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-blue-500/10 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="px-6 py-4 border-t border-[#1e1e32]">
          <p className="text-[10px] text-[#334155] text-center">v1.0.0 · FinanceApp</p>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a16]/95 border-t border-[#1e1e32] backdrop-blur-xl pb-safe">
        <div className="flex justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200',
                  active ? 'text-blue-400' : 'text-[#475569]'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="mobile-indicator"
                    className="absolute inset-0 bg-blue-500/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
