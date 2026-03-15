'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartProps {
  transactions: Transaction[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm">
        <p className="text-[#666666] text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white font-medium">{p.name ? `${p.name}: ` : ''}{formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

function buildMonthlyData(transactions: Transaction[], months: number) {
  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(new Date(), months - 1 - i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const monthTxs = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });

    const income = monthTxs.filter(t => t.type === 'entrada').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'saida').reduce((s, t) => s + t.amount, 0);

    return {
      month: format(date, 'MMM', { locale: ptBR }),
      saldo: income - expense,
      Entradas: income,
      Saídas: expense,
    };
  });
}

export function BalanceAreaChart({ transactions }: ChartProps) {
  const data = buildMonthlyData(transactions, 6);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
        <XAxis dataKey="month" stroke="#666666" tick={{ fontSize: 11, fill: '#666666' }} />
        <YAxis stroke="#666666" tick={{ fontSize: 10, fill: '#666666' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="saldo" stroke="#0066FF" fill="url(#colorSaldo)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function IncomeExpenseBarChart({ transactions }: ChartProps) {
  const data = buildMonthlyData(transactions, 6);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
        <XAxis dataKey="month" stroke="#666666" tick={{ fontSize: 11, fill: '#666666' }} />
        <YAxis stroke="#666666" tick={{ fontSize: 10, fill: '#666666' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="Entradas" fill="#00FF88" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Saídas" fill="#FF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
