'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
const GOAL_COLORS = ['#0066FF', '#00FF88', '#FF4444', '#FFAA00', '#DDA0DD', '#4ECDC4', '#FF6B6B', '#95E1D3'];

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { goals, loading, createGoal, deleteGoal } = useGoals(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    target_amount: '',
    deadline: '',
    icon: '🎯',
    color: '#0066FF',
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.target_amount.replace(/\./g, '').replace(',', '.')) || 0;
    if (!form.name || amount <= 0) { toast.error('Preencha os campos obrigatórios'); return; }

    setSubmitting(true);
    const { error } = await createGoal({
      name: form.name,
      target_amount: amount,
      deadline: form.deadline || null,
      icon: form.icon,
      color: form.color,
    }) || {};

    if (error) toast.error('Erro ao criar objetivo');
    else {
      toast.success('Objetivo criado! 🎯');
      setForm({ name: '', target_amount: '', deadline: '', icon: '🎯', color: '#0066FF' });
      setShowForm(false);
    }
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Objetivos</h1>
            <p className="text-[#666666] text-sm">{activeGoals.length} ativos · {completedGoals.length} concluídos</p>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus size={16} /> Novo
          </Button>
        </div>

        {/* Summary */}
        {activeGoals.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#0066FF]">{activeGoals.length}</p>
              <p className="text-xs text-[#666666]">Ativos</p>
            </div>
            <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-4 text-center">
              <p className="text-lg font-bold text-[#00FF88]">{formatCurrency(totalSaved)}</p>
              <p className="text-xs text-[#666666]">Guardado</p>
            </div>
            <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-4 text-center">
              <p className="text-lg font-bold text-white">{formatCurrency(totalTarget)}</p>
              <p className="text-xs text-[#666666]">Meta Total</p>
            </div>
          </div>
        )}

        {/* Active Goals */}
        {loading ? (
          <div className="text-center py-12 text-[#666666]">Carregando...</div>
        ) : activeGoals.length === 0 && completedGoals.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">Crie seu primeiro objetivo</h3>
              <p className="text-[#666666] text-sm mb-6">
                Defina metas financeiras e ganhe XP ao depositar dinheiro nelas
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus size={16} /> Criar Objetivo
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map((goal, i) => (
                <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} index={i} />
              ))}
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={16} className="text-[#FFAA00]" />
                  <h2 className="font-semibold text-white">Objetivos Concluídos</h2>
                  <span className="text-xs bg-[#FFAA00]/20 text-[#FFAA00] px-2 py-0.5 rounded-full">
                    {completedGoals.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedGoals.map((goal, i) => (
                    <GoalCard key={goal.id} goal={goal} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Goal Modal */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Objetivo">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Nome do Objetivo"
              placeholder="Ex: Viagem para Europa"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              label="Valor Alvo"
              prefix="R$"
              placeholder="0,00"
              value={form.target_amount}
              onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))}
              inputMode="numeric"
              required
            />
            <Input
              label="Prazo (opcional)"
              type="date"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />

            {/* Icon Selector */}
            <div>
              <label className="text-sm text-[#A0A0A0] font-medium block mb-2">Ícone</label>
              <div className="grid grid-cols-7 gap-2">
                {GOAL_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, icon }))}
                    className={`p-2 rounded-lg text-xl text-center transition-all ${
                      form.icon === icon ? 'bg-[#0066FF]/20 border border-[#0066FF]' : 'bg-[#1F1F1F] border border-[#2A2A2A] hover:border-[#444]'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <label className="text-sm text-[#A0A0A0] font-medium block mb-2">Cor</label>
              <div className="flex gap-2">
                {GOAL_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, color }))}
                    className={`w-8 h-8 rounded-full transition-transform ${form.color === color ? 'scale-125 ring-2 ring-white/30' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth loading={submitting} size="lg">
              🎯 Criar Objetivo
            </Button>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
