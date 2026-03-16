export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  savings_goal: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'entrada' | 'saida';
  amount: number;
  description: string | null;
  category: string;
  payment_method: 'credito' | 'debito' | 'pix' | 'dinheiro' | 'transferencia';
  date: string;
  created_at: string;
}

export interface FixedExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  due_day: number;
  is_active: boolean;
  created_at: string;
}

export interface FixedExpensePayment {
  id: string;
  fixed_expense_id: string;
  month: number;
  year: number;
  paid_at: string;
}

export type AssetType = 'acao' | 'fii' | 'etf' | 'bdr' | 'renda_fixa' | 'cripto' | 'outro';

export const ASSET_TYPES: { id: AssetType; label: string; icon: string; desc: string }[] = [
  { id: 'acao',       label: 'Ações',       icon: '🏢', desc: 'PETR4, VALE3...' },
  { id: 'fii',        label: 'Fundo Imob.', icon: '🏗️', desc: 'HGLG11, KNRI11...' },
  { id: 'etf',        label: 'ETF',         icon: '📊', desc: 'BOVA11, SMAL11...' },
  { id: 'bdr',        label: 'BDR',         icon: '🌎', desc: 'AAPL34, AMZO34...' },
  { id: 'renda_fixa', label: 'Renda Fixa',  icon: '💰', desc: 'CDB, Tesouro...' },
  { id: 'cripto',     label: 'Cripto',      icon: '₿',  desc: 'BTC, ETH...' },
  { id: 'outro',      label: 'Outro',       icon: '➕', desc: 'Outros ativos' },
];

export type YieldType = 'pre' | 'pos_cdi' | 'ipca';

export const YIELD_TYPES: { id: YieldType; label: string; desc: string }[] = [
  { id: 'pre',     label: 'Prefixado',  desc: 'Taxa fixa ao ano' },
  { id: 'pos_cdi', label: '% do CDI',   desc: 'Pós-fixado CDI' },
  { id: 'ipca',    label: 'IPCA+',      desc: 'Inflação + taxa' },
];

export const FIXED_INCOME_PRODUCTS = [
  'CDB', 'LCI', 'LCA', 'Tesouro Selic', 'Tesouro IPCA+',
  'Tesouro Prefixado', 'Debenture', 'CRI', 'CRA', 'Outro',
];

export interface Stock {
  id: string;
  user_id: string;
  ticker: string;
  quantity: number;
  avg_price: number;
  asset_type: AssetType;
  created_at: string;
  purchase_date?: string | null;
  yield_rate?: number | null;
  yield_type?: YieldType | null;
  institution?: string | null;
  maturity_date?: string | null;
  admin_fee?: number | null;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  icon: string;
  color: string;
  completed_at: string | null;
  created_at: string;
}

export interface GoalDeposit {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  xp_earned: number;
  created_at: string;
}

export const CATEGORIES = [
  { id: 'moradia',      name: 'Moradia',      icon: '🏠', color: '#FF6B6B' },
  { id: 'transporte',   name: 'Transporte',   icon: '🚗', color: '#4ECDC4' },
  { id: 'alimentacao',  name: 'Alimentação',  icon: '🍔', color: '#FFE66D' },
  { id: 'educacao',     name: 'Educação',     icon: '🎓', color: '#95E1D3' },
  { id: 'lazer',        name: 'Lazer',        icon: '🎮', color: '#DDA0DD' },
  { id: 'saude',        name: 'Saúde',        icon: '💊', color: '#98D8C8' },
  { id: 'vestuario',    name: 'Vestuário',    icon: '👕', color: '#F7DC6F' },
  { id: 'assinaturas',  name: 'Assinaturas',  icon: '📱', color: '#BB8FCE' },
  { id: 'contas',       name: 'Contas',       icon: '📄', color: '#85C1E9' },
  { id: 'investimentos',name: 'Investimentos',icon: '💰', color: '#00FF88' },
  { id: 'presentes',    name: 'Presentes',    icon: '🎁', color: '#F1948A' },
  { id: 'trabalho',     name: 'Trabalho',     icon: '💼', color: '#AED6F1' },
  { id: 'pets',         name: 'Pets',         icon: '🐾', color: '#FADBD8' },
  { id: 'outros',       name: 'Outros',       icon: '➕', color: '#BDC3C7' },
] as const;

export const PAYMENT_METHODS = [
  { id: 'credito',      name: 'Crédito',      icon: '💳' },
  { id: 'debito',       name: 'Débito',        icon: '💳' },
  { id: 'pix',          name: 'PIX',           icon: '⚡' },
  { id: 'dinheiro',     name: 'Dinheiro',      icon: '💵' },
  { id: 'transferencia',name: 'Transferência', icon: '🏦' },
] as const;

export type DebtType = 'cartao' | 'emprestimo' | 'financiamento' | 'cheque_especial' | 'pessoal';

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  type: DebtType;
  total_amount: number;
  remaining_amount: number;
  installments_total: number;
  installments_paid: number;
  installment_value: number;
  interest_rate?: number | null;
  start_date: string;
  due_day: number;
  creditor?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  payment_date: string;
  installment_number: number;
  created_at: string;
}

export const DEBT_TYPES: { id: DebtType; label: string; icon: string }[] = [
  { id: 'cartao',         label: 'Cartão de Crédito', icon: '💳' },
  { id: 'emprestimo',     label: 'Empréstimo',         icon: '🏦' },
  { id: 'financiamento',  label: 'Financiamento',      icon: '🏠' },
  { id: 'cheque_especial',label: 'Cheque Especial',    icon: '📋' },
  { id: 'pessoal',        label: 'Dívida Pessoal',     icon: '🤝' },
];

export type SubscriptionCategory = 'streaming' | 'musica' | 'cloud' | 'software' | 'jogos' | 'noticias' | 'fitness' | 'outros';
export type BillingCycle = 'mensal' | 'trimestral' | 'semestral' | 'anual';

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  category: SubscriptionCategory;
  amount: number;
  billing_cycle: BillingCycle;
  billing_day: number;
  is_active: boolean;
  logo_url?: string | null;
  created_at: string;
}

export const SUBSCRIPTION_CATEGORIES: { id: SubscriptionCategory; label: string; icon: string }[] = [
  { id: 'streaming', label: 'Streaming',  icon: '🎬' },
  { id: 'musica',    label: 'Música',     icon: '🎵' },
  { id: 'cloud',     label: 'Cloud',      icon: '☁️' },
  { id: 'software',  label: 'Software',   icon: '💻' },
  { id: 'jogos',     label: 'Jogos',      icon: '🎮' },
  { id: 'noticias',  label: 'Notícias',   icon: '📰' },
  { id: 'fitness',   label: 'Fitness',    icon: '💪' },
  { id: 'outros',    label: 'Outros',     icon: '➕' },
];

export const BILLING_CYCLES: { id: BillingCycle; label: string; months: number }[] = [
  { id: 'mensal',     label: 'Mensal',     months: 1  },
  { id: 'trimestral', label: 'Trimestral', months: 3  },
  { id: 'semestral',  label: 'Semestral',  months: 6  },
  { id: 'anual',      label: 'Anual',      months: 12 },
];

export const SUBSCRIPTION_LOGOS: Record<string, string> = {
  netflix:       'https://logo.clearbit.com/netflix.com',
  spotify:       'https://logo.clearbit.com/spotify.com',
  amazon:        'https://logo.clearbit.com/amazon.com',
  'disney+':     'https://logo.clearbit.com/disneyplus.com',
  'disney plus': 'https://logo.clearbit.com/disneyplus.com',
  hbo:           'https://logo.clearbit.com/hbomax.com',
  apple:         'https://logo.clearbit.com/apple.com',
  youtube:       'https://logo.clearbit.com/youtube.com',
  chatgpt:       'https://logo.clearbit.com/openai.com',
  openai:        'https://logo.clearbit.com/openai.com',
  github:        'https://logo.clearbit.com/github.com',
  dropbox:       'https://logo.clearbit.com/dropbox.com',
  notion:        'https://logo.clearbit.com/notion.so',
  figma:         'https://logo.clearbit.com/figma.com',
  adobe:         'https://logo.clearbit.com/adobe.com',
  canva:         'https://logo.clearbit.com/canva.com',
  linkedin:      'https://logo.clearbit.com/linkedin.com',
  duolingo:      'https://logo.clearbit.com/duolingo.com',
};

export interface Streak {
  id: string;
  user_id: string;
  type: string;
  current_count: number;
  best_count: number;
  last_date: string | null;
}

export const ACHIEVEMENTS_DATA = [
  { code: 'first_transaction', name: 'Primeiro Passo',    description: 'Registrar primeira transação',   icon: '👣', category: 'Primeiros Passos' },
  { code: 'first_deposit',     name: 'Cofrinho',          description: 'Primeiro depósito em objetivo',  icon: '🐷', category: 'Primeiros Passos' },
  { code: 'first_stock',       name: 'Investidor',        description: 'Primeiro ativo na carteira',     icon: '📊', category: 'Primeiros Passos' },
  { code: 'streak_7',          name: 'Consistente',       description: '7 dias seguidos registrando',    icon: '🔥', category: 'Consistência' },
  { code: 'streak_30',         name: 'Hábito de Ouro',    description: '30 dias de streak',              icon: '⭐', category: 'Consistência' },
  { code: 'saved_1k',          name: 'Mil Guardados',     description: 'Acumular R$1.000 em objetivos',  icon: '💰', category: 'Poupança' },
  { code: 'saved_10k',         name: 'Dez Mil',           description: 'Acumular R$10.000 em objetivos', icon: '💎', category: 'Poupança' },
  { code: 'goal_completed',    name: 'Sonho Realizado',   description: 'Completar primeiro objetivo',    icon: '🌟', category: 'Objetivos' },
  { code: 'goals_5',           name: 'Realizador',        description: 'Completar 5 objetivos',          icon: '🏅', category: 'Objetivos' },
  { code: 'economy_500',       name: 'Economista',        description: 'Economizar R$500 em um mês',     icon: '📊', category: 'Finanças' },
  { code: 'stocks_10',         name: 'Diversificação',    description: '10+ ativos na carteira',         icon: '📈', category: 'Finanças' },
];
