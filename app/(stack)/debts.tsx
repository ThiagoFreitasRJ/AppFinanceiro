import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/lib/hooks/useAuthContext';
import { useDebts } from '@/lib/hooks/useDebts';
import { AppModal } from '@/components/ui/AppModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils/format';
import { colors } from '@/theme/colors';
import { DEBT_TYPES, DebtType } from '@/types';

const DEBT_COLORS: Record<DebtType, string> = {
  cartao:          '#ef4444',
  emprestimo:      '#f59e0b',
  financiamento:   '#3b82f6',
  cheque_especial: '#8b5cf6',
  pessoal:         '#10b981',
};

export default function DebtsScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const {
    debts, loading,
    totalDebt, monthlyInstallments, maxMonthsLeft,
    addDebt, payInstallment, deleteDebt,
  } = useDebts(profile?.id);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', creditor: '',
    type: 'cartao' as DebtType,
    total_amount: '', installments_total: '',
    installment_value: '', due_day: '',
    interest_rate: '', start_date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  function updateForm(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleAdd() {
    if (!form.name || !form.total_amount || !form.installment_value || !form.installments_total) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }
    setSaving(true);
    const error = await addDebt({
      name: form.name.trim(),
      creditor: form.creditor.trim() || null,
      type: form.type,
      total_amount: parseFloat(form.total_amount.replace(',', '.')),
      remaining_amount: parseFloat(form.total_amount.replace(',', '.')),
      installments_total: parseInt(form.installments_total),
      installments_paid: 0,
      installment_value: parseFloat(form.installment_value.replace(',', '.')),
      due_day: parseInt(form.due_day) || 10,
      interest_rate: form.interest_rate ? parseFloat(form.interest_rate.replace(',', '.')) : null,
      start_date: form.start_date,
      is_active: true,
    });
    setSaving(false);
    if (error) { Alert.alert('Erro', error.message); return; }
    setShowAdd(false);
    setForm({ name: '', creditor: '', type: 'cartao', total_amount: '', installments_total: '', installment_value: '', due_day: '', interest_rate: '', start_date: new Date().toISOString().split('T')[0] });
  }

  function handlePay(id: string, name: string) {
    Alert.alert('Pagar Parcela', `Registrar pagamento de "${name}"?\n\n+30 XP 🎯`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => payInstallment(id) },
    ]);
  }

  function handleDelete(id: string, name: string) {
    Alert.alert('Remover Dívida', `Remover "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteDebt(id) },
    ]);
  }

  const payoffDate = maxMonthsLeft > 0
    ? new Date(new Date().getFullYear(), new Date().getMonth() + maxMonthsLeft, 1)
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Controle de Dívidas</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addBtn}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: '#ef4444' }]}>
            <Text style={styles.summaryLabel}>Total em Dívidas</Text>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{formatCurrency(totalDebt)}</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#f59e0b' }]}>
            <Text style={styles.summaryLabel}>Parcelas/Mês</Text>
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>{formatCurrency(monthlyInstallments)}</Text>
          </View>
        </View>

        {payoffDate && (
          <Card style={styles.payoffCard}>
            <Text style={styles.payoffLabel}>📅 Previsão de quitação total</Text>
            <Text style={styles.payoffDate}>{payoffDate}</Text>
            <Text style={styles.payoffSub}>em {maxMonthsLeft} parcela{maxMonthsLeft !== 1 ? 's' : ''}</Text>
          </Card>
        )}

        {/* Debts list */}
        {loading ? (
          <Text style={styles.empty}>Carregando...</Text>
        ) : debts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>Sem dívidas!</Text>
            <Text style={styles.emptySub}>Toque em + para registrar uma dívida</Text>
          </View>
        ) : (
          debts.map(debt => {
            const progress = debt.installments_paid / debt.installments_total;
            const remaining = debt.installments_total - debt.installments_paid;
            const debtColor = DEBT_COLORS[debt.type] || colors.blue;
            const typeInfo = DEBT_TYPES.find(t => t.id === debt.type);

            return (
              <Card key={debt.id} style={styles.debtCard}>
                <View style={styles.debtHeader}>
                  <View style={[styles.debtIcon, { backgroundColor: debtColor + '22' }]}>
                    <Text style={styles.debtIconText}>{typeInfo?.icon || '💳'}</Text>
                  </View>
                  <View style={styles.debtInfo}>
                    <Text style={styles.debtName}>{debt.name}</Text>
                    {debt.creditor && <Text style={styles.debtCreditor}>{debt.creditor}</Text>}
                    <View style={[styles.debtTypeBadge, { backgroundColor: debtColor + '22', borderColor: debtColor + '44' }]}>
                      <Text style={[styles.debtTypeText, { color: debtColor }]}>{typeInfo?.label || debt.type}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(debt.id, debt.name)} style={styles.deleteBtn}>
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Amounts */}
                <View style={styles.debtAmounts}>
                  <View>
                    <Text style={styles.amountLabel}>Restante</Text>
                    <Text style={[styles.amountValue, { color: '#ef4444' }]}>{formatCurrency(debt.remaining_amount)}</Text>
                  </View>
                  <View style={styles.amountDivider} />
                  <View>
                    <Text style={styles.amountLabel}>Parcela</Text>
                    <Text style={styles.amountValue}>{formatCurrency(debt.installment_value)}</Text>
                  </View>
                  <View style={styles.amountDivider} />
                  <View>
                    <Text style={styles.amountLabel}>Restam</Text>
                    <Text style={styles.amountValue}>{remaining}x</Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressWrap}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: debtColor }]} />
                  </View>
                  <Text style={styles.progressText}>{debt.installments_paid}/{debt.installments_total} parcelas</Text>
                </View>

                {remaining > 0 && (
                  <Button onPress={() => handlePay(debt.id, debt.name)} size="sm" variant="secondary">
                    💰 Pagar Parcela (+30 XP)
                  </Button>
                )}
                {remaining === 0 && (
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidText}>✅ Quitada!</Text>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Add Modal */}
      <AppModal visible={showAdd} onClose={() => setShowAdd(false)} title="Nova Dívida">
        <View style={styles.modalBody}>
          <Input label="Nome da dívida *" value={form.name} onChangeText={v => updateForm('name', v)} placeholder="Ex: Cartão Nubank" autoCapitalize="words" />
          <Input label="Credor (opcional)" value={form.creditor} onChangeText={v => updateForm('creditor', v)} placeholder="Ex: Nubank, Banco do Brasil" />

          <Text style={styles.fieldLabel}>Tipo *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {DEBT_TYPES.map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => updateForm('type', t.id)}
                style={[styles.typeChip, form.type === t.id && styles.typeChipActive]}
              >
                <Text style={styles.typeChipEmoji}>{t.icon}</Text>
                <Text style={[styles.typeChipText, form.type === t.id && styles.typeChipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input label="Valor total *" prefix="R$" value={form.total_amount} onChangeText={v => updateForm('total_amount', v)} keyboardType="decimal-pad" placeholder="5.000,00" />
            </View>
            <View style={styles.rowItem}>
              <Input label="N° parcelas *" value={form.installments_total} onChangeText={v => updateForm('installments_total', v)} keyboardType="numeric" placeholder="12" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input label="Valor parcela *" prefix="R$" value={form.installment_value} onChangeText={v => updateForm('installment_value', v)} keyboardType="decimal-pad" placeholder="500,00" />
            </View>
            <View style={styles.rowItem}>
              <Input label="Dia vencimento" value={form.due_day} onChangeText={v => updateForm('due_day', v)} keyboardType="numeric" placeholder="10" />
            </View>
          </View>
          <Input label="Taxa de juros (% a.m.)" suffix="%" value={form.interest_rate} onChangeText={v => updateForm('interest_rate', v)} keyboardType="decimal-pad" placeholder="2,5" />

          <Button onPress={handleAdd} loading={saving} size="lg">Salvar Dívida</Button>
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: colors.text },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.text },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  addIcon: { fontSize: 22, color: '#fff', lineHeight: 26 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 14, borderWidth: 1, gap: 4 },
  summaryLabel: { fontSize: 11, color: colors.textFaint, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  payoffCard: { gap: 2 },
  payoffLabel: { fontSize: 12, color: colors.textFaint },
  payoffDate: { fontSize: 18, fontWeight: '700', color: colors.blue, textTransform: 'capitalize' },
  payoffSub: { fontSize: 12, color: colors.textFaint },
  empty: { textAlign: 'center', color: colors.textFaint, marginTop: 40 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textFaint },
  debtCard: { gap: 14 },
  debtHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  debtIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  debtIconText: { fontSize: 22 },
  debtInfo: { flex: 1, gap: 4 },
  debtName: { fontSize: 15, fontWeight: '700', color: colors.text },
  debtCreditor: { fontSize: 12, color: colors.textFaint },
  debtTypeBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, marginTop: 2 },
  debtTypeText: { fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
  debtAmounts: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: colors.bg, borderRadius: 12, padding: 12 },
  amountLabel: { fontSize: 10, color: colors.textFaint, textAlign: 'center', textTransform: 'uppercase', fontWeight: '600', marginBottom: 2 },
  amountValue: { fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' },
  amountDivider: { width: 1, height: 30, backgroundColor: colors.border },
  progressWrap: { gap: 6 },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 11, color: colors.textFaint },
  paidBadge: { backgroundColor: colors.emeraldBg, borderRadius: 8, padding: 8, alignItems: 'center' },
  paidText: { fontSize: 13, color: colors.emerald, fontWeight: '600' },
  // Modal
  modalBody: { padding: 20, gap: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: -6 },
  typeScroll: { marginBottom: 4 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  typeChipActive: { backgroundColor: colors.blueBg, borderColor: colors.blue },
  typeChipEmoji: { fontSize: 16 },
  typeChipText: { fontSize: 12, color: colors.textFaint, fontWeight: '600' },
  typeChipTextActive: { color: colors.blue },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
});
