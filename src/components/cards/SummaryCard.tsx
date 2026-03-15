'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/CountUp';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
  change?: number;
  delay?: number;
}

export function SummaryCard({ title, value, icon, color, bgColor, change, delay = 0 }: SummaryCardProps) {
  return (
    <motion.div
      className="relative bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5 overflow-hidden hover:border-[#2a2a45] transition-all duration-300 hover:-translate-y-0.5 group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Background glow */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500"
        style={{ backgroundColor: color, filter: 'blur(20px)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: bgColor }}
          >
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
              change >= 0
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            }`}>
              {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>

        <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-1.5">{title}</p>
        <CurrencyDisplay value={value} className="text-xl font-bold font-mono-numbers" style={{ color }} />
      </div>
    </motion.div>
  );
}

export function BalanceCard({ balance, income, expense }: { balance: number; income: number; expense: number }) {
  return (
    <motion.div
      className="relative bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-7 overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.07] via-transparent to-purple-500/[0.04]" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/[0.07] rounded-full blur-3xl" />

      <div className="relative z-10">
        <p className="text-sm text-[#475569] font-medium mb-2">Saldo Atual</p>
        <div className={`text-4xl md:text-5xl font-bold mb-6 font-mono-numbers tracking-tight ${
          balance >= 0 ? 'text-white' : 'text-red-400'
        }`}>
          <CurrencyDisplay value={balance} />
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-emerald-500 rounded-full" />
            <div>
              <p className="text-[11px] text-[#475569] font-medium uppercase tracking-wide">Entradas</p>
              <CurrencyDisplay value={income} className="text-sm font-bold text-emerald-400 font-mono-numbers" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-red-500 rounded-full" />
            <div>
              <p className="text-[11px] text-[#475569] font-medium uppercase tracking-wide">Saídas</p>
              <CurrencyDisplay value={expense} className="text-sm font-bold text-red-400 font-mono-numbers" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
