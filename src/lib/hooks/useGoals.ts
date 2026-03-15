import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { Goal, GoalDeposit } from '@/types';
import { calculateXP } from '../utils/format';

export function useGoals(userId?: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setGoals(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  async function createGoal(goal: Omit<Goal, 'id' | 'user_id' | 'current_amount' | 'completed_at' | 'created_at'>) {
    if (!userId) return null;
    const { data, error } = await supabase.from('goals')
      .insert({ ...goal, user_id: userId, current_amount: 0 }).select().single();
    if (!error && data) setGoals(prev => [data, ...prev]);
    return { data, error };
  }

  async function depositToGoal(goalId: string, amount: number) {
    if (!userId) return { xpEarned: 0, levelUp: false, newLevel: 1, error: 'No user' };
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { xpEarned: 0, levelUp: false, newLevel: 1, error: 'Not found' };

    let xp = calculateXP(amount);
    const newAmount = goal.current_amount + amount;
    const isCompleting = newAmount >= goal.target_amount;
    if (isCompleting) xp *= 2;

    if (goal.deadline) {
      const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000);
      if (daysLeft <= 7 && daysLeft > 0) xp = Math.floor(xp * 1.5);
    }

    const { error: goalError } = await supabase.from('goals').update({
      current_amount: newAmount,
      completed_at: isCompleting ? new Date().toISOString() : null,
    }).eq('id', goalId);

    if (goalError) return { xpEarned: 0, levelUp: false, newLevel: 1, error: goalError };

    await supabase.from('goal_deposits').insert({ goal_id: goalId, user_id: userId, amount, xp_earned: xp });

    const { data: userData } = await supabase.from('users').select('xp, level').eq('id', userId).single();
    const oldLevel = userData?.level || 1;
    const newXP = (userData?.xp || 0) + xp;
    const newLevel = Math.min(99, Math.floor(newXP / 100) + 1);
    await supabase.from('users').update({ xp: newXP, level: newLevel }).eq('id', userId);

    setGoals(prev => prev.map(g => g.id === goalId
      ? { ...g, current_amount: newAmount, completed_at: isCompleting ? new Date().toISOString() : null }
      : g
    ));

    return { xpEarned: xp, levelUp: newLevel > oldLevel, newLevel, error: null };
  }

  async function deleteGoal(id: string) {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) setGoals(prev => prev.filter(g => g.id !== id));
    return { error };
  }

  return { goals, loading, createGoal, depositToGoal, deleteGoal, refetch: fetchGoals };
}

export function useGoalDeposits(goalId?: string) {
  const [deposits, setDeposits] = useState<GoalDeposit[]>([]);
  useEffect(() => {
    if (!goalId) return;
    supabase.from('goal_deposits').select('*').eq('goal_id', goalId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setDeposits(data || []));
  }, [goalId]);
  return { deposits };
}
