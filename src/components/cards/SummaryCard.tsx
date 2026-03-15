'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CountUp } from '@/components/ui/CountUp';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: number;
  delay?: number;
  prefix?: string;
}

export function SummaryCard({ title, value, icon, color, change, delay = 0, prefix = 'R$\u00A0' }: SummaryCardProps) {
  return (
    <Card className="relative overflow-hidden" delay={delay}>
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-10"
        style={{ backgroundColor: color }}
      />
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[#666666] text-xs font-medium uppercase tracking-wide">{title}</p>
        <p className="text-xl font-bold" style={{ color }}>
          <CountUp end={value} prefix={prefix} />
        </p>
      </div>
    </Card>
  );
}

export function BalanceCard({ balance, income, expense }: { balance: number; income: number; expense: number }) {
  return (
    <motion.div
      className="bg-gradient-to-br from-[#0066FF]/20 to-[#0A0A0A] border border-[#0066FF]/30 rounded-2xl p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,102,255,0.15),_transparent_70%)]" />
      <p className="text-[#A0A0A0] text-sm mb-2">Saldo Atual</p>
      <p className={`text-4xl font-bold mb-6 ${balance >= 0 ? 'text-white' : 'text-[#FF4444]'}`}>
        <CountUp end={balance} prefix="R$\u00A0" />
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[#666666] mb-1">Entradas</p>
          <p className="text-[#00FF88] font-semibold">
            <CountUp end={income} prefix="R$\u00A0" />
          </p>
        </div>
        <div>
          <p className="text-xs text-[#666666] mb-1">Saídas</p>
          <p className="text-[#FF4444] font-semibold">
            <CountUp end={expense} prefix="R$\u00A0" />
          </p>
        </div>
      </div>
    </motion.div>
  );
}
