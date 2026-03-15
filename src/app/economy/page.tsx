'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  // Insights
  const insights = [];
  if (currentMonthData.saidas < prevMonthData.saidas) {
    const diff = ((prevMonthData.saidas - currentMonthData.saidas) / prevMonthData.saidas * 100).toFixed(0);
    insights.push({ type: 'success', text: `Você gastou ${diff}% menos que o mês passado 🎉` });
  }
  if (currentMonthData.saidas > prevMonthData.saidas) {
    const diff = ((currentMonthData.saidas - prevMonthData.saidas) / prevMonthData.saidas * 100).toFixed(0);
    insights.push({ type: 'warning', text: `Seus gastos aumentaram ${diff}% vs mês passado ⚠️` });
  }
  if (goal > 0 && currentMonthData.economia >= goal) {
    insights.push({ type: 'success', text: 'Você bateu sua meta de economia este mês! 🏆' });
  }
  if (projectedSavings > currentMonthData.economia) {
    insights.push({ type: 'info', text: `Projeção: você vai economizar ${formatCurrency(projectedSavings)} este mês 📊` });
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Economia</h1>
          <p className="text-[#666666] text-sm">Acompanhe sua evolução financeira</p>
        </div>

        {/* This month summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#0066FF]/10 border border-[#0066FF]/20 rounded-xl p-4">
            <p className="text-xs text-[#666666] mb-1">Economia do Mês</p>
            <p className={`text-lg font-bold ${currentMonthData.economia >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
              {formatCurrency(currentMonthData.economia)}
            </p>
          </div>
          <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-xs text-[#666666] mb-1">Taxa de Poupança</p>
            <p className="text-lg font-bold text-[#00AAFF]">{savingsRate.toFixed(1)}%</p>
          </div>
          <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-xs text-[#666666] mb-1">Dias Restantes</p>
            <p className="text-lg font-bold text-white">{daysLeft}</p>
          </div>
          <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-4">
            <p className="text-xs text-[#666666] mb-1">Projeção</p>
            <p className={`text-lg font-bold ${projectedSavings >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
              {formatCurrency(projectedSavings)}
            </p>
          </div>
        </div>

        {/* Goal Progress */}
        {goal > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Meta de Economia Mensal</h3>
              <span className="text-sm text-[#0066FF] font-medium">{formatCurrency(goal)}</span>
            </div>
            <ProgressBar value={goalProgress} color="#0066FF" height={12} />
            <div className="flex justify-between mt-2">
              <span className="text-sm text-[#00FF88]">{formatCurrency(Math.max(0, currentMonthData.economia))}</span>
              <span className="text-sm text-[#666666]">{goalProgress.toFixed(1)}%</span>
            </div>
          </Card>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                className={`rounded-xl p-4 border ${
                  insight.type === 'success' ? 'bg-[#00FF88]/10 border-[#00FF88]/20' :
                  insight.type === 'warning' ? 'bg-[#FFAA00]/10 border-[#FFAA00]/20' :
                  'bg-[#0066FF]/10 border-[#0066FF]/20'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <p className={`text-sm ${
                  insight.type === 'success' ? 'text-[#00FF88]' :
                  insight.type === 'warning' ? 'text-[#FFAA00]' :
                  'text-[#00AAFF]'
                }`}>{insight.text}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Monthly Chart */}
        <Card>
          <h3 className="font-semibold text-white text-sm mb-4">Histórico dos Últimos 12 Meses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis dataKey="month" stroke="#666666" tick={{ fontSize: 11, fill: '#666666' }} />
              <YAxis stroke="#666666" tick={{ fontSize: 10, fill: '#666666' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), '']}
                contentStyle={{ background: '#1F1F1F', border: '1px solid #2A2A2A', borderRadius: 8, color: '#fff' }}
              />
              <Bar dataKey="economia" name="Economia" fill="#0066FF" radius={[4, 4, 0, 0]}
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <p className="text-xs text-[#666666] mb-1">Melhor Mês</p>
            <p className="text-lg font-bold text-[#00FF88]">{formatCurrency(bestMonth.economia)}</p>
            <p className="text-xs text-[#666666]">{bestMonth.month}</p>
          </Card>
          <Card>
            <p className="text-xs text-[#666666] mb-1">Média Mensal</p>
            <p className={`text-lg font-bold ${avgSavings >= 0 ? 'text-[#00AAFF]' : 'text-[#FF4444]'}`}>
              {formatCurrency(avgSavings)}
            </p>
            <p className="text-xs text-[#666666]">12 meses</p>
          </Card>
          <Card>
            <p className="text-xs text-[#666666] mb-1">vs Mês Anterior</p>
            <p className={`text-lg font-bold ${currentMonthData.economia >= prevMonthData.economia ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
              {currentMonthData.economia >= prevMonthData.economia ? '+' : ''}
              {formatCurrency(currentMonthData.economia - prevMonthData.economia)}
            </p>
            <p className="text-xs text-[#666666]">variação</p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
