'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, Plus, Sparkles } from 'lucide-react';
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

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { transactions: allTransactions } = useTransactions(user?.id);
  const { income, expense, savings, transactions } = useMonthTransactions(user?.id);
  const { goals } = useGoals(user?.id);
  const { expenses, getStatus, isPaid } = useFixedExpenses(user?.id);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  if (authLoading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </AppLayout>
  );

  const totalInGoals = goals.filter(g => !g.completed_at).reduce((s, g) => s + g.current_amount, 0);
  const upcomingExpenses = expenses.filter(e => e.is_active && !isPaid(e.id))
    .filter(e => { const s = getStatus(e); return s === 'upcoming' || s === 'overdue'; })
    .slice(0, 3);

  const firstName = profile?.name?.split(' ')[0] || 'Usuário';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-blue-400" />
            <p className="text-sm text-[#475569] font-medium">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-[#475569] text-sm mt-1">Aqui está seu resumo financeiro de hoje</p>
        </motion.div>

        {/* Balance */}
        <BalanceCard balance={income - expense} income={income} expense={expense} />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Entradas" value={income} icon="📈" color="#34d399" bgColor="rgba(16,185,129,0.1)" delay={0.05} />
          <SummaryCard title="Saídas" value={expense} icon="📉" color="#f87171" bgColor="rgba(239,68,68,0.1)" delay={0.1} />
          <SummaryCard title="Economia" value={savings} icon="💰" color="#60a5fa" bgColor="rgba(59,130,246,0.1)" delay={0.15} />
          <SummaryCard title="Objetivos" value={totalInGoals} icon="🎯" color="#a78bfa" bgColor="rgba(139,92,246,0.1)" delay={0.2} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card delay={0.25}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-[#e2e8f0] text-sm">Gastos por Categoria</h3>
                <p className="text-xs text-[#475569] mt-0.5">Este mês</p>
              </div>
            </div>
            <ExpenseDonut transactions={transactions} />
          </Card>

          <Card delay={0.3}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-[#e2e8f0] text-sm">Evolução do Saldo</h3>
                <p className="text-xs text-[#475569] mt-0.5">Últimos 6 meses</p>
              </div>
            </div>
            <BalanceAreaChart transactions={allTransactions} />
          </Card>
        </div>

        {/* Goals + Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Goals */}
          <Card delay={0.35}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-[#e2e8f0] text-sm">Objetivos Ativos</h3>
                <p className="text-xs text-[#475569] mt-0.5">{goals.filter(g => !g.completed_at).length} objetivos</p>
              </div>
              <Link href="/goals" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Ver todos <ChevronRight size={13} />
              </Link>
            </div>

            {goals.filter(g => !g.completed_at).slice(0, 3).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-[#475569] text-sm mb-4">Nenhum objetivo criado</p>
                <Link href="/goals" className="text-blue-400 text-sm hover:text-blue-300 font-medium transition-colors">
                  Criar objetivo →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.filter(g => !g.completed_at).slice(0, 3).map(goal => {
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{goal.icon}</span>
                          <span className="text-sm font-medium text-[#cbd5e1]">{goal.name}</span>
                        </div>
                        <span className="text-xs text-[#475569] font-mono-numbers">{progress.toFixed(0)}%</span>
                      </div>
                      <ProgressBar value={progress} color={goal.color} height={6} />
                      <div className="flex justify-between">
                        <span className="text-xs text-[#334155] font-mono-numbers">{formatCurrency(goal.current_amount)}</span>
                        <span className="text-xs text-[#334155] font-mono-numbers">{formatCurrency(goal.target_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Upcoming expenses */}
          <Card delay={0.4}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-[#e2e8f0] text-sm">Próximos Vencimentos</h3>
                <p className="text-xs text-[#475569] mt-0.5">{upcomingExpenses.length} pendentes</p>
              </div>
              <Link href="/fixed-expenses" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Ver todos <ChevronRight size={13} />
              </Link>
            </div>
            {upcomingExpenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-[#475569] text-sm">Sem vencimentos próximos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingExpenses.map(exp => {
                  const status = getStatus(exp);
                  const isOverdue = status === 'overdue';
                  return (
                    <div key={exp.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                      isOverdue ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'
                    }`}>
                      <div>
                        <p className="text-sm font-medium text-[#cbd5e1]">{exp.name}</p>
                        <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-400' : 'text-amber-400'}`}>
                          {isOverdue ? '🔴 Vencido' : `🟡 Vence dia ${exp.due_day}`}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-red-400 font-mono-numbers">{formatCurrency(exp.amount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card delay={0.45}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#e2e8f0] text-sm">Transações Recentes</h3>
              <p className="text-xs text-[#475569] mt-0.5">Este mês</p>
            </div>
            <Link href="/transactions" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Ver todas <ChevronRight size={13} />
            </Link>
          </div>
          {transactions.slice(0, 5).length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">💸</p>
              <p className="text-[#475569] text-sm mb-4">Nenhuma transação este mês</p>
              <Link href="/transactions" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-xl font-semibold transition-colors">
                <Plus size={15} /> Adicionar transação
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
