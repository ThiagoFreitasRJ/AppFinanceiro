'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, CATEGORIES } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

interface ExpenseDonutProps {
  transactions: Transaction[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm">
        <p className="text-white font-medium">{payload[0].name}</p>
        <p className="text-[#A0A0A0]">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export function ExpenseDonut({ transactions }: ExpenseDonutProps) {
  const expenses = transactions.filter(t => t.type === 'saida');

  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals)
    .map(([key, value]) => {
      const cat = CATEGORIES.find(c => c.id === key);
      return { name: cat ? `${cat.icon} ${cat.name}` : key, value, color: cat?.color || '#666' };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-[#666666] text-sm">
        Sem gastos registrados
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: '#A0A0A0', fontSize: 11 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
