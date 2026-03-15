'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Edit2, Trophy, Flame, BarChart2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { XPBar } from '@/components/ui/ProgressBar';
import { getLevelName, getLevelBadge, getXPForNextLevel, formatCurrency } from '@/lib/utils/format';
import { ACHIEVEMENTS_DATA } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { Achievement, Streak } from '@/types';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useGoals } from '@/lib/hooks/useGoals';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const { transactions } = useTransactions(user?.id);
  const { goals } = useGoals(user?.id);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', savings_goal: '' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    supabase.from('achievements').select('*').eq('user_id', user.id).then(({ data }) => setAchievements(data || []));
    supabase.from('streaks').select('*').eq('user_id', user.id).eq('type', 'savings').single().then(({ data }) => setStreak(data));
  }, [user]);

  useEffect(() => {
    if (profile) setEditForm({ name: profile.name || '', savings_goal: String(profile.savings_goal || '') });
  }, [profile]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile({
      name: editForm.name,
      savings_goal: parseFloat(editForm.savings_goal) || 0,
    });
    toast.success('Perfil atualizado!');
    setShowEdit(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push('/auth/login');
  }

  if (!profile) return null;

  const maxXP = getXPForNextLevel(profile.level);
  const levelName = getLevelName(profile.level);
  const badge = getLevelBadge(profile.level);
  const xpInCurrentLevel = profile.xp % maxXP;
  const unlockedCount = achievements.length;
  const completedGoals = goals.filter(g => !!g.completed_at).length;

  const statCards = [
    { label: 'Nível', value: profile.level, color: 'text-blue-400', icon: <Star size={16} className="text-blue-400" />, bg: 'bg-blue-500/10' },
    { label: 'Streak', value: `${streak?.current_count || 0} 🔥`, color: 'text-amber-400', icon: <Flame size={16} className="text-amber-400" />, bg: 'bg-amber-500/10' },
    { label: 'Objetivos', value: completedGoals, color: 'text-emerald-400', icon: <Trophy size={16} className="text-emerald-400" />, bg: 'bg-emerald-500/10' },
    { label: 'Badges', value: unlockedCount, color: 'text-purple-400', icon: <span className="text-base">🏅</span>, bg: 'bg-purple-500/10' },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-7">
        {/* Profile Hero */}
        <motion.div
          className="relative bg-[#0f0f1a] border border-[#1e1e32] rounded-2xl p-6 overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* BG glow */}
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-blue-500/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/6 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/20 border-2 border-blue-500/30 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-300">
                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 text-sm">{badge}</div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{profile.name || 'Usuário'}</h1>
                  <p className="text-[#475569] text-sm">{profile.email}</p>
                  <p className="text-[#94a3b8] text-xs mt-0.5 font-medium">{levelName} · Nível {profile.level}</p>
                </div>
              </div>
              <Button onClick={() => setShowEdit(true)} variant="secondary" size="sm">
                <Edit2 size={13} /> Editar
              </Button>
            </div>

            {/* XP Bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-[#475569]">Progresso para Nível {profile.level + 1}</span>
                <span className="text-xs text-blue-400 font-semibold font-mono-numbers">{profile.xp} XP total</span>
              </div>
              <XPBar xp={xpInCurrentLevel} maxXp={maxXP} level={profile.level} />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  className={`${s.bg} border border-white/5 rounded-xl p-3 text-center`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-[#475569] mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card delay={0.1}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BarChart2 size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-[#475569] font-medium uppercase tracking-widest">Transações</p>
                <p className="text-xl font-bold text-white">{transactions.length}</p>
              </div>
            </div>
          </Card>
          <Card delay={0.15}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Flame size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-[#475569] font-medium uppercase tracking-widest">Melhor Streak</p>
                <p className="text-xl font-bold text-white">{streak?.best_count || 0} <span className="text-sm font-normal text-[#475569]">dias</span></p>
              </div>
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <Card delay={0.2}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <h3 className="font-semibold text-white">Conquistas</h3>
            </div>
            <span className="text-xs bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 font-medium">
              {unlockedCount}/{ACHIEVEMENTS_DATA.length}
            </span>
          </div>

          {['Primeiros Passos', 'Consistência', 'Poupança', 'Objetivos', 'Finanças', 'Especiais'].map(category => {
            const categoryAchievements = ACHIEVEMENTS_DATA.filter(a => a.category === category);
            return (
              <div key={category} className="mb-6 last:mb-0">
                <p className="text-xs text-[#475569] font-semibold uppercase tracking-widest mb-3">{category}</p>
                <div className="grid grid-cols-4 gap-2">
                  {categoryAchievements.map(achievement => {
                    const unlocked = achievements.some(a => a.achievement_code === achievement.code);
                    return (
                      <motion.div
                        key={achievement.code}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                          unlocked
                            ? 'bg-amber-500/8 border-amber-500/25'
                            : 'bg-[#0a0a14] border-[#1e1e32] opacity-35'
                        }`}
                        whileHover={{ scale: unlocked ? 1.05 : 1 }}
                        title={achievement.description}
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <span className="text-[9px] text-[#94a3b8] leading-tight">{achievement.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Card>

        {/* Settings */}
        <Card delay={0.25}>
          <h3 className="font-semibold text-white mb-5">Configurações</h3>
          <div className="space-y-1">
            <div className="flex items-center justify-between py-3.5 border-b border-[#1e1e32]">
              <div>
                <p className="text-sm font-medium text-[#e2e8f0]">Meta de Economia</p>
                <p className="text-xs text-[#475569] mt-0.5 font-mono-numbers">
                  {profile.savings_goal > 0 ? formatCurrency(profile.savings_goal) : 'Não definida'}
                </p>
              </div>
              <Button onClick={() => setShowEdit(true)} variant="ghost" size="sm">
                Editar
              </Button>
            </div>
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-[#e2e8f0]">Conta</p>
                <p className="text-xs text-[#475569] mt-0.5">{profile.email}</p>
              </div>
              <Button onClick={handleSignOut} variant="danger" size="sm">
                <LogOut size={13} /> Sair
              </Button>
            </div>
          </div>
        </Card>

        {/* Edit Modal */}
        <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Editar Perfil" size="sm">
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Nome"
              value={editForm.name}
              onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Seu nome"
            />
            <Input
              label="Meta de Economia Mensal"
              prefix="R$"
              value={editForm.savings_goal}
              onChange={e => setEditForm(p => ({ ...p, savings_goal: e.target.value }))}
              placeholder="0,00"
              inputMode="numeric"
            />
            <Button type="submit" fullWidth size="lg">Salvar Alterações</Button>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
