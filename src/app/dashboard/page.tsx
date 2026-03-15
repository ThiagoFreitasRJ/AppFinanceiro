'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMonthTransactions, useTransactions } from '@/lib/hooks/useTransactions';
import { useGoals } from '@/lib/hooks/useGoals';
import { useFixedExpenses } from '@/lib/hooks/useFixedExpenses';
import { AppLayout } from '@/components/layout/AppLayout';
import { BalanceCard, SummaryCard } from '@/components/cards/SummaryCard';
import { TransactionItem } from '@/components/cards/TransactionItem';
import { ExpenseDonut } from '@/components/charts/ExpenseDonut';
import { BalanceAreaChart } from '@/components/charts/BalanceAreaChart';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/lib/utils/format';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { transactions: allTransactions } = useTransactions(user?.id);
  const { income, expense, savings, transactions } = useMonthTransactions(user?.id);
  const { goals } = useGoals(user?.id);
  const { expenses, getStatus, isPaid, totalMonthly } = useFixedExpenses(user?.id);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <AppLayout>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </AppLayout>
    );
  }

  const totalInGoals = goals.filter(g => !g.completed_at).reduce((s, g) => s + g.current_amount, 0);
  const prevMonthExpense = expense * 1.1; // Simplified previous month comparison
  const expenseChange = prevMonthExpense > 0 ? ((expense - prevMonthExpense) / prevMonthExpense) * 100 : 0;

  const upcomingExpenses = expenses
    .filter(e => e.is_active && !isPaid(e.id))
    .filter(e => {
      const status = getStatus(e);
      return status === 'upcoming' || status === 'overdue';
    })
    .slice(0, 3);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-bold text-white">
            Olá, {profile?.name?.split(' ')[0] || 'Usuário'} 👋
          </h1>
          <p className="text-[#666666] text-sm">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </motion.div>

        {/* Balance Card */}
        <BalanceCard balance={income - expense} income={income} expense={expense} />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard title="Entradas" value={income} icon="📈" color="#00FF88" delay={0.1} />
          <SummaryCard title="Saídas" value={expense} icon="📉" color="#FF4444" change={expenseChange} delay={0.2} />
          <SummaryCard title="Economia" value={savings} icon="💰" color="#0066FF" delay={0.3} />
          <SummaryCard title="Em Objetivos" value={totalInGoals} icon="🎯" color="#DDA0DD" delay={0.4} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">Gastos por Categoria</h3>
              <span className="text-xs text-[#666666]">Este mês</span>
            </div>
            <ExpenseDonut transactions={transactions} />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">Evolução do Saldo</h3>
              <span className="text-xs text-[#666666]">6 meses</span>
            </div>
            <BalanceAreaChart transactions={allTransactions} />
          </Card>
        </div>

        {/* Goals Progress + Upcoming */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Goals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">Objetivos Ativos</h3>
              <Link href="/goals" className="text-xs text-[#0066FF] flex items-center gap-1 hover:underline">
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>
            {goals.filter(g => !g.completed_at).slice(0, 3).length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[#666666] text-sm mb-3">Nenhum objetivo criado</p>
                <Link href="/goals" className="text-[#0066FF] text-sm hover:underline">Criar objetivo →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.filter(g => !g.completed_at).slice(0, 3).map(goal => {
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span>{goal.icon}</span>
                          <span className="text-sm text-white">{goal.name}</span>
                        </div>
                        <span className="text-xs text-[#666666]">{progress.toFixed(0)}%</span>
                      </div>
                      <ProgressBar value={progress} color={goal.color} height={6} />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-[#666666]">{formatCurrency(goal.current_amount)}</span>
                        <span className="text-xs text-[#666666]">{formatCurrency(goal.target_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Upcoming expenses */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white text-sm">Próximos Vencimentos</h3>
              <Link href="/fixed-expenses" className="text-xs text-[#0066FF] flex items-center gap-1 hover:underline">
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>
            {upcomingExpenses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[#666666] text-sm">Sem vencimentos próximos 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingExpenses.map(exp => {
                  const status = getStatus(exp);
                  const statusColor = status === 'overdue' ? '#FF4444' : '#FFAA00';
                  return (
                    <div key={exp.id} className="flex items-center justify-between py-2 border-b border-[#1F1F1F] last:border-0">
                      <div>
                        <p className="text-sm text-white">{exp.name}</p>
                        <p className="text-xs" style={{ color: statusColor }}>
                          {status === 'overdue' ? '🔴 Vencido' : `🟡 Vence dia ${exp.due_day}`}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-[#FF4444]">{formatCurrency(exp.amount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Transações Recentes</h3>
            <Link href="/transactions" className="text-xs text-[#0066FF] flex items-center gap-1 hover:underline">
              Ver todas <ChevronRight size={12} />
            </Link>
          </div>
          {transactions.slice(0, 5).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#666666] text-sm mb-3">Nenhuma transação este mês</p>
              <Link href="/transactions" className="inline-flex items-center gap-2 bg-[#0066FF] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#0052CC] transition-colors">
                <Plus size={16} /> Adicionar transação
              </Link>
            </div>
          ) : (
            <div>
              {transactions.slice(0, 5).map((t, i) => (
                <TransactionItem key={t.id} transaction={t} index={i} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
