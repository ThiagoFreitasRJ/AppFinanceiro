'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { AppLayout } from '@/components/layout/AppLayout';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { TransactionItem } from '@/components/cards/TransactionItem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Input';
import { CATEGORIES } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { transactions, loading, deleteTransaction, totalIncome, totalExpense } = useTransactions(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  async function handleDelete(id: string) {
    if (!confirm('Remover esta transação?')) return;
    const { error } = await deleteTransaction(id);
    if (error) toast.error('Erro ao remover');
    else toast.success('Transação removida');
  }

  const filtered = transactions.filter(t => {
    if (search && !t.description?.toLowerCase().includes(search.toLowerCase()) && !t.category.includes(search.toLowerCase())) return false;
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterType && t.type !== filterType) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Transações</h1>
            <p className="text-[#475569] text-sm mt-1">{transactions.length} registros no total</p>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus size={15} /> Nova
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
            <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Total Entradas</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono-numbers">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
            <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Total Saídas</p>
            <p className="text-2xl font-bold text-red-400 font-mono-numbers">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card animate={false}>
          <div className="space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#334155]" />
              <input
                className="w-full bg-[#0f0f1a] border border-[#1e1e32] rounded-xl text-white placeholder-[#334155] text-sm py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="Buscar transação..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                options={[
                  { value: '', label: 'Todos os tipos' },
                  { value: 'entrada', label: '📈 Entradas' },
                  { value: 'saida', label: '📉 Saídas' },
                ]}
              />
              <Select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                options={[
                  { value: '', label: 'Todas categorias' },
                  ...CATEGORIES.map(c => ({ value: c.id, label: c.name, icon: c.icon })),
                ]}
              />
            </div>
          </div>
        </Card>

        {/* List */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-[#475569] mb-4">Nenhuma transação encontrada</p>
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus size={15} /> Adicionar
              </Button>
            </div>
          ) : (
            filtered.map((t, i) => (
              <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} index={i} />
            ))
          )}
        </Card>

        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova Transação">
          <TransactionForm onSuccess={() => setShowForm(false)} />
        </Modal>
      </div>
    </AppLayout>
  );
}
