import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthContext as useAuth } from '@/lib/hooks/useAuthContext';
import { useMonthTransactions, useTransactions } from '@/lib/hooks/useTransactions';
import { useGoals } from '@/lib/hooks/useGoals';
import { useFixedExpenses } from '@/lib/hooks/useFixedExpenses';
import { Card } from '@/components/ui/Card';
import { formatCurrency, getLevelBadge, getLevelName } from '@/lib/utils/format';
import { colors } from '@/theme/colors';
import { CATEGORIES } from '@/types';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { transactions: allTx } = useTransactions(profile?.id);
  const { income, expense, savings } = useMonthTransactions(profile?.id);
  const { goals } = useGoals(profile?.id);
  const { expenses, isPaid, totalMonthly } = useFixedExpenses(profile?.id);

  const now = new Date();
  const monthName = now.toLocaleString('pt-BR', { month: 'long' });
  const xpProgress = ((profile?.xp || 0) % 100) / 100;
  const levelBadge = getLevelBadge(profile?.level || 1);
  const levelName = getLevelName(profile?.level || 1);

  const recentTx = allTx.slice(0, 5);
  const activeGoals = goals.filter(g => !g.completed_at).slice(0, 3);
  const pendingFixed = expenses.filter(e => e.is_active && !isPaid(e.id)).slice(0, 3);

  const expenseByCategory = allTx
    .filter(t => t.type === 'saida')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {profile?.name?.split(' ')[0] || 'usuário'} 👋</Text>
          <Text style={styles.month}>{monthName} {now.getFullYear()}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelEmoji}>{levelBadge}</Text>
          <Text style={styles.levelText}>Nv. {profile?.level || 1}</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpRow}>
        <Text style={styles.xpLabel}>{levelName} · {profile?.xp || 0} XP</Text>
        <Text style={styles.xpLabel}>Próx. nível</Text>
      </View>
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${Math.min(100, xpProgress * 100)}%` }]} />
      </View>

      {/* Summary Cards */}
      <View style={styles.grid3}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Text style={styles.summaryLabel}>Entradas</Text>
          <Text style={[styles.summaryValue, { color: colors.emerald }]}>{formatCurrency(income)}</Text>
        </View>
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryLabel}>Saídas</Text>
          <Text style={[styles.summaryValue, { color: colors.red }]}>{formatCurrency(expense)}</Text>
        </View>
        <View style={[styles.summaryCard, savings >= 0 ? styles.savingsCard : styles.negCard]}>
          <Text style={styles.summaryLabel}>Saldo</Text>
          <Text style={[styles.summaryValue, { color: savings >= 0 ? colors.blue : colors.red }]}>{formatCurrency(savings)}</Text>
        </View>
      </View>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Maiores gastos</Text>
          {topCategories.map(([catId, amount]) => {
            const cat = CATEGORIES.find(c => c.id === catId);
            const pct = expense > 0 ? (amount / expense) * 100 : 0;
            return (
              <View key={catId} style={styles.catRow}>
                <Text style={styles.catIcon}>{cat?.icon || '➕'}</Text>
                <View style={styles.catInfo}>
                  <View style={styles.catLabelRow}>
                    <Text style={styles.catName}>{cat?.name || catId}</Text>
                    <Text style={styles.catAmount}>{formatCurrency(amount)}</Text>
                  </View>
                  <View style={styles.catTrack}>
                    <View style={[styles.catFill, { width: `${pct}%`, backgroundColor: cat?.color || colors.blue }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      {/* Pending Fixed */}
      {pendingFixed.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Contas a pagar</Text>
          {pendingFixed.map(exp => {
            const today = new Date().getDate();
            const daysLeft = exp.due_day - today;
            const isOverdue = daysLeft < 0;
            return (
              <View key={exp.id} style={styles.fixedRow}>
                <View>
                  <Text style={styles.fixedName}>{exp.name}</Text>
                  <Text style={[styles.fixedDue, isOverdue ? { color: colors.red } : { color: colors.amber }]}>
                    {isOverdue ? `Atrasado ${Math.abs(daysLeft)}d` : `Vence em ${daysLeft}d`}
                  </Text>
                </View>
                <Text style={styles.fixedAmount}>{formatCurrency(exp.amount)}</Text>
              </View>
            );
          })}
        </Card>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivos em andamento</Text>
          {activeGoals.map(goal => {
            const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
            return (
              <View key={goal.id} style={styles.goalRow}>
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <View style={styles.goalInfo}>
                  <View style={styles.goalLabelRow}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalPct}>{pct.toFixed(0)}%</Text>
                  </View>
                  <View style={styles.goalTrack}>
                    <View style={[styles.goalFill, { width: `${pct}%`, backgroundColor: goal.color }]} />
                  </View>
                  <Text style={styles.goalValues}>{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</Text>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      {/* Recent Transactions */}
      {recentTx.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Transações recentes</Text>
          {recentTx.map(tx => {
            const cat = CATEGORIES.find(c => c.id === tx.category);
            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: cat?.color + '25' }]}>
                  <Text>{cat?.icon || '➕'}</Text>
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>{tx.description || cat?.name || tx.category}</Text>
                  <Text style={styles.txDate}>{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'entrada' ? colors.emerald : colors.red }]}>
                  {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
                </Text>
              </View>
            );
          })}
        </Card>
      )}

      {recentTx.length === 0 && activeGoals.length === 0 && (
        <Card style={styles.empty}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>Bem-vindo ao FinanceApp!</Text>
          <Text style={styles.emptyDesc}>Adicione transações e objetivos para começar a acompanhar suas finanças.</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: '800', color: colors.text },
  month: { fontSize: 13, color: colors.textFaint, marginTop: 2 },
  levelBadge: { backgroundColor: colors.blueBg, borderWidth: 1, borderColor: colors.blueBorder, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  levelEmoji: { fontSize: 18 },
  levelText: { fontSize: 11, color: colors.blue, fontWeight: '700', marginTop: 2 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { fontSize: 11, color: colors.textFaint },
  xpTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3 },
  xpFill: { height: 6, backgroundColor: colors.blue, borderRadius: 3 },
  grid3: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1 },
  incomeCard: { backgroundColor: colors.emeraldBg, borderColor: colors.emeraldBorder },
  expenseCard: { backgroundColor: colors.redBg, borderColor: colors.redBorder },
  savingsCard: { backgroundColor: colors.blueBg, borderColor: colors.blueBorder },
  negCard: { backgroundColor: colors.redBg, borderColor: colors.redBorder },
  summaryLabel: { fontSize: 10, color: colors.textFaint, fontWeight: '600', marginBottom: 6 },
  summaryValue: { fontSize: 13, fontWeight: '700' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catIcon: { fontSize: 20 },
  catInfo: { flex: 1, gap: 4 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 13, color: colors.textMuted },
  catAmount: { fontSize: 13, color: colors.text, fontWeight: '600' },
  catTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2 },
  catFill: { height: 4, borderRadius: 2 },
  fixedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  fixedName: { fontSize: 13, color: colors.text, fontWeight: '600' },
  fixedDue: { fontSize: 11, marginTop: 2 },
  fixedAmount: { fontSize: 14, fontWeight: '700', color: colors.text },
  goalRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  goalIcon: { fontSize: 22, marginTop: 2 },
  goalInfo: { flex: 1, gap: 4 },
  goalLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalName: { fontSize: 13, color: colors.text, fontWeight: '600' },
  goalPct: { fontSize: 12, color: colors.textMuted },
  goalTrack: { height: 5, backgroundColor: colors.border, borderRadius: 2.5 },
  goalFill: { height: 5, borderRadius: 2.5 },
  goalValues: { fontSize: 11, color: colors.textFaint },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 13, color: colors.text, fontWeight: '500' },
  txDate: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  txAmount: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyDesc: { fontSize: 13, color: colors.textFaint, textAlign: 'center', lineHeight: 20 },
});
