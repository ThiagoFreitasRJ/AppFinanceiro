'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { AppLayout } from '@/components/layout/AppLayout';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { TransactionItem } from '@/components/cards/TransactionItem';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { CATEGORIES } from '@/types';
import { TransactionSkeleton } from '@/components/ui/Skeleton';

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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Transações</h1>
            <p className="text-[#666666] text-sm">{transactions.length} registros</p>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus size={16} /> Nova
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-xl p-4">
            <p className="text-xs text-[#666666] mb-1">Total Entradas</p>
            <p className="text-lg font-bold text-[#00FF88]">
              R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-[#FF4444]/10 border border-[#FF4444]/20 rounded-xl p-4">
            <p className="text-xs text-[#666666] mb-1">Total Saídas</p>
            <p className="text-lg font-bold text-[#FF4444]">
              R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card animate={false}>
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
              <input
                className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg text-white placeholder-[#666666] text-sm py-2.5 pl-9 pr-4 focus:outline-none focus:border-[#0066FF]"
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

        {/* Transactions List */}
        <Card>
          {loading ? (
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => <TransactionSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#666666] mb-3">Nenhuma transação encontrada</p>
              <Button onClick={() => setShowForm(true)} size="sm">
                <Plus size={16} /> Adicionar
              </Button>
            </div>
          ) : (
            filtered.map((t, i) => (
              <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} index={i} />
            ))
          )}
        </Card>

        {/* Form Modal */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova Transação">
          <TransactionForm onSuccess={() => setShowForm(false)} />
        </Modal>
      </div>
    </AppLayout>
  );
}
