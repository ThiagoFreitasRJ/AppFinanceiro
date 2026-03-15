'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useGoals } from '@/lib/hooks/useGoals';
import { AppLayout } from '@/components/layout/AppLayout';
import { GoalCard } from '@/components/cards/GoalCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils/format';

const GOAL_ICONS = ['🎯', '✈️', '🚗', '🏠', '📱', '🎓', '💍', '🏖️', '🎮', '💰', '🏆', '🎁', '💊', '🚀'];
const GOAL_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { goals, loading, createGoal, deleteGoal } = useGoals(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', target_amount: '', deadline: '', icon: '🎯', color: '#3b82f6' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.target_amount.replace(/\./g, '').replace(',', '.')) || 0;
    if (!form.name || amount <= 0) { toast.error('Preencha os campos obrigatórios'); return; }
    setSubmitting(true);
    const { error } = await createGoal({ name: form.name, target_amount: amount, deadline: form.deadline || null, icon: form.icon, color: form.color }) || {};
    if (error) toast.error('Erro ao criar objetivo');
    else { toast.success('Objetivo criado! 🎯'); setForm({ name: '', target_amount: '', deadline: '', icon: '🎯', color: '#3b82f6' }); setShowForm(false); }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este objetivo?')) return;
    await deleteGoal(id);
    toast.success('Objetivo removido');
  }

  const activeGoals = goals.filter(g => !g.completed_at);
  const completedGoals = goals.filter(g => !!g.completed_at);
  const totalSaved = activeGoals.reduce((s, g) => s + g.current_amount, 0);
  const totalTarget = activeGoals.reduce((s, g) => s + g.target_amount, 0);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-7">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Objetivos</h1>
            <p className="text-[#475569] text-sm mt-1">{activeGoals.length} ativos · {completedGoals.length} concluídos</p>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus size={15} /> Novo
          </Button>
        </div>

        {/* Stats */}
        {activeGoals.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-blue-400">{activeGoals.length}</p>
              <p className="text-xs text-[#475569] font-medium uppercase tracking-widest mt-1">Ativos</p>
            </div>
            <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5 text-center">
              <p className="text-xl font-bold text-emerald-400 font-mono-numbers">{formatCurrency(totalSaved)}</p>
              <p className="text-xs text-[#475569] font-medium uppercase tracking-widest mt-1">Guardado</p>
            </div>
            <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5 text-center">
              <p className="text-xl font-bold text-white font-mono-numbers">{formatCurrency(totalTarget)}</p>
              <p className="text-xs text-[#475569] font-medium uppercase tracking-widest mt-1">Meta Total</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeGoals.length === 0 && completedGoals.length === 0 ? (
          <Card>
            <div className="text-center py-16">
              <motion.div
                className="text-6xl mb-5"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🎯
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Crie seu primeiro objetivo</h3>
              <p className="text-[#475569] text-sm mb-8 max-w-sm mx-auto">
                Defina metas financeiras e ganhe XP a cada depósito. Quanto mais você poupar, mais sobe de nível!
              </p>
              <Button onClick={() => setShowForm(true)} size="lg">
                <Plus size={16} /> Criar Objetivo
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeGoals.map((goal, i) => (
                <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} index={i} />
              ))}
            </div>

            {completedGoals.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-400" />
                  <h2 className="font-semibold text-white">Concluídos</h2>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {completedGoals.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {completedGoals.map((goal, i) => (
                    <GoalCard key={goal.id} goal={goal} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Objetivo">
          <form onSubmit={handleCreate} className="space-y-5">
            <Input label="Nome do Objetivo" placeholder="Ex: Viagem para Europa" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <Input label="Valor Alvo" prefix="R$" placeholder="0,00" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} inputMode="numeric" required />
            <Input label="Prazo (opcional)" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} min={new Date().toISOString().split('T')[0]} />

            <div>
              <label className="text-sm text-[#94a3b8] font-medium block mb-2">Ícone</label>
              <div className="grid grid-cols-7 gap-2">
                {GOAL_ICONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setForm(p => ({ ...p, icon }))}
                    className={`p-2.5 rounded-xl text-xl text-center transition-all ${form.icon === icon ? 'bg-blue-500/20 border-2 border-blue-500/50 scale-110' : 'bg-[#161625] border border-[#1e1e32] hover:border-[#2a2a45]'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-[#94a3b8] font-medium block mb-2">Cor</label>
              <div className="flex gap-3">
                {GOAL_COLORS.map(color => (
                  <button key={color} type="button" onClick={() => setForm(p => ({ ...p, color }))}
                    className={`w-9 h-9 rounded-full transition-all duration-200 ${form.color === color ? 'scale-125 ring-2 ring-white/40 ring-offset-2 ring-offset-[#111]' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth loading={submitting} size="lg">🎯 Criar Objetivo</Button>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
