'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, Target, TrendingUp, BarChart2, User, CalendarClock } from 'lucide-react';
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
      <nav className="hidden md:flex flex-col w-16 lg:w-56 bg-[#111111] border-r border-[#2A2A2A] h-screen sticky top-0 py-6 px-2 lg:px-4 gap-1">
        <div className="mb-8 px-2 lg:px-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center text-sm font-bold text-white">F</div>
            <span className="hidden lg:block font-bold text-white text-lg">FinanceApp</span>
          </div>
        </div>
        {navItems.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                active ? 'bg-[#0066FF]/10 text-[#0066FF]' : 'text-[#666666] hover:text-white hover:bg-[#1F1F1F]'
              )}
            >
              {active && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#0066FF] rounded-full"
                  layoutId="activeIndicator"
                />
              )}
              <item.icon size={18} />
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#2A2A2A] z-40 px-2 py-2 safe-area-bottom">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all',
                  active ? 'text-[#0066FF]' : 'text-[#666666]'
                )}
              >
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
