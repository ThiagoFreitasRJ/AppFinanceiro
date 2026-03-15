'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CATEGORIES, PAYMENT_METHODS } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useAuth } from '@/lib/hooks/useAuth';

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { user } = useAuth();
  const { addTransaction } = useTransactions(user?.id);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'entrada' | 'saida'>('saida');
  const [form, setForm] = useState({
    amount: '',
    description: '',
    category: 'outros',
    payment_method: 'pix' as const,
    date: new Date().toISOString().split('T')[0],
  });

  function formatAmount(value: string) {
    const nums = value.replace(/\D/g, '');
    const amount = parseFloat(nums) / 100;
    if (isNaN(amount)) return '';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  }

  function parseAmount(formatted: string) {
    return parseFloat(formatted.replace(/\./g, '').replace(',', '.')) || 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseAmount(form.amount);
    if (amount <= 0) { toast.error('Valor deve ser maior que zero'); return; }

    setLoading(true);
    const { error } = await addTransaction({
      type,
      amount,
      description: form.description,
      category: form.category,
      payment_method: form.payment_method,
      date: form.date,
    }) || {};

    if (error) {
      toast.error('Erro ao salvar transação');
    } else {
      toast.success(`${type === 'entrada' ? 'Entrada' : 'Saída'} registrada! +5 XP 🎉`);
      setForm({
        amount: '',
        description: '',
        category: 'outros',
        payment_method: 'pix',
        date: new Date().toISOString().split('T')[0],
      });
      onSuccess?.();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type Toggle */}
      <div className="flex gap-2 p-1.5 bg-[#0a0a14] border border-[#1e1e32] rounded-xl">
        {(['saida', 'entrada'] as const).map(t => (
          <motion.button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === t
                ? t === 'entrada'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : 'bg-red-500/15 text-red-400 border border-red-500/25'
                : 'text-[#475569] hover:text-[#94a3b8]'
            }`}
            whileTap={{ scale: 0.97 }}
          >
            {t === 'entrada' ? '📈 Entrada' : '📉 Saída'}
          </motion.button>
        ))}
      </div>

      <Input
        label="Valor"
        prefix="R$"
        placeholder="0,00"
        value={form.amount}
        onChange={e => setForm(prev => ({ ...prev, amount: formatAmount(e.target.value) }))}
        inputMode="numeric"
        required
      />

      <Input
        label="Descrição"
        placeholder="Ex: Almoço com amigos"
        value={form.description}
        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
      />

      <Select
        label="Categoria"
        value={form.category}
        onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
        options={CATEGORIES.map(c => ({ value: c.id, label: c.name, icon: c.icon }))}
      />

      {/* Payment Method */}
      <div>
        <label className="text-sm text-[#94a3b8] font-medium block mb-2">Método de Pagamento</label>
        <div className="grid grid-cols-5 gap-2">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, payment_method: method.id as typeof form.payment_method }))}
              className={`py-2.5 rounded-xl text-center transition-all ${
                form.payment_method === method.id
                  ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                  : 'bg-[#0f0f1a] border border-[#1e1e32] text-[#475569] hover:border-[#2a2a45] hover:text-[#94a3b8]'
              }`}
            >
              <div className="text-lg">{method.icon}</div>
              <div className="text-[9px] mt-0.5 font-medium">{method.name}</div>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Data"
        type="date"
        value={form.date}
        onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
      />

      <Button type="submit" fullWidth loading={loading} size="lg">
        {type === 'entrada' ? '📈 Registrar Entrada' : '📉 Registrar Saída'}
      </Button>
    </form>
  );
}
