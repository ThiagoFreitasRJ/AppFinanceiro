import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/lib/hooks/useAuthContext';
import { useTransactions, useMonthTransactions } from '@/lib/hooks/useTransactions';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';
import { compareWithAverage, getComparisonSummary } from '@/lib/utils/brazilianAverage';
import { colors } from '@/theme/colors';

export default function CompareScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const now = new Date();
  const { transactions, income: totalIncome, expense: totalExpense } = useMonthTransactions(profile?.id, now.getMonth() + 1, now.getFullYear());

  const spendingByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type === 'saida') {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    }
    return map;
  }, [transactions]);

  const comparisons = useMemo(
    () => compareWithAverage(spendingByCategory, totalIncome || 1),
    [spendingByCategory, totalIncome]
  );

  const insights = useMemo(() => getComparisonSummary(comparisons), [comparisons]);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const brAvgSavings = 100 - Object.values({
    moradia: 36.5, alimentacao: 17.5, transporte: 15.9, saude: 8.0,
    educacao: 4.7, vestuario: 4.2, lazer: 3.8, assinaturas: 2.5, contas: 3.5, outros: 2.4,
  }).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comparativo Brasileiro</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Top summary */}
        <Card style={styles.topCard}>
          <Text style={styles.topTitle}>🇧🇷 Seu perfil vs. Média Brasileira</Text>
          <Text style={styles.topSub}>Fonte: IBGE — Pesquisa de Orçamentos Familiares</Text>
          <View style={styles.savingsRow}>
            <View style={styles.savingsItem}>
              <Text style={styles.savingsLabel}>Sua taxa de poupança</Text>
              <Text style={[styles.savingsValue, { color: savingsRate >= brAvgSavings ? colors.emerald : colors.red }]}>
                {savingsRate.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.savingsDivider} />
            <View style={styles.savingsItem}>
              <Text style={styles.savingsLabel}>Média Brasil</Text>
              <Text style={styles.savingsValue}>{brAvgSavings.toFixed(1)}%</Text>
            </View>
          </View>
        </Card>

        {/* Insights */}
        {insights.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Destaques</Text>
            {insights.map((insight, i) => (
              <View key={i} style={styles.insightRow}>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Category comparison */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Por Categoria</Text>
          {comparisons.map(c => {
            const userBarWidth = Math.min(100, c.userPercent * 2);
            const avgBarWidth = Math.min(100, c.avgPercent * 2);
            const statusColor = c.status === 'acima' ? colors.red : c.status === 'abaixo' ? colors.emerald : colors.blue;
            const diffSign = c.difference > 0 ? '+' : '';

            return (
              <View key={c.category} style={styles.catBlock}>
                <View style={styles.catHeaderRow}>
                  <Text style={styles.catIcon}>{c.icon}</Text>
                  <Text style={styles.catLabel}>{c.label}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor + '44' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {diffSign}{c.difference.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                {/* Your bar */}
                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>Você</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${userBarWidth}%`, backgroundColor: statusColor }]} />
                  </View>
                  <Text style={styles.barPct}>{c.userPercent.toFixed(1)}%</Text>
                </View>

                {/* Average bar */}
                <View style={styles.barRow}>
                  <Text style={styles.barLabel}>BR</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${avgBarWidth}%`, backgroundColor: colors.textFaint }]} />
                  </View>
                  <Text style={styles.barPct}>{c.avgPercent.toFixed(1)}%</Text>
                </View>

                {c.userAmount > 0 && (
                  <Text style={styles.catAmount}>{formatCurrency(c.userAmount)} este mês</Text>
                )}
              </View>
            );
          })}
        </Card>

        {totalIncome === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Sem dados de renda</Text>
            <Text style={styles.emptySub}>Registre entradas e saídas para ver o comparativo</Text>
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
  topCard: { gap: 10 },
  topTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  topSub: { fontSize: 11, color: colors.textFaint },
  savingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: colors.bg, borderRadius: 12, padding: 14, marginTop: 4 },
  savingsItem: { alignItems: 'center', gap: 4 },
  savingsLabel: { fontSize: 11, color: colors.textFaint, textAlign: 'center' },
  savingsValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  savingsDivider: { width: 1, height: 36, backgroundColor: colors.border },
  section: { gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  insightRow: { backgroundColor: colors.bg, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.border },
  insightText: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  catBlock: { gap: 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 4 },
  catHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catIcon: { fontSize: 16 },
  catLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 11, color: colors.textFaint, width: 26, textAlign: 'right' },
  barTrack: { flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3, minWidth: 3 },
  barPct: { fontSize: 11, color: colors.textFaint, width: 32, textAlign: 'right' },
  catAmount: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textFaint, textAlign: 'center' },
});
