import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuthContext as useAuth } from '@/lib/hooks/useAuthContext';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useGoals } from '@/lib/hooks/useGoals';
import { useStocks } from '@/lib/hooks/useStocks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppModal } from '@/components/ui/AppModal';
import { formatCurrency, getLevelBadge, getLevelName, getXPForNextLevel } from '@/lib/utils/format';
import { colors } from '@/theme/colors';
import { ACHIEVEMENTS_DATA } from '@/types';

export default function ProfileScreen() {
  const { profile, signOut, updateProfile } = useAuth();
  const { transactions, totalIncome, totalExpense } = useTransactions(profile?.id);
  const { goals } = useGoals(profile?.id);
  const { stocks, totalInvested } = useStocks(profile?.id);

  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [savingsGoal, setSavingsGoal] = useState(String(profile?.savings_goal || ''));
  const [submitting, setSubmitting] = useState(false);

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const badge = getLevelBadge(level);
  const levelName = getLevelName(level);
  const xpForNext = getXPForNextLevel(level);
  const xpCurrent = xp % 100;
  const xpProgress = Math.min(1, xpCurrent / 100);

  const completedGoals = goals.filter(g => g.completed_at).length;
  const balance = totalIncome - totalExpense;

  async function handleSave() {
    setSubmitting(true);
    await updateProfile({ name: name.trim(), savings_goal: parseFloat(savingsGoal.replace(',', '.')) || 0 });
    setShowEdit(false);
    setSubmitting(false);
  }

  const achievements = ACHIEVEMENTS_DATA.map(a => ({
    ...a,
    unlocked: checkAchievement(a.code, { transactions, goals, stocks: stocks.length, completedGoals }),
  }));

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{badge}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.name || 'Usuário'}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          <View style={styles.levelRow}>
            <View style={styles.levelChip}>
              <Text style={styles.levelChipText}>Nv. {level} · {levelName}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => { setName(profile?.name || ''); setSavingsGoal(String(profile?.savings_goal || '')); setShowEdit(true); }}
          style={styles.editBtn}>
          <Text style={styles.editBtnText}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* XP Progress */}
      <Card style={styles.xpCard}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpTitle}>⭐ {xp.toLocaleString('pt-BR')} XP total</Text>
          <Text style={styles.xpNext}>Próximo nível: {xpForNext} XP</Text>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
        </View>
        <Text style={styles.xpSub}>{xpCurrent}/100 XP para próximo nível</Text>
      </Card>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Transações', value: transactions.length, emoji: '💸' },
          { label: 'Objetivos', value: completedGoals, emoji: '🎯' },
          { label: 'Ativos', value: stocks.length, emoji: '📈' },
          { label: 'Saldo total', value: formatCurrency(balance), emoji: '💰', small: true },
        ].map(stat => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statEmoji}>{stat.emoji}</Text>
            <Text style={[styles.statValue, stat.small && { fontSize: 14 }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Achievements */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Conquistas</Text>
          <Text style={styles.achieveCount}>{unlockedCount}/{achievements.length}</Text>
        </View>
        {achievements.map(a => (
          <View key={a.code} style={[styles.achieveRow, !a.unlocked && styles.achieveLocked]}>
            <Text style={styles.achieveIcon}>{a.unlocked ? a.icon : '🔒'}</Text>
            <View style={styles.achieveInfo}>
              <Text style={[styles.achieveName, !a.unlocked && { color: colors.textFainter }]}>{a.name}</Text>
              <Text style={styles.achieveDesc}>{a.description}</Text>
            </View>
            {a.unlocked && <Text style={styles.achieveCheck}>✅</Text>}
          </View>
        ))}
      </Card>

      {/* Sign Out */}
      <Button onPress={() => Alert.alert('Sair', 'Deseja sair da sua conta?', [
        { text: 'Cancelar' }, { text: 'Sair', style: 'destructive', onPress: signOut }
      ])} variant="danger" size="lg">
        Sair da conta
      </Button>

      {/* Edit Modal */}
      <AppModal visible={showEdit} onClose={() => setShowEdit(false)} title="Editar Perfil">
        <View style={styles.modalContent}>
          <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" autoCapitalize="words" />
          <Input label="Meta de economia mensal" prefix="R$" value={savingsGoal} onChangeText={setSavingsGoal}
            keyboardType="decimal-pad" placeholder="1.000,00" />
          <Button onPress={handleSave} loading={submitting} size="lg">Salvar</Button>
        </View>
      </AppModal>
    </ScrollView>
  );
}

function checkAchievement(code: string, data: {
  transactions: any[], goals: any[], stocks: number, completedGoals: number
}): boolean {
  switch (code) {
    case 'first_transaction': return data.transactions.length >= 1;
    case 'first_deposit': return data.goals.some((g: any) => g.current_amount > 0);
    case 'first_stock': return data.stocks >= 1;
    case 'goal_completed': return data.completedGoals >= 1;
    case 'goals_5': return data.completedGoals >= 5;
    case 'stocks_10': return data.stocks >= 10;
    default: return false;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.blueBg, borderWidth: 2, borderColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 26 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 17, fontWeight: '700', color: colors.text },
  profileEmail: { fontSize: 12, color: colors.textFaint },
  levelRow: { flexDirection: 'row', marginTop: 4 },
  levelChip: { backgroundColor: colors.blueBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.blueBorder },
  levelChipText: { fontSize: 11, color: colors.blue, fontWeight: '700' },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 20 },
  xpCard: { gap: 8 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  xpTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  xpNext: { fontSize: 12, color: colors.textFaint },
  xpTrack: { height: 8, backgroundColor: colors.border, borderRadius: 4 },
  xpFill: { height: 8, backgroundColor: colors.blue, borderRadius: 4 },
  xpSub: { fontSize: 11, color: colors.textFaint },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flex: 1, minWidth: '44%', backgroundColor: colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textFaint },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  achieveCount: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  achieveRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  achieveLocked: { opacity: 0.45 },
  achieveIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  achieveInfo: { flex: 1 },
  achieveName: { fontSize: 13, fontWeight: '600', color: colors.text },
  achieveDesc: { fontSize: 11, color: colors.textFaint, marginTop: 1 },
  achieveCheck: { fontSize: 14 },
  modalContent: { padding: 20, gap: 14 },
});
