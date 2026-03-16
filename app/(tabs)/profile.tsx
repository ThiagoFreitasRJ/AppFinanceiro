import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext as useAuth } from '@/lib/hooks/useAuthContext';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useGoals } from '@/lib/hooks/useGoals';
import { useStocks } from '@/lib/hooks/useStocks';
import { useStreaks } from '@/lib/hooks/useStreaks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppModal } from '@/components/ui/AppModal';
import { formatCurrency, getLevelBadge, getLevelName, getXPForNextLevel } from '@/lib/utils/format';
import { colors } from '@/theme/colors';
import { ACHIEVEMENTS_DATA } from '@/types';

const MENU_ITEMS = [
  { label: 'Dívidas', icon: '💳', route: '/(stack)/debts', desc: 'Cartões, empréstimos, financiamentos' },
  { label: 'Assinaturas', icon: '📱', route: '/(stack)/subscriptions', desc: 'Netflix, Spotify e outros' },
  { label: 'Previsão de Gastos', icon: '🔮', route: '/(stack)/predictions', desc: 'Inteligência financeira' },
  { label: 'Comparativo BR', icon: '🇧🇷', route: '/(stack)/compare', desc: 'Vs. média brasileira' },
  { label: 'Relatórios', icon: '📊', route: '/(stack)/reports', desc: 'Exportar PDF e Excel' },
  { label: 'Importar Extrato', icon: '📂', route: '/(stack)/import', desc: 'CSV e OFX' },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut, updateProfile } = useAuth();
  const { transactions, totalIncome, totalExpense } = useTransactions(profile?.id);
  const { goals } = useGoals(profile?.id);
  const { stocks, totalInvested } = useStocks(profile?.id);
  const { streak } = useStreaks(profile?.id);

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
            {streak && streak.current_count > 0 && (
              <View style={styles.streakChip}>
                <Text style={styles.streakText}>🔥 {streak.current_count} dias</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => { setName(profile?.name || ''); setSavingsGoal(String(profile?.savings_goal || '')); setShowEdit(true); }}
          style={styles.editBtn}
        >
          <Text style={styles.editBtnText}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* XP Progress */}
      <Card style={styles.xpCard}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpTitle}>⭐ {xp.toLocaleString('pt-BR')} XP total</Text>
          <Text style={styles.xpNext}>Próximo: {xpForNext} XP</Text>
        </View>
        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${xpProgress * 100}%` }]} />
        </View>
        <Text style={styles.xpSub}>{xpCurrent}/100 XP para próximo nível</Text>
      </Card>

      {/* Streak card */}
      {streak && (
        <Card style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{streak.current_count}</Text>
              <Text style={styles.streakStatLabel}>🔥 Streak atual</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>{streak.best_count}</Text>
              <Text style={styles.streakStatLabel}>⭐ Melhor streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakStatValue}>
                {streak.current_count >= 30 ? '2x' : streak.current_count >= 7 ? '1.5x' : '1x'}
              </Text>
              <Text style={styles.streakStatLabel}>🎯 Multiplicador</Text>
            </View>
          </View>
          {streak.current_count >= 7 && (
            <Text style={styles.streakBonus}>🏆 Bônus de streak ativo!</Text>
          )}
        </Card>
      )}

      {/* Stats */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Transações', value: transactions.length, emoji: '💸' },
          { label: 'Objetivos concluídos', value: completedGoals, emoji: '🎯' },
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

      {/* Menu — Extra features */}
      <Card style={styles.menuSection}>
        <Text style={styles.menuTitle}>🛠️ Ferramentas</Text>
        {MENU_ITEMS.map(item => (
          <TouchableOpacity
            key={item.route}
            onPress={() => router.push(item.route as any)}
            style={styles.menuItem}
          >
            <View style={styles.menuIconWrap}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </Card>

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
  levelRow: { flexDirection: 'row', marginTop: 4, gap: 6, flexWrap: 'wrap' },
  levelChip: { backgroundColor: colors.blueBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.blueBorder },
  levelChipText: { fontSize: 11, color: colors.blue, fontWeight: '700' },
  streakChip: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  streakText: { fontSize: 11, color: colors.amber, fontWeight: '700' },
  editBtn: { padding: 8 },
  editBtnText: { fontSize: 20 },
  xpCard: { gap: 8 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  xpTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  xpNext: { fontSize: 12, color: colors.textFaint },
  xpTrack: { height: 8, backgroundColor: colors.border, borderRadius: 4 },
  xpFill: { height: 8, backgroundColor: colors.blue, borderRadius: 4 },
  xpSub: { fontSize: 11, color: colors.textFaint },
  streakCard: { padding: 14 },
  streakRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  streakStat: { alignItems: 'center', gap: 4 },
  streakStatValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  streakStatLabel: { fontSize: 11, color: colors.textFaint },
  streakDivider: { width: 1, height: 36, backgroundColor: colors.border },
  streakBonus: { textAlign: 'center', fontSize: 12, color: colors.amber, fontWeight: '600', marginTop: 10, backgroundColor: colors.amberBg, borderRadius: 8, padding: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flex: 1, minWidth: '44%', backgroundColor: colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textFaint, textAlign: 'center' },
  menuSection: { gap: 4 },
  menuTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIconWrap: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.blueBg, alignItems: 'center', justifyContent: 'center' },
  menuIcon: { fontSize: 18 },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  menuDesc: { fontSize: 11, color: colors.textFaint, marginTop: 1 },
  menuArrow: { fontSize: 20, color: colors.textFaint },
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
