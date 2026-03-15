'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, RefreshCw, Trash2, Search, ChevronRight, X, Calendar, Percent, Building2 } from 'lucide-react';
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
import { searchTicker } from '@/lib/utils/brapi';
import { ASSET_TYPES, AssetType, YIELD_TYPES, YieldType, FIXED_INCOME_PRODUCTS } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type Step = 'type' | 'ticker' | 'details';

export default function StocksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { stocks, loading, quotesLoading, addStock, addFixedIncome, removeStock, refetch, totalInvested, totalCurrentValue, totalProfitLoss, totalProfitLossPercent } = useStocks(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Multi-step form state
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<AssetType>('acao');
  const [tickerSearch, setTickerSearch] = useState('');
  const [tickerResults, setTickerResults] = useState<string[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Renda fixa form state
  const [rfName, setRfName] = useState('');
  const [rfValue, setRfValue] = useState('');
  const [rfPurchaseDate, setRfPurchaseDate] = useState('');
  const [rfYieldRate, setRfYieldRate] = useState('');
  const [rfYieldType, setRfYieldType] = useState<YieldType>('pos_cdi');
  const [rfInstitution, setRfInstitution] = useState('');
  const [rfMaturityDate, setRfMaturityDate] = useState('');
  const [rfHasMaturity, setRfHasMaturity] = useState(true);
  const [rfAdminFee, setRfAdminFee] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  const isRendaFixa = selectedType === 'renda_fixa';

  // Debounced ticker search
  const handleTickerSearch = useCallback((query: string) => {
    setTickerSearch(query);
    setSelectedTicker('');
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setTickerResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      const results = await searchTicker(query.toUpperCase());
      setTickerResults(results.map(r => r.symbol));
      setSearchLoading(false);
    }, 350);
  }, []);

  function openForm() {
    setStep('type');
    setSelectedType('acao');
    setTickerSearch('');
    setTickerResults([]);
    setSelectedTicker('');
    setQuantity('');
    setAvgPrice('');
    // Reset renda fixa fields
    setRfName('');
    setRfValue('');
    setRfPurchaseDate('');
    setRfYieldRate('');
    setRfYieldType('pos_cdi');
    setRfInstitution('');
    setRfMaturityDate('');
    setRfHasMaturity(true);
    setRfAdminFee('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const price = parseFloat(avgPrice.replace(/\./g, '').replace(',', '.'));
    const ticker = selectedTicker || tickerSearch.trim().toUpperCase();
    if (!ticker || qty <= 0 || price <= 0) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }
    setSubmitting(true);
    await addStock(ticker, qty, price, selectedType);
    toast.success(`${ticker} adicionado à carteira!`);
    closeForm();
    setSubmitting(false);
  }

  async function handleAddFixedIncome(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(rfValue.replace(/\./g, '').replace(',', '.'));
    const rate = parseFloat(rfYieldRate.replace(',', '.'));
    const fee = parseFloat(rfAdminFee.replace(',', '.') || '0');
    if (!rfName || value <= 0 || rate <= 0 || !rfPurchaseDate || !rfInstitution) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (rfHasMaturity && !rfMaturityDate) {
      toast.error('Informe a data de vencimento');
      return;
    }
    setSubmitting(true);
    await addFixedIncome(rfName, value, {
      purchase_date: rfPurchaseDate,
      yield_rate: rate,
      yield_type: rfYieldType,
      institution: rfInstitution,
      maturity_date: rfHasMaturity ? rfMaturityDate : null,
      admin_fee: fee,
    });
    toast.success(`${rfName} adicionado à carteira!`);
    closeForm();
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
    color: s.asset_type === 'renda_fixa' ? '#3b82f6' : (s.profitLoss >= 0 ? '#10b981' : '#ef4444'),
  }));

  const isProfit = totalProfitLoss >= 0;
  const isValorized = totalCurrentValue >= totalInvested;
  const assetTypeMeta = ASSET_TYPES.find(t => t.id === selectedType);

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
  }

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
            <Button onClick={openForm} size="sm">
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
            <div className={`border rounded-2xl p-5 ${isValorized ? 'bg-blue-500/5 border-blue-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
              <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-2">Valor Atual</p>
              <p className={`text-lg font-bold font-mono-numbers ${isValorized ? 'text-blue-400' : 'text-red-400'}`}>{formatCurrency(totalCurrentValue)}</p>
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
              <Button onClick={openForm} size="lg">
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
                      <div className={`w-2 h-2 rounded-full ${
                        s.asset_type === 'renda_fixa' ? 'bg-blue-400' :
                        s.profitLoss >= 0 ? 'bg-emerald-400' : 'bg-red-400'
                      }`} />
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
                  const isFixedIncome = stock.asset_type === 'renda_fixa';
                  const dayChange = stock.quote?.regularMarketChangePercent || 0;
                  const isUp = stock.profitLoss >= 0;
                  const isDayUp = dayChange >= 0;
                  const typeMeta = ASSET_TYPES.find(t => t.id === stock.asset_type);
                  const yieldMeta = YIELD_TYPES.find(y => y.id === stock.yield_type);

                  return (
                    <motion.div
                      key={stock.id}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#080810] border border-[#1e1e32] hover:border-[#2a2a45] transition-all group"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {/* Logo */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
                        isFixedIncome ? 'bg-blue-500/15' : 'bg-[#1e1e32]'
                      }`}>
                        {isFixedIncome ? (
                          <span className="text-lg">💰</span>
                        ) : stock.quote?.logourl ? (
                          <Image src={stock.quote.logourl} alt={stock.ticker} width={40} height={40} className="object-cover" unoptimized />
                        ) : (
                          <span className="text-xs font-bold text-blue-400">{stock.ticker.slice(0, 2)}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#e2e8f0]">{stock.ticker}</span>
                          {typeMeta && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#1e1e32] text-[#64748b] font-medium">
                              {typeMeta.icon} {typeMeta.label}
                            </span>
                          )}
                          {!isFixedIncome && (
                            <span className={`text-xs flex items-center gap-0.5 font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {stock.profitLossPercent >= 0 ? '+' : ''}{stock.profitLossPercent.toFixed(2)}%
                            </span>
                          )}
                        </div>
                        {isFixedIncome ? (
                          <p className="text-xs text-[#475569] mt-0.5">
                            {yieldMeta && <span className="text-blue-400/70">{stock.yield_rate}% {yieldMeta.label}</span>}
                            {stock.institution && <span className="ml-2">{stock.institution}</span>}
                            {stock.maturity_date && <span className="ml-2">venc. {formatDate(stock.maturity_date)}</span>}
                            {!stock.maturity_date && <span className="ml-2 text-emerald-500/50">sem vencimento</span>}
                          </p>
                        ) : (
                          <p className="text-xs text-[#475569] mt-0.5 font-mono-numbers">
                            {stock.quantity} cotas · P.M. {formatCurrency(stock.avg_price)}
                            {dayChange !== 0 && (
                              <span className={`ml-2 ${isDayUp ? 'text-emerald-500/60' : 'text-red-500/60'}`}>
                                hoje: {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Price & P/L */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-white font-mono-numbers">
                          {formatCurrency(isFixedIncome ? stock.avg_price : (stock.quote?.regularMarketPrice || stock.avg_price))}
                        </p>
                        {isFixedIncome ? (
                          <p className="text-xs font-mono-numbers text-blue-400/70">
                            {stock.yield_rate}% {yieldMeta?.label || 'a.a.'}
                          </p>
                        ) : (
                          <p className={`text-xs font-mono-numbers ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isUp ? '+' : ''}{formatCurrency(stock.profitLoss)} ({stock.profitLossPercent.toFixed(2)}%)
                          </p>
                        )}
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

        {/* Add Stock Modal — multi-step */}
        <Modal isOpen={showForm} onClose={closeForm} title="Adicionar Ativo" size="sm">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-6">
            {(['type', 'ticker', 'details'] as Step[]).map((s, i) => {
              const stepNames = isRendaFixa
                ? { type: 'Tipo', ticker: 'Produto', details: 'Detalhes' }
                : { type: 'Tipo', ticker: 'Ativo', details: 'Detalhes' };
              const stepIndex = ['type', 'ticker', 'details'].indexOf(step);
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s ? 'bg-blue-500 text-white' :
                    stepIndex > i ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-[#1e1e32] text-[#475569]'
                  }`}>
                    {stepIndex > i ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${step === s ? 'text-[#e2e8f0]' : 'text-[#475569]'}`}>
                    {stepNames[s]}
                  </span>
                  {i < 2 && <ChevronRight size={12} className="text-[#334155]" />}
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1 — Asset type */}
            {step === 'type' && (
              <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-[#64748b] mb-4">Que tipo de ativo você quer adicionar?</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {ASSET_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type.id); setStep('ticker'); }}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-[#1e1e32] bg-[#080810] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left group"
                    >
                      <span className="text-xl">{type.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-[#e2e8f0] group-hover:text-white">{type.label}</p>
                        <p className="text-[10px] text-[#475569]">{type.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Ticker search (normal) OR Product select (renda fixa) */}
            {step === 'ticker' && !isRendaFixa && (
              <motion.div key="ticker" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('type')} className="text-[#475569] hover:text-[#e2e8f0] transition-colors">
                    ←
                  </button>
                  <span className="text-sm text-[#64748b]">
                    {assetTypeMeta?.icon} {assetTypeMeta?.label} · busque pelo código ou nome
                  </span>
                </div>

                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                  <input
                    autoFocus
                    className="w-full bg-[#080810] border border-[#1e1e32] rounded-xl pl-9 pr-9 py-2.5 text-sm text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-blue-500/50 font-mono-numbers uppercase"
                    placeholder={`Ex: ${assetTypeMeta?.desc.split(',')[0].trim()}`}
                    value={tickerSearch}
                    onChange={e => handleTickerSearch(e.target.value)}
                  />
                  {tickerSearch && (
                    <button onClick={() => { setTickerSearch(''); setTickerResults([]); setSelectedTicker(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#334155] hover:text-[#e2e8f0]">
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 rounded-xl">
                  {searchLoading && (
                    <div className="flex items-center gap-2 p-3 text-xs text-[#475569]">
                      <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Buscando...
                    </div>
                  )}
                  {!searchLoading && tickerResults.length === 0 && tickerSearch.length > 0 && (
                    <p className="text-xs text-[#475569] p-3">Nenhum resultado. Você pode digitar o código manualmente.</p>
                  )}
                  {tickerResults.map(symbol => (
                    <button
                      key={symbol}
                      onClick={() => { setSelectedTicker(symbol); setTickerSearch(symbol); setStep('details'); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#080810] border border-[#1e1e32] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left"
                    >
                      <span className="text-sm font-bold text-[#e2e8f0] font-mono-numbers">{symbol}</span>
                      <ChevronRight size={13} className="text-[#334155]" />
                    </button>
                  ))}
                </div>

                {tickerSearch.length >= 2 && (
                  <button
                    onClick={() => { setSelectedTicker(tickerSearch.toUpperCase()); setStep('details'); }}
                    className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-[#2a2a45] text-xs text-[#475569] hover:text-[#94a3b8] hover:border-[#334155] transition-all"
                  >
                    Usar &quot;{tickerSearch.toUpperCase()}&quot; mesmo assim →
                  </button>
                )}
              </motion.div>
            )}

            {/* STEP 2 — Renda Fixa: product selection */}
            {step === 'ticker' && isRendaFixa && (
              <motion.div key="ticker-rf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('type')} className="text-[#475569] hover:text-[#e2e8f0] transition-colors">
                    ←
                  </button>
                  <span className="text-sm text-[#64748b]">
                    💰 Renda Fixa · selecione o tipo de produto
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FIXED_INCOME_PRODUCTS.map(product => (
                    <button
                      key={product}
                      onClick={() => { setRfName(product); setStep('details'); }}
                      className="px-3 py-2.5 rounded-xl bg-[#080810] border border-[#1e1e32] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left"
                    >
                      <span className="text-sm font-semibold text-[#e2e8f0]">{product}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <input
                    className="w-full bg-[#080810] border border-[#1e1e32] rounded-xl px-3 py-2.5 text-sm text-[#e2e8f0] placeholder-[#334155] focus:outline-none focus:border-blue-500/50"
                    placeholder="Ou digite um nome personalizado..."
                    value={rfName}
                    onChange={e => setRfName(e.target.value)}
                  />
                  {rfName && !FIXED_INCOME_PRODUCTS.includes(rfName) && (
                    <button
                      onClick={() => setStep('details')}
                      className="mt-2 w-full py-2.5 rounded-xl border border-dashed border-[#2a2a45] text-xs text-[#475569] hover:text-[#94a3b8] hover:border-[#334155] transition-all"
                    >
                      Usar &quot;{rfName}&quot; →
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Details: Normal assets */}
            {step === 'details' && !isRendaFixa && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-5">
                  <button onClick={() => setStep('ticker')} className="text-[#475569] hover:text-[#e2e8f0] transition-colors">
                    ←
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono-numbers">{selectedTicker || tickerSearch.toUpperCase()}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e1e32] text-[#64748b]">
                      {assetTypeMeta?.icon} {assetTypeMeta?.label}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                  <Input
                    label="Quantidade de Cotas"
                    type="number"
                    placeholder="100"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min="0.000001"
                    step="any"
                    required
                  />
                  <Input
                    label="Preço Médio de Compra"
                    prefix="R$"
                    placeholder="0,00"
                    value={avgPrice}
                    onChange={e => setAvgPrice(e.target.value)}
                    inputMode="numeric"
                    required
                  />
                  {quantity && avgPrice && (
                    <div className="bg-[#080810] border border-[#1e1e32] rounded-xl p-3 text-xs text-[#64748b]">
                      Total investido:{' '}
                      <span className="text-white font-bold font-mono-numbers">
                        {formatCurrency(parseFloat(quantity || '0') * parseFloat(avgPrice.replace(/\./g, '').replace(',', '.') || '0'))}
                      </span>
                    </div>
                  )}
                  <Button type="submit" fullWidth loading={submitting} size="lg">
                    📈 Adicionar à Carteira
                  </Button>
                </form>
              </motion.div>
            )}

            {/* STEP 3 — Details: Renda Fixa */}
            {step === 'details' && isRendaFixa && (
              <motion.div key="details-rf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-5">
                  <button onClick={() => setStep('ticker')} className="text-[#475569] hover:text-[#e2e8f0] transition-colors">
                    ←
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{rfName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                      💰 Renda Fixa
                    </span>
                  </div>
                </div>

                <form onSubmit={handleAddFixedIncome} className="space-y-3.5">
                  {/* Value */}
                  <Input
                    label="Valor Investido"
                    prefix="R$"
                    placeholder="1.000,00"
                    value={rfValue}
                    onChange={e => setRfValue(e.target.value)}
                    inputMode="numeric"
                    required
                  />

                  {/* Yield type pills + rate */}
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-2">Rentabilidade</label>
                    <div className="flex gap-1.5 mb-2">
                      {YIELD_TYPES.map(y => (
                        <button
                          key={y.id}
                          type="button"
                          onClick={() => setRfYieldType(y.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            rfYieldType === y.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-[#1e1e32] text-[#64748b] hover:text-[#94a3b8]'
                          }`}
                        >
                          {y.label}
                        </button>
                      ))}
                    </div>
                    <Input
                      suffix={rfYieldType === 'pos_cdi' ? '% CDI' : rfYieldType === 'ipca' ? '% + IPCA' : '% a.a.'}
                      placeholder={rfYieldType === 'pos_cdi' ? '110' : '12,50'}
                      value={rfYieldRate}
                      onChange={e => setRfYieldRate(e.target.value)}
                      inputMode="numeric"
                      required
                    />
                  </div>

                  {/* Institution */}
                  <Input
                    label="Instituição"
                    placeholder="Ex: Nubank, XP, Inter, BTG..."
                    value={rfInstitution}
                    onChange={e => setRfInstitution(e.target.value)}
                    required
                  />

                  {/* Purchase date */}
                  <Input
                    label="Data de Compra"
                    type="date"
                    value={rfPurchaseDate}
                    onChange={e => setRfPurchaseDate(e.target.value)}
                    required
                  />

                  {/* Maturity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-[#94a3b8]">Data de Vencimento</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-[#475569]">Sem vencimento</span>
                        <button
                          type="button"
                          onClick={() => setRfHasMaturity(!rfHasMaturity)}
                          className={`w-8 h-4.5 rounded-full transition-all relative ${
                            !rfHasMaturity ? 'bg-blue-500' : 'bg-[#1e1e32]'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${
                            !rfHasMaturity ? 'left-4' : 'left-0.5'
                          }`} />
                        </button>
                      </label>
                    </div>
                    {rfHasMaturity && (
                      <Input
                        type="date"
                        value={rfMaturityDate}
                        onChange={e => setRfMaturityDate(e.target.value)}
                        required={rfHasMaturity}
                      />
                    )}
                  </div>

                  {/* Admin fee */}
                  <Input
                    label="Taxa de Administração"
                    suffix="% a.a."
                    placeholder="0,00"
                    value={rfAdminFee}
                    onChange={e => setRfAdminFee(e.target.value)}
                    inputMode="numeric"
                    hint="Deixe em branco se não houver"
                  />

                  {/* Summary */}
                  {rfValue && rfYieldRate && (
                    <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Valor aplicado</span>
                        <span className="text-white font-bold font-mono-numbers">
                          {formatCurrency(parseFloat(rfValue.replace(/\./g, '').replace(',', '.') || '0'))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748b]">Rentabilidade</span>
                        <span className="text-blue-400 font-bold font-mono-numbers">
                          {rfYieldRate}% {YIELD_TYPES.find(y => y.id === rfYieldType)?.label}
                        </span>
                      </div>
                      {rfInstitution && (
                        <div className="flex justify-between">
                          <span className="text-[#64748b]">Instituição</span>
                          <span className="text-[#94a3b8]">{rfInstitution}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button type="submit" fullWidth loading={submitting} size="lg">
                    💰 Adicionar Renda Fixa
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>
      </div>
    </AppLayout>
  );
}
