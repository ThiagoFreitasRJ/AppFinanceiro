'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useStocks } from '@/lib/hooks/useStocks';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function StocksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { stocks, loading, quotesLoading, addStock, removeStock, refetch, totalInvested, totalCurrentValue, totalProfitLoss, totalProfitLossPercent } = useStocks(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ticker: '', quantity: '', avgPrice: '' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const quantity = parseFloat(form.quantity);
    const avgPrice = parseFloat(form.avgPrice.replace(/\./g, '').replace(',', '.'));
    if (!form.ticker || quantity <= 0 || avgPrice <= 0) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }
    setSubmitting(true);
    await addStock(form.ticker.toUpperCase(), quantity, avgPrice);
    toast.success(`${form.ticker.toUpperCase()} adicionado à carteira!`);
    setForm({ ticker: '', quantity: '', avgPrice: '' });
    setShowForm(false);
    setSubmitting(false);
  }

  async function handleRemove(id: string, ticker: string) {
    if (!confirm(`Remover ${ticker} da carteira?`)) return;
    await removeStock(id);
    toast.success(`${ticker} removido`);
  }

  const portfolioData = stocks.map(s => ({
    name: s.ticker,
    value: s.currentValue,
    color: s.profitLoss >= 0 ? '#10b981' : '#ef4444',
  }));

  const isProfit = totalProfitLoss >= 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Carteira de Ações</h1>
            <p className="text-[#475569] text-sm mt-1">{stocks.length} ativos · B3</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="secondary" size="sm">
              <RefreshCw size={14} className={quotesLoading ? 'animate-spin' : ''} />
            </Button>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus size={15} /> Adicionar
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        {stocks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5">
              <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Investido</p>
              <p className="text-lg font-bold text-white font-mono-numbers">{formatCurrency(totalInvested)}</p>
            </div>
            <div className="bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-5">
              <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Valor Atual</p>
              <p className="text-lg font-bold text-blue-400 font-mono-numbers">{formatCurrency(totalCurrentValue)}</p>
            </div>
            <div className={`border rounded-2xl p-5 ${isProfit ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
              <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Lucro/Prejuízo</p>
              <p className={`text-lg font-bold font-mono-numbers ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}{formatCurrency(totalProfitLoss)}
              </p>
            </div>
            <div className={`border rounded-2xl p-5 ${isProfit ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
              <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Rentabilidade</p>
              <p className={`text-lg font-bold font-mono-numbers ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                {isProfit ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Portfolio Chart + List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stocks.length === 0 ? (
          <Card>
            <div className="text-center py-16">
              <motion.div
                className="text-6xl mb-5"
                animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              >
                📈
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Adicione seus ativos</h3>
              <p className="text-[#475569] text-sm mb-8 max-w-sm mx-auto">
                Monitore sua carteira em tempo real com cotações da B3 via BRAPI
              </p>
              <Button onClick={() => setShowForm(true)} size="lg">
                <Plus size={16} /> Adicionar Ativo
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Chart */}
            <Card className="md:col-span-1">
              <h3 className="font-semibold text-[#e2e8f0] text-sm mb-5">Composição</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), '']}
                    contentStyle={{ background: '#0f0f1a', border: '1px solid #1e1e32', borderRadius: 12 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {stocks.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.profitLoss >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <span className="text-[#94a3b8] font-medium">{s.ticker}</span>
                    </div>
                    <span className="text-[#475569] font-mono-numbers">
                      {totalCurrentValue > 0 ? ((s.currentValue / totalCurrentValue) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Stocks List */}
            <Card className="md:col-span-2">
              <h3 className="font-semibold text-[#e2e8f0] text-sm mb-5">Ativos</h3>
              <div className="space-y-3">
                {stocks.map((stock, i) => {
                  const dayChange = stock.quote?.regularMarketChangePercent || 0;
                  const isUp = stock.profitLoss >= 0;
                  const isDayUp = dayChange >= 0;
                  return (
                    <motion.div
                      key={stock.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#080810] border border-[#1e1e32] hover:border-[#2a2a45] transition-all group"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {/* Logo */}
                      <div className="w-10 h-10 rounded-xl bg-[#1e1e32] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {stock.quote?.logourl ? (
                          <Image src={stock.quote.logourl} alt={stock.ticker} width={40} height={40} className="object-cover" unoptimized />
                        ) : (
                          <span className="text-xs font-bold text-blue-400">{stock.ticker.slice(0, 2)}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#e2e8f0]">{stock.ticker}</span>
                          <span className={`text-xs flex items-center gap-0.5 font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {stock.profitLossPercent >= 0 ? '+' : ''}{stock.profitLossPercent.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-xs text-[#475569] mt-0.5 font-mono-numbers">
                          {stock.quantity} cotas · P.M. {formatCurrency(stock.avg_price)}
                          {dayChange !== 0 && (
                            <span className={`ml-2 ${isDayUp ? 'text-emerald-500/60' : 'text-red-500/60'}`}>
                              hoje: {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Price & P/L */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-white font-mono-numbers">
                          {formatCurrency(stock.quote?.regularMarketPrice || stock.avg_price)}
                        </p>
                        <p className={`text-xs font-mono-numbers ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isUp ? '+' : ''}{formatCurrency(stock.profitLoss)} ({stock.profitLossPercent.toFixed(2)}%)
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(stock.id, stock.ticker)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:text-red-400 text-[#334155] rounded-lg hover:bg-red-500/10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Add Stock Modal */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Adicionar Ativo" size="sm">
          <form onSubmit={handleAdd} className="space-y-4">
            <Input
              label="Código do Ativo"
              placeholder="Ex: PETR4, VALE3, ITUB4"
              value={form.ticker}
              onChange={e => setForm(p => ({ ...p, ticker: e.target.value.toUpperCase() }))}
              required
            />
            <Input
              label="Quantidade de Cotas"
              type="number"
              placeholder="100"
              value={form.quantity}
              onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
              min="0.000001"
              step="any"
              required
            />
            <Input
              label="Preço Médio de Compra"
              prefix="R$"
              placeholder="0,00"
              value={form.avgPrice}
              onChange={e => setForm(p => ({ ...p, avgPrice: e.target.value }))}
              inputMode="numeric"
              required
            />
            <div className="bg-blue-500/8 border border-blue-500/15 rounded-xl p-3 text-xs text-[#475569]">
              💡 Cotações em tempo real via BRAPI (brapi.dev)
            </div>
            <Button type="submit" fullWidth loading={submitting} size="lg">
              📈 Adicionar à Carteira
            </Button>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
