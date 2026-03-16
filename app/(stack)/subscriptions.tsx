import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/lib/hooks/useAuthContext';
import { useSubscriptions } from '@/lib/hooks/useSubscriptions';
import { AppModal } from '@/components/ui/AppModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils/format';
import { colors } from '@/theme/colors';
import { SUBSCRIPTION_CATEGORIES, BILLING_CYCLES, SubscriptionCategory, BillingCycle } from '@/types';

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const {
    subscriptions, loading,
    active, totalMonthly, totalAnnual,
    sortedByBilling, nextBillingDate, monthlyValue,
    addSubscription, toggleSubscription, deleteSubscription,
  } = useSubscriptions(profile?.id);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'streaming' as SubscriptionCategory,
    amount: '',
    billing_cycle: 'mensal' as BillingCycle,
    billing_day: '',
    logo_url: '',
  });
  const [saving, setSaving] = useState(false);

  function updateForm(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleAdd() {
    if (!form.name || !form.amount) {
      Alert.alert('Atenção', 'Preencha nome e valor');
      return;
    }
    setSaving(true);
    const error = await addSubscription({
      name: form.name.trim(),
      category: form.category,
      amount: parseFloat(form.amount.replace(',', '.')),
      billing_cycle: form.billing_cycle,
      billing_day: parseInt(form.billing_day) || 1,
      is_active: true,
      logo_url: form.logo_url || null,
    });
    setSaving(false);
    if (error) { Alert.alert('Erro', error.message); return; }
    setShowAdd(false);
    setForm({ name: '', category: 'streaming', amount: '', billing_cycle: 'mensal', billing_day: '', logo_url: '' });
  }

  function handleDelete(id: string, name: string) {
    Alert.alert('Remover', `Remover "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deleteSubscription(id) },
    ]);
  }

  const inactive = subscriptions.filter(s => !s.is_active);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assinaturas</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addBtn}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Por Mês</Text>
            <Text style={[styles.summaryValue, { color: colors.blue }]}>{formatCurrency(totalMonthly)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Por Ano</Text>
            <Text style={[styles.summaryValue, { color: colors.amber }]}>{formatCurrency(totalAnnual)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Ativas</Text>
            <Text style={styles.summaryValue}>{active.length}</Text>
          </View>
        </View>

        {/* Upcoming billing */}
        {sortedByBilling.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Próximas cobranças</Text>
            {sortedByBilling.slice(0, 3).map(sub => {
              const next = nextBillingDate(sub);
              const daysLeft = Math.ceil((next.getTime() - Date.now()) / 86400000);
              return (
                <View key={sub.id} style={styles.upcomingRow}>
                  <Text style={styles.upcomingName}>{sub.name}</Text>
                  <View style={styles.upcomingRight}>
                    <Text style={[styles.upcomingDays, daysLeft <= 3 && { color: colors.red }]}>
                      {daysLeft === 0 ? 'Hoje' : daysLeft === 1 ? 'Amanhã' : `em ${daysLeft}d`}
                    </Text>
                    <Text style={styles.upcomingAmount}>{formatCurrency(sub.amount)}</Text>
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {/* Active subscriptions */}
        {loading ? (
          <Text style={styles.empty}>Carregando...</Text>
        ) : active.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📱</Text>
            <Text style={styles.emptyTitle}>Nenhuma assinatura ativa</Text>
            <Text style={styles.emptySub}>Toque em + para adicionar</Text>
          </View>
        ) : (
          <>
            <Text style={styles.listTitle}>Ativas ({active.length})</Text>
            {active.map(sub => {
              const catInfo = SUBSCRIPTION_CATEGORIES.find(c => c.id === sub.category);
              const cycleInfo = BILLING_CYCLES.find(c => c.id === sub.billing_cycle);
              const monthly = monthlyValue(sub.amount, sub.billing_cycle);

              return (
                <Card key={sub.id} style={styles.subCard}>
                  <View style={styles.subHeader}>
                    <View style={styles.subLogoWrap}>
                      {sub.logo_url ? (
                        <Image source={{ uri: sub.logo_url }} style={styles.subLogo} />
                      ) : (
                        <Text style={styles.subLogoEmoji}>{catInfo?.icon || '📱'}</Text>
                      )}
                    </View>
                    <View style={styles.subInfo}>
                      <Text style={styles.subName}>{sub.name}</Text>
                      <Text style={styles.subCategory}>{catInfo?.label || sub.category}</Text>
                    </View>
                    <View style={styles.subRight}>
                      <Text style={styles.subAmount}>{formatCurrency(sub.amount)}</Text>
                      <Text style={styles.subCycle}>/{cycleInfo?.label?.toLowerCase() || sub.billing_cycle}</Text>
                      {sub.billing_cycle !== 'mensal' && (
                        <Text style={styles.subMonthly}>{formatCurrency(monthly)}/mês</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.subActions}>
                    <TouchableOpacity onPress={() => toggleSubscription(sub.id)} style={styles.pauseBtn}>
                      <Text style={styles.pauseText}>⏸ Pausar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(sub.id, sub.name)} style={styles.cancelBtn}>
                      <Text style={styles.cancelText}>🗑️ Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </>
        )}

        {/* Inactive */}
        {inactive.length > 0 && (
          <>
            <Text style={styles.listTitle}>Pausadas ({inactive.length})</Text>
            {inactive.map(sub => {
              const catInfo = SUBSCRIPTION_CATEGORIES.find(c => c.id === sub.category);
              return (
                <TouchableOpacity key={sub.id} onPress={() => toggleSubscription(sub.id)} style={styles.inactiveCard}>
                  <Text style={styles.inactiveName}>{sub.name}</Text>
                  <Text style={styles.inactiveAction}>▶ Reativar</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Add Modal */}
      <AppModal visible={showAdd} onClose={() => setShowAdd(false)} title="Nova Assinatura">
        <View style={styles.modalBody}>
          <Input label="Nome *" value={form.name} onChangeText={v => updateForm('name', v)} placeholder="Ex: Netflix, Spotify..." autoCapitalize="words" />

          <Text style={styles.fieldLabel}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {SUBSCRIPTION_CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => updateForm('category', c.id)}
                style={[styles.chip, form.category === c.id && styles.chipActive]}
              >
                <Text style={styles.chipEmoji}>{c.icon}</Text>
                <Text style={[styles.chipText, form.category === c.id && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input label="Valor *" prefix="R$" value={form.amount} onChangeText={v => updateForm('amount', v)} keyboardType="decimal-pad" placeholder="29,90" />
            </View>
            <View style={styles.rowItem}>
              <Input label="Dia cobrança" value={form.billing_day} onChangeText={v => updateForm('billing_day', v)} keyboardType="numeric" placeholder="1" />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Ciclo de cobrança</Text>
          <View style={styles.cycleRow}>
            {BILLING_CYCLES.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => updateForm('billing_cycle', c.id)}
                style={[styles.cycleChip, form.billing_cycle === c.id && styles.cycleChipActive]}
              >
                <Text style={[styles.cycleText, form.billing_cycle === c.id && styles.cycleTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button onPress={handleAdd} loading={saving} size="lg">Adicionar Assinatura</Button>
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
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.border, gap: 4 },
  summaryLabel: { fontSize: 10, color: colors.textFaint, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  section: { gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  upcomingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  upcomingName: { fontSize: 13, color: colors.text, fontWeight: '500' },
  upcomingRight: { alignItems: 'flex-end', gap: 2 },
  upcomingDays: { fontSize: 11, color: colors.textFaint },
  upcomingAmount: { fontSize: 13, fontWeight: '700', color: colors.text },
  empty: { textAlign: 'center', color: colors.textFaint, marginTop: 40 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textFaint },
  listTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: -4 },
  subCard: { gap: 12 },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subLogoWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  subLogo: { width: 44, height: 44, borderRadius: 12 },
  subLogoEmoji: { fontSize: 22 },
  subInfo: { flex: 1 },
  subName: { fontSize: 15, fontWeight: '700', color: colors.text },
  subCategory: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
  subRight: { alignItems: 'flex-end', gap: 1 },
  subAmount: { fontSize: 15, fontWeight: '800', color: colors.text },
  subCycle: { fontSize: 11, color: colors.textFaint },
  subMonthly: { fontSize: 11, color: colors.blue },
  subActions: { flexDirection: 'row', gap: 10 },
  pauseBtn: { flex: 1, backgroundColor: colors.amberBg, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.amber + '44' },
  pauseText: { fontSize: 12, color: colors.amber, fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: colors.redBg, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.redBorder },
  cancelText: { fontSize: 12, color: colors.red, fontWeight: '600' },
  inactiveCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, opacity: 0.6 },
  inactiveName: { fontSize: 14, color: colors.textMuted },
  inactiveAction: { fontSize: 12, color: colors.emerald, fontWeight: '600' },
  // Modal
  modalBody: { padding: 20, gap: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: -6 },
  chipScroll: { marginBottom: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  chipActive: { backgroundColor: colors.blueBg, borderColor: colors.blue },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: 12, color: colors.textFaint, fontWeight: '600' },
  chipTextActive: { color: colors.blue },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  cycleRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  cycleChip: { flex: 1, backgroundColor: colors.card, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cycleChipActive: { backgroundColor: colors.blueBg, borderColor: colors.blue },
  cycleText: { fontSize: 11, color: colors.textFaint, fontWeight: '600' },
  cycleTextActive: { color: colors.blue },
});
