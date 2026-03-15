-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  savings_goal DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('entrada', 'saida')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('credito', 'debito', 'pix', 'dinheiro', 'transferencia')),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fixed Expenses
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fixed Expense Payments
CREATE TABLE IF NOT EXISTS fixed_expense_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixed_expense_id UUID REFERENCES fixed_expenses(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  paid_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(fixed_expense_id, month, year)
);

-- Stocks
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  quantity DECIMAL(12,6) NOT NULL,
  avg_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- Dividends
CREATE TABLE IF NOT EXISTS dividends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  deadline DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#0066FF',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Goal Deposits
CREATE TABLE IF NOT EXISTS goal_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  xp_earned INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_code TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_code)
);

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'savings',
  current_count INTEGER DEFAULT 0,
  best_count INTEGER DEFAULT 0,
  last_date DATE,
  UNIQUE(user_id, type)
);

-- Weekly Challenges
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  target_value DECIMAL(12,2),
  current_value DECIMAL(12,2) DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  week_start DATE NOT NULL,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_goal_deposits_user ON goal_deposits(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_stocks_user ON stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expense_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own fixed_expenses" ON fixed_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own payments" ON fixed_expense_payments FOR ALL USING (
  auth.uid() = (SELECT user_id FROM fixed_expenses WHERE id = fixed_expense_id)
);
CREATE POLICY "Users can manage own stocks" ON stocks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own dividends" ON dividends FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own deposits" ON goal_deposits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own streaks" ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own challenges" ON weekly_challenges FOR ALL USING (auth.uid() = user_id);
