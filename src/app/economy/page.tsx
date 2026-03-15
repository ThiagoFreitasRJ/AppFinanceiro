'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subMonths, startOfMonth, endOfMonth, format, getDaysInMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EconomyPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { transactions } = useTransactions(user?.id);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const monthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    const income = monthTxs.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);
    return {
      month: format(date, 'MMM', { locale: ptBR }),
      economia: income - expense,
      entradas: income,
      saidas: expense,
    };
  });

  const currentMonthData = monthlyData[monthlyData.length - 1];
  const prevMonthData = monthlyData[monthlyData.length - 2];
  const savingsRate = currentMonthData.entradas > 0
    ? (currentMonthData.economia / currentMonthData.entradas) * 100
    : 0;
  const goal = profile?.savings_goal || 0;
  const goalProgress = goal > 0 ? Math.min(100, (currentMonthData.economia / goal) * 100) : 0;

  const bestMonth = monthlyData.reduce((best, m) => m.economia > best.economia ? m : best, monthlyData[0]);
  const avgSavings = monthlyData.reduce((s, m) => s + m.economia, 0) / monthlyData.length;

  const daysInMonth = getDaysInMonth(new Date());
  const today = new Date().getDate();
  const daysLeft = daysInMonth - today;
  const dailyRate = today > 0 ? currentMonthData.economia / today : 0;
  const projectedSavings = dailyRate * daysInMonth;

  const diffVsPrev = currentMonthData.economia - prevMonthData.economia;

  // Insights
  const insights: { type: 'success' | 'warning' | 'info'; text: string }[] = [];
  if (prevMonthData.saidas > 0 && currentMonthData.saidas < prevMonthData.saidas) {
    const diff = ((prevMonthData.saidas - currentMonthData.saidas) / prevMonthData.saidas * 100).toFixed(0);
    insights.push({ type: 'success', text: `Você gastou ${diff}% menos que o mês passado 🎉` });
  }
  if (prevMonthData.saidas > 0 && currentMonthData.saidas > prevMonthData.saidas) {
    const diff = ((currentMonthData.saidas - prevMonthData.saidas) / prevMonthData.saidas * 100).toFixed(0);
    insights.push({ type: 'warning', text: `Seus gastos aumentaram ${diff}% vs mês passado ⚠️` });
  }
  if (goal > 0 && currentMonthData.economia >= goal) {
    insights.push({ type: 'success', text: 'Você bateu sua meta de economia este mês! 🏆' });
  }
  if (projectedSavings > currentMonthData.economia) {
    insights.push({ type: 'info', text: `Projeção: você vai economizar ${formatCurrency(projectedSavings)} este mês 📊` });
  }

  const insightColors = {
    success: { bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    warning: { bg: 'bg-amber-500/8', border: 'border-amber-500/20', text: 'text-amber-400' },
    info: { bg: 'bg-blue-500/8', border: 'border-blue-500/20', text: 'text-blue-400' },
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-7">
        <div>
          <h1 className="text-2xl font-bold text-white">Economia</h1>
          <p className="text-[#475569] text-sm mt-1">Acompanhe sua evolução financeira</p>
        </div>

        {/* This month summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5 md:col-span-1">
            <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Economia do Mês</p>
            <p className={`text-xl font-bold font-mono-numbers ${currentMonthData.economia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(currentMonthData.economia)}
            </p>
          </div>
          <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5">
            <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Taxa de Poupança</p>
            <p className="text-xl font-bold text-blue-400 font-mono-numbers">{savingsRate.toFixed(1)}%</p>
          </div>
          <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5">
            <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Dias Restantes</p>
            <p className="text-xl font-bold text-white font-mono-numbers">{daysLeft}</p>
          </div>
          <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5">
            <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Projeção</p>
            <p className={`text-xl font-bold font-mono-numbers ${projectedSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(projectedSavings)}
            </p>
          </div>
        </div>

        {/* Goal Progress */}
        {goal > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[#e2e8f0] text-sm">Meta de Economia Mensal</h3>
                <p className="text-xs text-[#475569] mt-0.5">{goalProgress.toFixed(1)}% alcançado</p>
              </div>
              <span className="text-sm text-blue-400 font-semibold font-mono-numbers">{formatCurrency(goal)}</span>
            </div>
            <ProgressBar value={goalProgress} color="#3b82f6" height={10} />
            <div className="flex justify-between mt-2.5">
              <span className="text-sm text-emerald-400 font-mono-numbers font-medium">{formatCurrency(Math.max(0, currentMonthData.economia))}</span>
              <span className="text-xs text-[#475569] font-mono-numbers">{formatCurrency(goal)}</span>
            </div>
          </Card>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            {insights.map((insight, i) => {
              const c = insightColors[insight.type];
              return (
                <motion.div
                  key={i}
                  className={`rounded-xl p-4 border ${c.bg} ${c.border}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <p className={`text-sm ${c.text}`}>{insight.text}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Monthly Chart */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#e2e8f0] text-sm">Histórico dos Últimos 12 Meses</h3>
              <p className="text-xs text-[#475569] mt-0.5">Economia mensal</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e32" vertical={false} />
              <XAxis dataKey="month" stroke="#334155" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#334155" tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Economia']}
                contentStyle={{ background: '#0f0f1a', border: '1px solid #1e1e32', borderRadius: 12, color: '#e2e8f0' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="economia" radius={[6, 6, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.economia >= 0 ? '#3b82f6' : '#ef4444'}
                    fillOpacity={index === monthlyData.length - 1 ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Melhor Mês</p>
            <p className="text-xl font-bold text-emerald-400 font-mono-numbers">{formatCurrency(bestMonth.economia)}</p>
            <p className="text-xs text-[#475569] mt-1 capitalize">{bestMonth.month}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Média Mensal</p>
            <p className={`text-xl font-bold font-mono-numbers ${avgSavings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatCurrency(avgSavings)}
            </p>
            <p className="text-xs text-[#475569] mt-1">12 meses</p>
          </Card>
          <Card>
            <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">vs Mês Anterior</p>
            <div className={`flex items-center gap-1 ${diffVsPrev >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {diffVsPrev > 0 ? <TrendingUp size={14} /> : diffVsPrev < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
              <p className="text-xl font-bold font-mono-numbers">
                {diffVsPrev >= 0 ? '+' : ''}{formatCurrency(diffVsPrev)}
              </p>
            </div>
            <p className="text-xs text-[#475569] mt-1">variação</p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
