import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/lib/hooks/useAuthContext';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useFixedExpenses } from '@/lib/hooks/useFixedExpenses';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import { predictNextMonth } from '@/lib/utils/predictions';
import { colors } from '@/theme/colors';

export default function PredictionsScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const { transactions } = useTransactions(profile?.id);
  const { expenses } = useFixedExpenses(profile?.id);

  const prediction = useMemo(
    () => predictNextMonth(transactions, expenses),
    [transactions, expenses]
  );

  const nextMonthLabel = new Date(prediction.month + '-01').toLocaleDateString('pt-BR', {
    month: 'long', year: 'numeric',
  });

  const confidencePct = Math.round(prediction.confidence * 100);
  const confidenceColor = prediction.confidence >= 0.7 ? colors.emerald : prediction.confidence >= 0.5 ? colors.amber : colors.red;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Previsão de Gastos</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month header */}
        <Card style={styles.monthCard}>
          <View style={styles.monthHeader}>
            <View>
              <Text style={styles.monthLabel}>Previsão para</Text>
              <Text style={styles.monthName} numberOfLines={1}>{nextMonthLabel}</Text>
            </View>
            <View style={[styles.confidenceBadge, { borderColor: confidenceColor + '44', backgroundColor: confidenceColor + '18' }]}>
              <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                {confidencePct}% confiança
              </Text>
            </View>
          </View>
          <Text style={styles.confidenceNote}>
            {transactions.length < 10
              ? '⚠️ Adicione mais transações para melhorar a precisão'
              : '✅ Baseado em seus últimos 3 meses de histórico'}
          </Text>
        </Card>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Renda Prevista</Text>
            <Text style={[styles.summaryValue, { color: colors.emerald }]}>
              {formatCurrency(prediction.predicted_income)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Gastos Previstos</Text>
            <Text style={[styles.summaryValue, { color: colors.red }]}>
              {formatCurrency(prediction.predicted_expenses)}
            </Text>
          </View>
        </View>

        <Card style={[styles.savingsCard, { borderColor: prediction.predicted_savings >= 0 ? colors.emerald + '44' : colors.red + '44' }]}>
          <Text style={styles.savingsLabel}>
            {prediction.predicted_savings >= 0 ? '💰 Economia prevista' : '⚠️ Déficit previsto'}
          </Text>
          <Text style={[styles.savingsValue, { color: prediction.predicted_savings >= 0 ? colors.emerald : colors.red }]}>
            {formatCurrency(Math.abs(prediction.predicted_savings))}
          </Text>
        </Card>

        {/* Insights */}
        {prediction.insights.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Insights</Text>
            {prediction.insights.map((insight, i) => (
              <View key={i} style={styles.insightRow}>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* By category */}
        {prediction.by_category.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Por Categoria</Text>
            {prediction.by_category.map(cat => {
              const trendColor = cat.trend === 'up' ? colors.red : cat.trend === 'down' ? colors.emerald : colors.textFaint;
              const trendIcon = cat.trend === 'up' ? '↑' : cat.trend === 'down' ? '↓' : '→';

              return (
                <View key={cat.category} style={styles.catRow}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                  <Text style={styles.catName} numberOfLines={1}>{cat.category}</Text>
                  <Text style={[styles.catTrend, { color: trendColor }]}>{trendIcon}</Text>
                  <Text style={styles.catAmount}>{formatCurrency(cat.predicted)}</Text>
                </View>
              );
            })}
          </Card>
        )}

        {transactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Sem dados ainda</Text>
            <Text style={styles.emptySub}>Adicione transações para ver as previsões</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: colors.text },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.text },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  monthCard: { gap: 8 },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  monthLabel: { fontSize: 11, color: colors.textFaint, textTransform: 'uppercase', fontWeight: '600' },
  monthName: { fontSize: 20, fontWeight: '800', color: colors.text, textTransform: 'capitalize' },
  confidenceBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  confidenceText: { fontSize: 11, fontWeight: '700' },
  confidenceNote: { fontSize: 12, color: colors.textFaint },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, gap: 4 },
  incomeCard: { backgroundColor: colors.emeraldBg, borderColor: colors.emeraldBorder },
  expenseCard: { backgroundColor: colors.redBg, borderColor: colors.redBorder },
  summaryLabel: { fontSize: 11, color: colors.textFaint, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: 16, fontWeight: '800' },
  savingsCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savingsLabel: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  savingsValue: { fontSize: 20, fontWeight: '800' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  insightRow: { backgroundColor: colors.bg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border },
  insightText: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
  catIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  catName: { flex: 1, fontSize: 13, color: colors.text, textTransform: 'capitalize' },
  catTrend: { fontSize: 14, fontWeight: '700', width: 16, textAlign: 'center' },
  catAmount: { fontSize: 13, fontWeight: '700', color: colors.text, minWidth: 80, textAlign: 'right' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textFaint, textAlign: 'center' },
});
