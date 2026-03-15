'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Trash2, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useFixedExpenses } from '@/lib/hooks/useFixedExpenses';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { StatusBadge } from '@/components/ui/Badge';
import { CATEGORIES } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

export default function FixedExpensesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { expenses, loading, createExpense, markAsPaid, deleteExpense, toggleExpense, getStatus, isPaid, totalMonthly } = useFixedExpenses(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', category: 'contas', due_day: '1' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount.replace(/\./g, '').replace(',', '.')) || 0;
    if (!form.name || amount <= 0) { toast.error('Preencha todos os campos'); return; }

    setSubmitting(true);
    const { error } = await createExpense({
      name: form.name,
      amount,
      category: form.category,
      due_day: parseInt(form.due_day),
      is_active: true,
    }) || {};

    if (error) toast.error('Erro ao criar gasto fixo');
    else {
      toast.success('Gasto fixo cadastrado!');
      setForm({ name: '', amount: '', category: 'contas', due_day: '1' });
      setShowForm(false);
    }
    setSubmitting(false);
  }

  async function handleMarkPaid(id: string) {
    await markAsPaid(id);
    toast.success('Marcado como pago! +10 XP');
  }

  const paidCount = expenses.filter(e => isPaid(e.id)).length;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Gastos Fixos</h1>
            <p className="text-[#666666] text-sm">{paidCount}/{expenses.length} pagos este mês</p>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus size={16} /> Novo
          </Button>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-[#FF4444]/10 to-[#0A0A0A] border border-[#FF4444]/20 rounded-xl p-5">
          <p className="text-[#A0A0A0] text-sm mb-1">Total Mensal Fixo</p>
          <p className="text-3xl font-bold text-[#FF4444]">{formatCurrency(totalMonthly)}</p>
          <div className="flex gap-4 mt-3">
            <div>
              <p className="text-xs text-[#666666]">Pago</p>
              <p className="text-sm font-medium text-[#00FF88]">
                {formatCurrency(expenses.filter(e => e.is_active && isPaid(e.id)).reduce((s, e) => s + e.amount, 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#666666]">Pendente</p>
              <p className="text-sm font-medium text-[#FFAA00]">
                {formatCurrency(expenses.filter(e => e.is_active && !isPaid(e.id)).reduce((s, e) => s + e.amount, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* List */}
        <Card>
          {loading ? (
            <div className="text-center py-8 text-[#666666]">Carregando...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#666666] mb-3">Nenhum gasto fixo cadastrado</p>
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus size={16} /> Cadastrar
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense, i) => {
                const status = getStatus(expense);
                const category = CATEGORIES.find(c => c.id === expense.category);
                return (
                  <motion.div
                    key={expense.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      !expense.is_active ? 'opacity-50 border-[#2A2A2A]' : 'border-[#2A2A2A] hover:border-[#444]'
                    } transition-all`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `${category?.color || '#666'}20` }}
                    >
                      {category?.icon || '📄'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{expense.name}</p>
                        <StatusBadge status={status} />
                      </div>
                      <p className="text-xs text-[#666666]">Vence dia {expense.due_day}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{formatCurrency(expense.amount)}</p>
                      <div className="flex gap-1">
                        {!isPaid(expense.id) && expense.is_active && (
                          <button
                            onClick={() => handleMarkPaid(expense.id)}
                            className="p-1.5 hover:text-[#00FF88] text-[#666666] transition-colors"
                            title="Marcar como pago"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => toggleExpense(expense.id, !expense.is_active)}
                          className="p-1.5 text-[#666666] hover:text-white transition-colors"
                          title={expense.is_active ? 'Desativar' : 'Ativar'}
                        >
                          {expense.is_active ? <ToggleRight size={16} className="text-[#0066FF]" /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id).then(() => toast.success('Removido'))}
                          className="p-1.5 hover:text-[#FF4444] text-[#666666] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Form Modal */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Gasto Fixo">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome"
              placeholder="Ex: Aluguel"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              label="Valor"
              prefix="R$"
              placeholder="0,00"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              inputMode="numeric"
              required
            />
            <Select
              label="Categoria"
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              options={CATEGORIES.map(c => ({ value: c.id, label: c.name, icon: c.icon }))}
            />
            <Input
              label="Dia de Vencimento"
              type="number"
              min="1"
              max="31"
              value={form.due_day}
              onChange={e => setForm(p => ({ ...p, due_day: e.target.value }))}
              required
            />
            <Button type="submit" fullWidth loading={submitting}>
              Cadastrar Gasto Fixo
            </Button>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
