import { Transaction, FixedExpense } from '@/types';

export interface CategoryPrediction {
  category: string;
  predicted: number;
  avg3m: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

export interface PredictionResult {
  month: string;
  predicted_income: number;
  predicted_expenses: number;
  predicted_savings: number;
  confidence: number;
  by_category: CategoryPrediction[];
  insights: string[];
}

const CATEGORY_ICONS: Record<string, string> = {
  moradia: '🏠', transporte: '🚗', alimentacao: '🍔', educacao: '🎓',
  lazer: '🎮', saude: '💊', vestuario: '👕', assinaturas: '📱',
  contas: '📄', investimentos: '💰', presentes: '🎁', trabalho: '💼',
  pets: '🐾', outros: '➕',
};

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function movingAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function predictNextMonth(
  transactions: Transaction[],
  fixedExpenses: FixedExpense[],
): PredictionResult {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthKey = getMonthKey(next);

  // Group transactions by month
  const last3Months: Record<string, Record<string, number>> = {};
  const incomeByMonth: Record<string, number> = {};

  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last3Months[getMonthKey(d)] = {};
    incomeByMonth[getMonthKey(d)] = 0;
  }

  for (const t of transactions) {
    const key = t.date.substring(0, 7);
    if (t.type === 'saida' && last3Months[key] !== undefined) {
      last3Months[key][t.category] = (last3Months[key][t.category] || 0) + t.amount;
    }
    if (t.type === 'entrada' && incomeByMonth[key] !== undefined) {
      incomeByMonth[key] = (incomeByMonth[key] || 0) + t.amount;
    }
  }

  // Predict income (avg of last 3 months)
  const incomeValues = Object.values(incomeByMonth).filter(v => v > 0);
  const predicted_income = movingAverage(incomeValues);

  // All categories found
  const allCategories = new Set<string>();
  for (const monthData of Object.values(last3Months)) {
    for (const cat of Object.keys(monthData)) allCategories.add(cat);
  }

  // Fixed expenses by category
  const fixedByCategory: Record<string, number> = {};
  for (const fe of fixedExpenses) {
    if (fe.is_active) {
      fixedByCategory[fe.category] = (fixedByCategory[fe.category] || 0) + fe.amount;
    }
  }

  // Per-category prediction
  const monthKeys = Object.keys(last3Months);
  const by_category: CategoryPrediction[] = [];

  for (const cat of allCategories) {
    const values = monthKeys.map(k => last3Months[k][cat] || 0);
    const avg = movingAverage(values);
    const withFixed = Math.max(avg, fixedByCategory[cat] || 0);

    // Trend: compare last month vs average of prior 2
    const last = values[0] || 0;
    const prior = movingAverage(values.slice(1));
    const diff = prior > 0 ? (last - prior) / prior : 0;
    const trend = diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : 'stable';

    by_category.push({
      category: cat,
      predicted: withFixed,
      avg3m: avg,
      trend,
      icon: CATEGORY_ICONS[cat] || '➕',
    });
  }

  // Add fixed categories not in transactions
  for (const [cat, amount] of Object.entries(fixedByCategory)) {
    if (!allCategories.has(cat)) {
      by_category.push({ category: cat, predicted: amount, avg3m: amount, trend: 'stable', icon: CATEGORY_ICONS[cat] || '➕' });
    }
  }

  by_category.sort((a, b) => b.predicted - a.predicted);

  const predicted_expenses = by_category.reduce((s, c) => s + c.predicted, 0);
  const predicted_savings = predicted_income - predicted_expenses;

  // Confidence: higher with more data
  const hasData = transactions.length > 0;
  const confidence = hasData ? Math.min(0.95, 0.5 + transactions.length * 0.01) : 0.3;

  // Insights
  const insights: string[] = [];
  const trending_up = by_category.filter(c => c.trend === 'up').map(c => c.category);
  const trending_down = by_category.filter(c => c.trend === 'down').map(c => c.category);

  if (trending_up.length > 0) {
    insights.push(`📈 Gastos crescentes em: ${trending_up.slice(0, 2).join(', ')}`);
  }
  if (trending_down.length > 0) {
    insights.push(`📉 Você está economizando em: ${trending_down.slice(0, 2).join(', ')}`);
  }
  if (predicted_savings > 0) {
    insights.push(`💰 Previsão de economia de R$${predicted_savings.toFixed(2)} no próximo mês`);
  } else if (predicted_savings < 0) {
    insights.push(`⚠️ Gastos previstos superam a renda em R$${Math.abs(predicted_savings).toFixed(2)}`);
  }
  if (fixedExpenses.length > 0) {
    const fixedTotal = fixedExpenses.filter(f => f.is_active).reduce((s, f) => s + f.amount, 0);
    const fixedPct = predicted_income > 0 ? (fixedTotal / predicted_income) * 100 : 0;
    insights.push(`📋 Gastos fixos representam ${fixedPct.toFixed(0)}% da sua renda prevista`);
  }

  return { month: monthKey, predicted_income, predicted_expenses, predicted_savings, confidence, by_category, insights };
}
