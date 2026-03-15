import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthContext as useAuth } from '@/lib/hooks/useAuthContext';
import { useMonthTransactions, useTransactions } from '@/lib/hooks/useTransactions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppModal } from '@/components/ui/AppModal';
import { formatCurrency } from '@/lib/utils/format';
import { colors } from '@/theme/colors';
import { CATEGORIES, PAYMENT_METHODS, Transaction } from '@/types';

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function TransactionsScreen() {
  const { profile } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { transactions, income, expense, savings } = useMonthTransactions(profile?.id, month, year);
  const { addTransaction, deleteTransaction } = useTransactions(profile?.id);

  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<'entrada' | 'saida'>('saida');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('outros');
  const [payMethod, setPayMethod] = useState<Transaction['payment_method']>('pix');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  function openModal() {
    setType('saida'); setDescription(''); setAmount(''); setCategory('outros');
    setPayMethod('pix'); setDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  }

  async function handleAdd() {
    const val = parseFloat(amount.replace(',', '.'));
    if (!val || val <= 0) { Alert.alert('Atenção', 'Informe um valor válido'); return; }
    setSubmitting(true);
    await addTransaction({ type, amount: val, description: description || null, category, payment_method: payMethod, date });
    setShowModal(false);
    setSubmitting(false);
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transações</Text>
          <Button onPress={openModal} size="sm">+ Adicionar</Button>
        </View>

        {/* Month selector */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}><Text style={styles.monthArrow}>‹</Text></TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[month - 1]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}><Text style={styles.monthArrow}>›</Text></TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.grid3}>
          <View style={[styles.sumCard, { borderColor: colors.emeraldBorder }]}>
            <Text style={styles.sumLabel}>Entradas</Text>
            <Text style={[styles.sumValue, { color: colors.emerald }]}>{formatCurrency(income)}</Text>
          </View>
          <View style={[styles.sumCard, { borderColor: colors.redBorder }]}>
            <Text style={styles.sumLabel}>Saídas</Text>
            <Text style={[styles.sumValue, { color: colors.red }]}>{formatCurrency(expense)}</Text>
          </View>
          <View style={[styles.sumCard, { borderColor: savings >= 0 ? colors.blueBorder : colors.redBorder }]}>
            <Text style={styles.sumLabel}>Saldo</Text>
            <Text style={[styles.sumValue, { color: savings >= 0 ? colors.blue : colors.red }]}>{formatCurrency(savings)}</Text>
          </View>
        </View>

        {/* List */}
        {transactions.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={styles.emptyEmoji}>💸</Text>
            <Text style={styles.emptyText}>Nenhuma transação neste mês</Text>
          </Card>
        ) : (
          <Card style={{ gap: 2 }}>
            {transactions.map(tx => {
              const cat = CATEGORIES.find(c => c.id === tx.category);
              return (
                <TouchableOpacity key={tx.id} style={styles.txRow}
                  onLongPress={() => Alert.alert('Remover', `Remover "${tx.description || cat?.name}"?`, [
                    { text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: () => deleteTransaction(tx.id) }
                  ])}>
                  <View style={[styles.txIcon, { backgroundColor: (cat?.color || '#888') + '25' }]}>
                    <Text style={{ fontSize: 18 }}>{cat?.icon || '➕'}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txDesc}>{tx.description || cat?.name}</Text>
                    <Text style={styles.txDate}>{new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: tx.type === 'entrada' ? colors.emerald : colors.red }]}>
                    {tx.type === 'entrada' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {/* Add Modal */}
      <AppModal visible={showModal} onClose={() => setShowModal(false)} title="Nova Transação">
        <View style={styles.modalContent}>
          {/* Type toggle */}
          <View style={styles.typeRow}>
            {(['saida', 'entrada'] as const).map(t => (
              <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                onPress={() => setType(t)}>
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                  {t === 'entrada' ? '⬆️ Entrada' : '⬇️ Saída'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Valor" prefix="R$" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0,00" />
          <Input label="Descrição (opcional)" value={description} onChangeText={setDescription} placeholder="Ex: Almoço" />

          <Text style={styles.fieldLabel}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c.id} style={[styles.catChip, category === c.id && styles.catChipActive]}
                  onPress={() => setCategory(c.id)}>
                  <Text style={{ fontSize: 14 }}>{c.icon}</Text>
                  <Text style={[styles.catChipText, category === c.id && { color: colors.blue }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.fieldLabel}>Forma de pagamento</Text>
          <View style={styles.payRow}>
            {PAYMENT_METHODS.map(p => (
              <TouchableOpacity key={p.id} style={[styles.payChip, payMethod === p.id && styles.payChipActive]}
                onPress={() => setPayMethod(p.id as Transaction['payment_method'])}>
                <Text style={{ fontSize: 14 }}>{p.icon}</Text>
                <Text style={[styles.payText, payMethod === p.id && { color: colors.blue }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Data" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />

          <Button onPress={handleAdd} loading={submitting} size="lg">Adicionar Transação</Button>
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
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  monthBtn: { padding: 8 },
  monthArrow: { fontSize: 24, color: colors.blue },
  monthLabel: { fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 120, textAlign: 'center' },
  grid3: { flexDirection: 'row', gap: 10 },
  sumCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1 },
  sumLabel: { fontSize: 10, color: colors.textFaint, fontWeight: '600', marginBottom: 4 },
  sumValue: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { color: colors.textFaint, fontSize: 14 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, color: colors.text, fontWeight: '500' },
  txDate: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  modalContent: { padding: 20, gap: 14 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.cardAlt },
  typeBtnActive: { borderColor: colors.blue, backgroundColor: colors.blueBg },
  typeText: { fontSize: 14, color: colors.textFaint, fontWeight: '600' },
  typeTextActive: { color: colors.blue },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardAlt },
  catChipActive: { borderColor: colors.blue, backgroundColor: colors.blueBg },
  catChipText: { fontSize: 12, color: colors.textFaint },
  payRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  payChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardAlt },
  payChipActive: { borderColor: colors.blue, backgroundColor: colors.blueBg },
  payText: { fontSize: 12, color: colors.textFaint },
});
