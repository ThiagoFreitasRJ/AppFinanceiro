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

export interface Stock {
  id: string;
  user_id: string;
  ticker: string;
  quantity: number;
  avg_price: number;
  created_at: string;
}

export interface Dividend {
  id: string;
  user_id: string;
  ticker: string;
  amount: number;
  date: string;
  created_at: string;
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

export interface Achievement {
  id: string;
  user_id: string;
  achievement_code: string;
  unlocked_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  type: string;
  current_count: number;
  best_count: number;
  last_date: string | null;
}

export interface WeeklyChallenge {
  id: string;
  user_id: string;
  challenge_type: string;
  target_value: number | null;
  current_value: number;
  xp_reward: number;
  week_start: string;
  completed_at: string | null;
  created_at: string;
}

export const CATEGORIES = [
  { id: 'moradia', name: 'Moradia', icon: '🏠', color: '#FF6B6B' },
  { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#4ECDC4' },
  { id: 'alimentacao', name: 'Alimentação', icon: '🍔', color: '#FFE66D' },
  { id: 'educacao', name: 'Educação', icon: '🎓', color: '#95E1D3' },
  { id: 'lazer', name: 'Lazer', icon: '🎮', color: '#DDA0DD' },
  { id: 'saude', name: 'Saúde', icon: '💊', color: '#98D8C8' },
  { id: 'vestuario', name: 'Vestuário', icon: '👕', color: '#F7DC6F' },
  { id: 'assinaturas', name: 'Assinaturas', icon: '📱', color: '#BB8FCE' },
  { id: 'contas', name: 'Contas', icon: '📄', color: '#85C1E9' },
  { id: 'investimentos', name: 'Investimentos', icon: '💰', color: '#00FF88' },
  { id: 'presentes', name: 'Presentes', icon: '🎁', color: '#F1948A' },
  { id: 'trabalho', name: 'Trabalho', icon: '💼', color: '#AED6F1' },
  { id: 'pets', name: 'Pets', icon: '🐾', color: '#FADBD8' },
  { id: 'outros', name: 'Outros', icon: '➕', color: '#BDC3C7' },
] as const;

export const PAYMENT_METHODS = [
  { id: 'credito', name: 'Crédito', icon: '💳' },
  { id: 'debito', name: 'Débito', icon: '💳' },
  { id: 'pix', name: 'PIX', icon: '⚡' },
  { id: 'dinheiro', name: 'Dinheiro', icon: '💵' },
  { id: 'transferencia', name: 'Transferência', icon: '🏦' },
] as const;

export const LEVELS = [
  { min: 0, max: 500, name: 'Iniciante', badge: '🌱', levels: [1, 2, 3, 4, 5] },
  { min: 501, max: 1500, name: 'Poupador', badge: '💰', levels: [6, 7, 8, 9, 10] },
  { min: 1501, max: 3500, name: 'Investidor', badge: '📈', levels: [11, 12, 13, 14, 15] },
  { min: 3501, max: 7000, name: 'Magnata', badge: '👑', levels: [16, 17, 18, 19, 20] },
  { min: 7001, max: 12000, name: 'Bilionário', badge: '💎', levels: [21, 22, 23, 24, 25] },
  { min: 12001, max: Infinity, name: 'Lenda', badge: '🏆', levels: [] },
];

export const ACHIEVEMENTS_DATA = [
  // Primeiros Passos
  { code: 'first_transaction', name: 'Primeiro Passo', description: 'Registrar primeira transação', icon: '👣', category: 'Primeiros Passos' },
  { code: 'first_deposit', name: 'Cofrinho', description: 'Primeiro depósito em objetivo', icon: '🐷', category: 'Primeiros Passos' },
  { code: 'three_goals', name: 'Diversificado', description: 'Criar 3 objetivos diferentes', icon: '🎯', category: 'Primeiros Passos' },
  { code: 'first_stock', name: 'Investidor', description: 'Adicionar primeiro ativo na carteira', icon: '📊', category: 'Primeiros Passos' },
  // Consistência
  { code: 'streak_7', name: 'Consistente', description: '7 dias seguidos registrando', icon: '🔥', category: 'Consistência' },
  { code: 'streak_30', name: 'Hábito de Ouro', description: '30 dias de streak', icon: '⭐', category: 'Consistência' },
  { code: 'streak_100', name: 'Centurião', description: '100 dias de streak', icon: '💯', category: 'Consistência' },
  { code: 'streak_365', name: 'Maratonista', description: '365 dias de streak', icon: '🏃', category: 'Consistência' },
  // Poupança
  { code: 'saved_1k', name: 'Mil Guardados', description: 'Acumular R$1.000 em objetivos', icon: '💰', category: 'Poupança' },
  { code: 'saved_5k', name: 'Cinco Mil', description: 'Acumular R$5.000 em objetivos', icon: '💵', category: 'Poupança' },
  { code: 'saved_10k', name: 'Dez Mil', description: 'Acumular R$10.000 em objetivos', icon: '💎', category: 'Poupança' },
  { code: 'saved_100k', name: 'Cem Mil', description: 'Acumular R$100.000 em objetivos', icon: '👑', category: 'Poupança' },
  // Objetivos
  { code: 'goal_completed', name: 'Sonho Realizado', description: 'Completar primeiro objetivo', icon: '🌟', category: 'Objetivos' },
  { code: 'goals_5', name: 'Realizador', description: 'Completar 5 objetivos', icon: '🏅', category: 'Objetivos' },
  { code: 'goals_10', name: 'Imparável', description: 'Completar 10 objetivos', icon: '🚀', category: 'Objetivos' },
  { code: 'goal_early', name: 'Speed Runner', description: 'Completar objetivo antes do prazo', icon: '⚡', category: 'Objetivos' },
  // Finanças
  { code: 'economy_500', name: 'Economista', description: 'Economizar R$500 em um mês', icon: '📊', category: 'Finanças' },
  { code: 'pix_50', name: 'Mestre do PIX', description: '50 transações via PIX', icon: '⚡', category: 'Finanças' },
  { code: 'stocks_10', name: 'Diversificação', description: 'Ter 10+ ativos na carteira', icon: '📈', category: 'Finanças' },
  // Especiais
  { code: 'early_bird', name: 'Madrugador', description: 'Registrar transação antes das 6h', icon: '🌅', category: 'Especiais' },
  { code: 'night_owl', name: 'Coruja', description: 'Registrar transação após meia-noite', icon: '🦉', category: 'Especiais' },
  { code: 'fixed_10', name: 'Organizador', description: 'Cadastrar 10 gastos fixos', icon: '📋', category: 'Especiais' },
];
