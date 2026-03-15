'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Edit2, Trophy, Flame, Target, BarChart2 } from 'lucide-react';
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

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div
          className="bg-gradient-to-br from-[#0066FF]/20 via-[#111111] to-[#0A0A0A] border border-[#0066FF]/30 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#0066FF]/20 border-2 border-[#0066FF]/40 rounded-full flex items-center justify-center text-2xl font-bold text-[#0066FF]">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{profile.name || 'Usuário'}</h1>
                <p className="text-[#666666] text-sm">{profile.email}</p>
                <p className="text-[#A0A0A0] text-sm mt-0.5">
                  {badge} {levelName} · Nível {profile.level}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowEdit(true)} variant="secondary" size="sm">
              <Edit2 size={14} />
            </Button>
          </div>

          {/* XP Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-[#666666]">Progresso para Nível {profile.level + 1}</span>
              <span className="text-xs text-[#0066FF]">{profile.xp} XP total</span>
            </div>
            <XPBar xp={xpInCurrentLevel} maxXp={maxXP} level={profile.level} />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-[#0066FF]">{profile.level}</p>
              <p className="text-xs text-[#666666]">Nível</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#FFAA00]">{streak?.current_count || 0} 🔥</p>
              <p className="text-xs text-[#666666]">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#00FF88]">{completedGoals}</p>
              <p className="text-xs text-[#666666]">Objetivos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#DDA0DD]">{unlockedCount}</p>
              <p className="text-xs text-[#666666]">Badges</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0066FF]/20 flex items-center justify-center">
              <BarChart2 size={18} className="text-[#0066FF]" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Transações</p>
              <p className="text-lg font-bold text-white">{transactions.length}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFAA00]/20 flex items-center justify-center">
              <Flame size={18} className="text-[#FFAA00]" />
            </div>
            <div>
              <p className="text-xs text-[#666666]">Melhor Streak</p>
              <p className="text-lg font-bold text-white">{streak?.best_count || 0} dias</p>
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-[#FFAA00]" />
              <h3 className="font-semibold text-white">Conquistas</h3>
            </div>
            <span className="text-xs text-[#666666]">{unlockedCount}/{ACHIEVEMENTS_DATA.length}</span>
          </div>

          {['Primeiros Passos', 'Consistência', 'Poupança', 'Objetivos', 'Finanças', 'Especiais'].map(category => {
            const categoryAchievements = ACHIEVEMENTS_DATA.filter(a => a.category === category);
            return (
              <div key={category} className="mb-5 last:mb-0">
                <p className="text-xs text-[#666666] font-medium uppercase tracking-wide mb-3">{category}</p>
                <div className="grid grid-cols-4 gap-2">
                  {categoryAchievements.map(achievement => {
                    const unlocked = achievements.some(a => a.achievement_code === achievement.code);
                    return (
                      <motion.div
                        key={achievement.code}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center ${
                          unlocked
                            ? 'bg-[#FFAA00]/10 border-[#FFAA00]/30'
                            : 'bg-[#1F1F1F] border-[#2A2A2A] opacity-40'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        title={achievement.description}
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <span className="text-[9px] text-[#A0A0A0] leading-tight">{achievement.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </Card>

        {/* Settings */}
        <Card>
          <h3 className="font-semibold text-white mb-4">Configurações</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#1F1F1F]">
              <div>
                <p className="text-sm text-white">Meta de Economia</p>
                <p className="text-xs text-[#666666]">
                  {profile.savings_goal > 0 ? formatCurrency(profile.savings_goal) : 'Não definida'}
                </p>
              </div>
              <Button onClick={() => setShowEdit(true)} variant="ghost" size="sm">
                Editar
              </Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white">Conta</p>
                <p className="text-xs text-[#666666]">{profile.email}</p>
              </div>
              <Button onClick={handleSignOut} variant="danger" size="sm">
                <LogOut size={14} /> Sair
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
            <Button type="submit" fullWidth>Salvar</Button>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
