import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/lib/hooks/useAuthContext';
import { useMonthTransactions } from '@/lib/hooks/useTransactions';
import { useGoals } from '@/lib/hooks/useGoals';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/format';
import { generatePDFReport } from '@/lib/services/pdf';
import { generateExcelReport } from '@/lib/services/excel';
import { colors } from '@/theme/colors';

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export default function ReportsScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingXLS, setLoadingXLS] = useState(false);

  const { transactions, income, expense, savings } = useMonthTransactions(profile?.id, month, year);
  const { goals } = useGoals(profile?.id);

  const categoryTotals = transactions.reduce<Record<string, number>>((acc, t) => {
    if (t.type === 'saida') acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const reportData = {
    userName: profile?.name || 'Usuário',
    month: `${MONTHS[month - 1]} ${year}`,
    income, expense, savings,
    transactions, goals,
    categoryTotals,
  };

  async function handlePDF() {
    setLoadingPDF(true);
    try {
      await generatePDFReport(reportData);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Não foi possível gerar o PDF');
    }
    setLoadingPDF(false);
  }

  async function handleExcel() {
    setLoadingXLS(true);
    try {
      await generateExcelReport(reportData);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Não foi possível gerar o Excel');
    }
    setLoadingXLS(false);
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthArrow}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[month - 1]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthArrow}>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: colors.emerald + '44' }]}>
            <Text style={styles.summaryLabel}>Entradas</Text>
            <Text style={[styles.summaryValue, { color: colors.emerald }]}>{formatCurrency(income)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: colors.red + '44' }]}>
            <Text style={styles.summaryLabel}>Saídas</Text>
            <Text style={[styles.summaryValue, { color: colors.red }]}>{formatCurrency(expense)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: colors.blue + '44' }]}>
            <Text style={styles.summaryLabel}>Economia</Text>
            <Text style={[styles.summaryValue, { color: colors.blue }]}>{formatCurrency(savings)}</Text>
          </View>
        </View>

        {/* Top categories */}
        {topCategories.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>💸 Top 5 Categorias</Text>
            {topCategories.map(([cat, amount]) => (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catName}>{cat}</Text>
                <Text style={styles.catAmount}>{formatCurrency(amount)}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Transactions count */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{transactions.length}</Text>
              <Text style={styles.statLabel}>Transações</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{transactions.filter(t => t.type === 'entrada').length}</Text>
              <Text style={styles.statLabel}>Entradas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{transactions.filter(t => t.type === 'saida').length}</Text>
              <Text style={styles.statLabel}>Saídas</Text>
            </View>
          </View>
        </Card>

        {/* Export buttons */}
        <Card style={styles.exportSection}>
          <Text style={styles.sectionTitle}>📤 Exportar Relatório</Text>
          <Text style={styles.exportSub}>Relatório de {MONTHS[month - 1]} {year} com {transactions.length} transações</Text>

          <Button onPress={handlePDF} loading={loadingPDF} size="lg">
            📄 Exportar como PDF
          </Button>
          <Button onPress={handleExcel} loading={loadingXLS} variant="secondary" size="lg">
            📊 Exportar como Excel
          </Button>
        </Card>

        {transactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Sem dados neste mês</Text>
            <Text style={styles.emptySub}>Selecione outro período ou adicione transações</Text>
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
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border, gap: 20 },
  monthArrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 24, color: colors.blue, fontWeight: '700' },
  monthLabel: { fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 140, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1, gap: 4 },
  summaryLabel: { fontSize: 10, color: colors.textFaint, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: 14, fontWeight: '800' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  catName: { fontSize: 13, color: colors.textMuted, textTransform: 'capitalize' },
  catAmount: { fontSize: 13, fontWeight: '700', color: colors.red },
  statsCard: { padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textFaint },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  exportSection: { gap: 12 },
  exportSub: { fontSize: 12, color: colors.textFaint, marginBottom: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textFaint, textAlign: 'center' },
});
