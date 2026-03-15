import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthContext as useAuth } from '@/lib/hooks/useAuthContext';
import { useGoals } from '@/lib/hooks/useGoals';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppModal } from '@/components/ui/AppModal';
import { formatCurrency } from '@/lib/utils/format';
import { colors } from '@/theme/colors';

const GOAL_ICONS = ['🏠','🚗','🌍','📱','💍','🎓','🏖️','💰','🏋️','🎸','🎮','✈️'];
const GOAL_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function GoalsScreen() {
  const { profile } = useAuth();
  const { goals, createGoal, depositToGoal, deleteGoal } = useGoals(profile?.id);

  const [showCreate, setShowCreate] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('💰');
  const [color, setColor] = useState('#3b82f6');
  const [depositAmount, setDepositAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    const target = parseFloat(targetAmount.replace(',', '.'));
    if (!name || !target) { Alert.alert('Atenção', 'Preencha nome e valor'); return; }
    setSubmitting(true);
    await createGoal({ name, target_amount: target, deadline: deadline || null, icon, color });
    setShowCreate(false); setName(''); setTargetAmount(''); setDeadline('');
    setSubmitting(false);
  }

  async function handleDeposit() {
    if (!selectedGoal) return;
    const val = parseFloat(depositAmount.replace(',', '.'));
    if (!val || val <= 0) { Alert.alert('Atenção', 'Informe um valor'); return; }
    setSubmitting(true);
    const { xpEarned, levelUp, newLevel } = await depositToGoal(selectedGoal, val);
    setShowDeposit(false); setDepositAmount(''); setSelectedGoal(null);
    setSubmitting(false);
    if (levelUp) Alert.alert('🎉 Level Up!', `Você subiu para o nível ${newLevel}! +${xpEarned} XP`);
    else Alert.alert('✅ Depositado!', `+${xpEarned} XP ganhos!`);
  }

  const active = goals.filter(g => !g.completed_at);
  const completed = goals.filter(g => g.completed_at);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Objetivos</Text>
          <Button onPress={() => setShowCreate(true)} size="sm">+ Novo</Button>
        </View>

        {active.length === 0 && completed.length === 0 && (
          <Card style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>Defina seus objetivos</Text>
            <Text style={styles.emptyDesc}>Crie metas financeiras e acompanhe seu progresso com gamificação!</Text>
            <Button onPress={() => setShowCreate(true)} size="sm">Criar primeiro objetivo</Button>
          </Card>
        )}

        {active.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Em andamento</Text>
            {active.map(goal => {
              const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
              const remaining = goal.target_amount - goal.current_amount;
              return (
                <Card key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={[styles.goalIconWrap, { backgroundColor: goal.color + '25' }]}>
                      <Text style={{ fontSize: 22 }}>{goal.icon}</Text>
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalName}>{goal.name}</Text>
                      {goal.deadline && (
                        <Text style={styles.goalDeadline}>⏰ {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}</Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => Alert.alert('Remover', `Remover "${goal.name}"?`, [
                      { text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: () => deleteGoal(goal.id) }
                    ])}>
                      <Text style={styles.deleteBtn}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: goal.color }]} />
                  </View>

                  <View style={styles.goalValues}>
                    <Text style={styles.goalCurrent}>{formatCurrency(goal.current_amount)}</Text>
                    <Text style={styles.goalPct}>{pct.toFixed(0)}%</Text>
                    <Text style={styles.goalTarget}>{formatCurrency(goal.target_amount)}</Text>
                  </View>

                  <View style={styles.goalFooter}>
                    <Text style={styles.goalRemaining}>Falta {formatCurrency(remaining)}</Text>
                    <Button size="sm" onPress={() => { setSelectedGoal(goal.id); setShowDeposit(true); }}>
                      + Depositar
                    </Button>
                  </View>
                </Card>
              );
            })}
          </>
        )}

        {completed.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Concluídos 🎉</Text>
            {completed.map(goal => (
              <Card key={goal.id} style={[styles.goalCard, styles.completedCard]}>
                <View style={styles.goalHeader}>
                  <Text style={{ fontSize: 22 }}>{goal.icon}</Text>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalCompleted}>Concluído em {new Date(goal.completed_at!).toLocaleDateString('pt-BR')}</Text>
                  </View>
                  <Text style={styles.goalTargetBig}>{formatCurrency(goal.target_amount)}</Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {/* Create Modal */}
      <AppModal visible={showCreate} onClose={() => setShowCreate(false)} title="Novo Objetivo">
        <View style={styles.modalContent}>
          <Input label="Nome do objetivo" value={name} onChangeText={setName} placeholder="Ex: Viagem para Europa" />
          <Input label="Valor alvo" prefix="R$" value={targetAmount} onChangeText={setTargetAmount} keyboardType="decimal-pad" placeholder="5.000,00" />
          <Input label="Prazo (opcional)" value={deadline} onChangeText={setDeadline} placeholder="AAAA-MM-DD" />

          <Text style={styles.fieldLabel}>Ícone</Text>
          <View style={styles.iconsGrid}>
            {GOAL_ICONS.map(ic => (
              <TouchableOpacity key={ic} style={[styles.iconBtn, icon === ic && styles.iconBtnActive]} onPress={() => setIcon(ic)}>
                <Text style={{ fontSize: 20 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Cor</Text>
          <View style={styles.colorsRow}>
            {GOAL_COLORS.map(c => (
              <TouchableOpacity key={c} style={[styles.colorBtn, { backgroundColor: c }, color === c && styles.colorBtnActive]}
                onPress={() => setColor(c)} />
            ))}
          </View>

          <Button onPress={handleCreate} loading={submitting} size="lg">Criar Objetivo</Button>
        </View>
      </AppModal>

      {/* Deposit Modal */}
      <AppModal visible={showDeposit} onClose={() => setShowDeposit(false)} title="Fazer Depósito">
        <View style={styles.modalContent}>
          {selectedGoal && (() => {
            const goal = goals.find(g => g.id === selectedGoal);
            if (!goal) return null;
            return (
              <>
                <View style={styles.depositGoalInfo}>
                  <Text style={{ fontSize: 28 }}>{goal.icon}</Text>
                  <View>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalRemaining}>Falta {formatCurrency(goal.target_amount - goal.current_amount)}</Text>
                  </View>
                </View>
                <Input label="Valor do depósito" prefix="R$" value={depositAmount} onChangeText={setDepositAmount}
                  keyboardType="decimal-pad" placeholder="100,00" autoFocus />
                <Button onPress={handleDeposit} loading={submitting} size="lg">💰 Depositar</Button>
              </>
            );
          })()}
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
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyDesc: { fontSize: 13, color: colors.textFaint, textAlign: 'center', lineHeight: 18 },
  goalCard: { gap: 12 },
  completedCard: { opacity: 0.7, borderColor: colors.emeraldBorder },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 15, fontWeight: '700', color: colors.text },
  goalDeadline: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  goalCompleted: { fontSize: 11, color: colors.emerald, marginTop: 2 },
  deleteBtn: { fontSize: 18 },
  progressTrack: { height: 8, backgroundColor: colors.border, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  goalValues: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalCurrent: { fontSize: 13, color: colors.text, fontWeight: '600' },
  goalPct: { fontSize: 12, color: colors.textMuted },
  goalTarget: { fontSize: 13, color: colors.textFaint },
  goalTargetBig: { fontSize: 15, fontWeight: '700', color: colors.emerald },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalRemaining: { fontSize: 12, color: colors.textFaint },
  modalContent: { padding: 20, gap: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  iconsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  iconBtnActive: { borderColor: colors.blue, backgroundColor: colors.blueBg },
  colorsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorBtn: { width: 32, height: 32, borderRadius: 16 },
  colorBtnActive: { borderWidth: 3, borderColor: colors.text },
  depositGoalInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.cardAlt, borderRadius: 14 },
});
