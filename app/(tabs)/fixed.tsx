import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuthContext as useAuth } from '@/lib/hooks/useAuthContext';
import { useFixedExpenses } from '@/lib/hooks/useFixedExpenses';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppModal } from '@/components/ui/AppModal';
import { formatCurrency } from '@/lib/utils/format';
import { colors } from '@/theme/colors';
import { CATEGORIES } from '@/types';

export default function FixedExpensesScreen() {
  const { profile } = useAuth();
  const { expenses, loading, createExpense, markAsPaid, deleteExpense, toggleExpense, isPaid, getStatus, totalMonthly } = useFixedExpenses(profile?.id);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('contas');
  const [dueDay, setDueDay] = useState('10');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    const val = parseFloat(amount.replace(',', '.'));
    const day = parseInt(dueDay);
    if (!name || !val || !day || day < 1 || day > 31) { Alert.alert('Atenção', 'Preencha os campos corretamente'); return; }
    setSubmitting(true);
    await createExpense({ name, amount: val, category, due_day: day, is_active: true });
    setShowModal(false); setName(''); setAmount(''); setDueDay('10');
    setSubmitting(false);
  }

  const statusColors: Record<string, string> = {
    paid: colors.emerald, overdue: colors.red, upcoming: colors.amber, normal: colors.textFaint,
  };
  const statusLabels: Record<string, string> = {
    paid: '✅ Pago', overdue: '⚠️ Atrasado', upcoming: '⏰ Próximo', normal: '📅 Normal',
  };

  const paidCount = expenses.filter(e => e.is_active && isPaid(e.id)).length;
  const totalActive = expenses.filter(e => e.is_active).length;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Gastos Fixos</Text>
          <Button onPress={() => setShowModal(true)} size="sm">+ Novo</Button>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.sumCard}>
            <Text style={styles.sumLabel}>Total mensal</Text>
            <Text style={styles.sumValue}>{formatCurrency(totalMonthly)}</Text>
          </View>
          <View style={styles.sumCard}>
            <Text style={styles.sumLabel}>Pagos</Text>
            <Text style={[styles.sumValue, { color: colors.emerald }]}>{paidCount}/{totalActive}</Text>
          </View>
        </View>

        {expenses.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Sem gastos fixos</Text>
            <Text style={styles.emptyDesc}>Cadastre suas contas recorrentes como aluguel, energia, internet...</Text>
            <Button onPress={() => setShowModal(true)} size="sm">Cadastrar gasto fixo</Button>
          </Card>
        ) : (
          <Card style={{ gap: 4 }}>
            {expenses.map(expense => {
              const status = getStatus(expense);
              const cat = CATEGORIES.find(c => c.id === expense.category);
              const paid = isPaid(expense.id);
              return (
                <View key={expense.id} style={[styles.expRow, !expense.is_active && styles.expInactive]}>
                  <View style={[styles.expIcon, { backgroundColor: (cat?.color || '#888') + '25' }]}>
                    <Text>{cat?.icon || '📄'}</Text>
                  </View>
                  <View style={styles.expInfo}>
                    <Text style={styles.expName}>{expense.name}</Text>
                    <Text style={[styles.expStatus, { color: statusColors[status] }]}>
                      {statusLabels[status]} · Dia {expense.due_day}
                    </Text>
                  </View>
                  <View style={styles.expRight}>
                    <Text style={styles.expAmount}>{formatCurrency(expense.amount)}</Text>
                    <View style={styles.expActions}>
                      {!paid && expense.is_active && (
                        <TouchableOpacity onPress={() => Alert.alert('Pagar', `Marcar "${expense.name}" como pago?`, [
                          { text: 'Cancelar' }, { text: 'Pagar', onPress: () => markAsPaid(expense.id) }
                        ])} style={styles.payBtn}>
                          <Text style={styles.payBtnText}>Pagar</Text>
                        </TouchableOpacity>
                      )}
                      <Switch value={expense.is_active} onValueChange={v => toggleExpense(expense.id, v)}
                        trackColor={{ false: colors.border, true: colors.blue }}
                        thumbColor={expense.is_active ? '#fff' : colors.textFaint} />
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Remover', `Remover "${expense.name}"?`, [
                    { text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: () => deleteExpense(expense.id) }
                  ])} style={styles.deleteBtn}>
                    <Text style={{ fontSize: 14, color: colors.textFainter }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>

      <AppModal visible={showModal} onClose={() => setShowModal(false)} title="Novo Gasto Fixo">
        <View style={styles.modalContent}>
          <Input label="Nome" value={name} onChangeText={setName} placeholder="Ex: Aluguel, Netflix..." />
          <Input label="Valor" prefix="R$" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0,00" />
          <Input label="Dia de vencimento" value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" placeholder="10" />

          <Text style={styles.fieldLabel}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c.id} style={[styles.catChip, category === c.id && styles.catChipActive]}
                  onPress={() => setCategory(c.id)}>
                  <Text>{c.icon}</Text>
                  <Text style={[styles.catText, category === c.id && { color: colors.blue }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Button onPress={handleCreate} loading={submitting} size="lg">Cadastrar</Button>
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  summaryRow: { flexDirection: 'row', gap: 12 },
  sumCard: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  sumLabel: { fontSize: 11, color: colors.textFaint, fontWeight: '600', marginBottom: 6 },
  sumValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyDesc: { fontSize: 13, color: colors.textFaint, textAlign: 'center', lineHeight: 18 },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  expInactive: { opacity: 0.5 },
  expIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  expInfo: { flex: 1 },
  expName: { fontSize: 14, fontWeight: '600', color: colors.text },
  expStatus: { fontSize: 11, marginTop: 2 },
  expRight: { alignItems: 'flex-end', gap: 4 },
  expAmount: { fontSize: 14, fontWeight: '700', color: colors.text },
  expActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  payBtn: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.emeraldBg, borderRadius: 8, borderWidth: 1, borderColor: colors.emeraldBorder },
  payBtnText: { fontSize: 11, color: colors.emerald, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  modalContent: { padding: 20, gap: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardAlt },
  catChipActive: { borderColor: colors.blue, backgroundColor: colors.blueBg },
  catText: { fontSize: 12, color: colors.textFaint },
});
