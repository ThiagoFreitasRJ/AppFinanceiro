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
import { formatCurrency, formatPercent } from '@/lib/utils/format';
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
    color: s.profitLoss >= 0 ? '#00FF88' : '#FF4444',
  }));

  const isProfit = totalProfitLoss >= 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Carteira de Ações</h1>
            <p className="text-[#666666] text-sm">{stocks.length} ativos</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="secondary" size="sm">
              <RefreshCw size={14} className={quotesLoading ? 'animate-spin' : ''} />
            </Button>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus size={16} /> Adicionar
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        {stocks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-4">
              <p className="text-xs text-[#666666] mb-1">Investido</p>
              <p className="text-sm font-bold text-white">{formatCurrency(totalInvested)}</p>
            </div>
            <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl p-4">
              <p className="text-xs text-[#666666] mb-1">Valor Atual</p>
              <p className="text-sm font-bold text-white">{formatCurrency(totalCurrentValue)}</p>
            </div>
            <div className={`border rounded-xl p-4 ${isProfit ? 'bg-[#00FF88]/10 border-[#00FF88]/20' : 'bg-[#FF4444]/10 border-[#FF4444]/20'}`}>
              <p className="text-xs text-[#666666] mb-1">Lucro/Prejuízo</p>
              <p className={`text-sm font-bold ${isProfit ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                {isProfit ? '+' : ''}{formatCurrency(totalProfitLoss)}
              </p>
            </div>
            <div className={`border rounded-xl p-4 ${isProfit ? 'bg-[#00FF88]/10 border-[#00FF88]/20' : 'bg-[#FF4444]/10 border-[#FF4444]/20'}`}>
              <p className="text-xs text-[#666666] mb-1">Rentabilidade</p>
              <p className={`text-sm font-bold ${isProfit ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                {isProfit ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Portfolio Chart + List */}
        {loading ? (
          <div className="text-center py-12 text-[#666666]">Carregando...</div>
        ) : stocks.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-white mb-2">Adicione seus ativos</h3>
              <p className="text-[#666666] text-sm mb-6">
                Monitore sua carteira em tempo real com cotações da B3
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus size={16} /> Adicionar Ativo
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chart */}
            <Card className="md:col-span-1">
              <h3 className="font-semibold text-white text-sm mb-4">Composição</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), '']}
                    contentStyle={{ background: '#1F1F1F', border: '1px solid #2A2A2A', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Stocks List */}
            <Card className="md:col-span-2">
              <h3 className="font-semibold text-white text-sm mb-4">Ativos</h3>
              <div className="space-y-3">
                {stocks.map((stock, i) => {
                  const dayChange = stock.quote?.regularMarketChangePercent || 0;
                  const isUp = stock.profitLoss >= 0;
                  const isDayUp = dayChange >= 0;
                  return (
                    <motion.div
                      key={stock.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#444] transition-all group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {/* Logo */}
                      <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {stock.quote?.logourl ? (
                          <Image src={stock.quote.logourl} alt={stock.ticker} width={40} height={40} className="object-cover" unoptimized />
                        ) : (
                          <span className="text-xs font-bold text-[#0066FF]">{stock.ticker.slice(0, 2)}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{stock.ticker}</span>
                          <span className={`text-xs flex items-center gap-0.5 ${isDayUp ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                            {isDayUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-xs text-[#666666]">{stock.quantity} cotas · P.M. {formatCurrency(stock.avg_price)}</p>
                      </div>

                      {/* Price & P/L */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">
                          {formatCurrency(stock.quote?.regularMarketPrice || stock.avg_price)}
                        </p>
                        <p className={`text-xs ${isUp ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                          {isUp ? '+' : ''}{formatCurrency(stock.profitLoss)} ({stock.profitLossPercent.toFixed(2)}%)
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(stock.id, stock.ticker)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-[#FF4444] text-[#666666]"
                      >
                        <Trash2 size={14} />
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
            <div className="bg-[#1F1F1F] rounded-lg p-3 text-xs text-[#666666]">
              💡 Cotações em tempo real via BRAPI (brapi.dev). Configure NEXT_PUBLIC_BRAPI_TOKEN para aumentar os limites.
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
