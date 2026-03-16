export const BRAZILIAN_AVERAGE_PCT: Record<string, number> = {
  moradia:       36.5,
  alimentacao:   17.5,
  transporte:    15.9,
  saude:          8.0,
  educacao:       4.7,
  vestuario:      4.2,
  lazer:          3.8,
  assinaturas:    2.5,
  contas:         3.5,
  outros:         2.4,
};

export interface CategoryComparison {
  category: string;
  label: string;
  icon: string;
  userAmount: number;
  userPercent: number;
  avgPercent: number;
  difference: number;
  status: 'acima' | 'abaixo' | 'na_media';
}

const LABELS: Record<string, string> = {
  moradia: 'Moradia', alimentacao: 'Alimentação', transporte: 'Transporte',
  saude: 'Saúde', educacao: 'Educação', vestuario: 'Vestuário', lazer: 'Lazer',
  assinaturas: 'Assinaturas', contas: 'Contas', outros: 'Outros',
};

const ICONS: Record<string, string> = {
  moradia: '🏠', alimentacao: '🍔', transporte: '🚗', saude: '💊',
  educacao: '🎓', vestuario: '👕', lazer: '🎮', assinaturas: '📱',
  contas: '📄', outros: '➕',
};

export function compareWithAverage(
  userSpending: Record<string, number>,
  totalIncome: number,
): CategoryComparison[] {
  const allCategories = new Set([
    ...Object.keys(userSpending),
    ...Object.keys(BRAZILIAN_AVERAGE_PCT),
  ]);

  return Array.from(allCategories).map(category => {
    const userAmount = userSpending[category] || 0;
    const userPercent = totalIncome > 0 ? (userAmount / totalIncome) * 100 : 0;
    const avgPercent = BRAZILIAN_AVERAGE_PCT[category] || 2;
    const difference = userPercent - avgPercent;

    return {
      category,
      label: LABELS[category] || category,
      icon: ICONS[category] || '➕',
      userAmount,
      userPercent,
      avgPercent,
      difference,
      status: Math.abs(difference) < 2 ? 'na_media' : difference > 0 ? 'acima' : 'abaixo',
    };
  }).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}

export function getComparisonSummary(comparisons: CategoryComparison[]): string[] {
  const insights: string[] = [];
  const above = comparisons.filter(c => c.status === 'acima');
  const below = comparisons.filter(c => c.status === 'abaixo');

  for (const c of above.slice(0, 2)) {
    insights.push(`Você gasta ${c.difference.toFixed(1)}% a mais que a média em ${c.label}`);
  }
  for (const c of below.slice(0, 2)) {
    insights.push(`Você economiza ${Math.abs(c.difference).toFixed(1)}% a mais que a média em ${c.label}`);
  }
  return insights;
}
