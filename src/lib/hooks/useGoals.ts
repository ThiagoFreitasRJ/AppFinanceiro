'use client';

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
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setGoals(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  async function createGoal(goal: Omit<Goal, 'id' | 'user_id' | 'current_amount' | 'completed_at' | 'created_at'>) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: userId, current_amount: 0 })
      .select()
      .single();
    if (!error && data) setGoals(prev => [data, ...prev]);
    return { data, error };
  }

  async function depositToGoal(goalId: string, amount: number): Promise<{ xpEarned: number; levelUp: boolean; newLevel: number; error: unknown }> {
    if (!userId) return { xpEarned: 0, levelUp: false, newLevel: 1, error: 'No user' };

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { xpEarned: 0, levelUp: false, newLevel: 1, error: 'Goal not found' };

    let xp = calculateXP(amount);

    // Check if completing goal
    const newAmount = goal.current_amount + amount;
    const isCompleting = newAmount >= goal.target_amount;
    if (isCompleting) xp *= 2;

    // Check deadline bonus
    if (goal.deadline) {
      const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7 && daysLeft > 0) xp = Math.floor(xp * 1.5);
    }

    // Update goal amount
    const { error: goalError } = await supabase
      .from('goals')
      .update({
        current_amount: newAmount,
        completed_at: isCompleting ? new Date().toISOString() : null,
      })
      .eq('id', goalId);

    if (goalError) return { xpEarned: 0, levelUp: false, newLevel: 1, error: goalError };

    // Record deposit
    await supabase.from('goal_deposits').insert({
      goal_id: goalId,
      user_id: userId,
      amount,
      xp_earned: xp,
    });

    // Update streak
    await updateStreak(userId);

    // Add XP
    const { data: userData } = await supabase
      .from('users')
      .select('xp, level')
      .eq('id', userId)
      .single();

    const oldLevel = userData?.level || 1;
    const newXP = (userData?.xp || 0) + xp;
    const newLevel = Math.min(99, Math.floor(newXP / 100) + 1);

    await supabase.from('users').update({ xp: newXP, level: newLevel }).eq('id', userId);

    setGoals(prev => prev.map(g =>
      g.id === goalId ? { ...g, current_amount: newAmount, completed_at: isCompleting ? new Date().toISOString() : null } : g
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

async function updateStreak(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'savings')
    .single();

  if (!streak) {
    await supabase.from('streaks').insert({
      user_id: userId,
      type: 'savings',
      current_count: 1,
      best_count: 1,
      last_date: today,
    });
    return;
  }

  const lastDate = streak.last_date ? new Date(streak.last_date) : null;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (streak.last_date === today) return; // Already counted today

  const newCount = streak.last_date === yesterdayStr ? streak.current_count + 1 : 1;
  const newBest = Math.max(streak.best_count, newCount);

  await supabase.from('streaks').update({
    current_count: newCount,
    best_count: newBest,
    last_date: today,
  }).eq('id', streak.id);

  // Milestone XP bonuses
  const milestones: Record<number, number> = { 7: 50, 14: 100, 30: 200, 60: 400, 100: 500 };
  if (milestones[newCount]) {
    await supabase
      .from('users')
      .select('xp')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          supabase.from('users').update({ xp: data.xp + milestones[newCount] }).eq('id', userId);
        }
      });
  }
}

export function useGoalDeposits(goalId?: string) {
  const [deposits, setDeposits] = useState<GoalDeposit[]>([]);

  useEffect(() => {
    if (!goalId) return;
    supabase
      .from('goal_deposits')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setDeposits(data || []));
  }, [goalId]);

  return { deposits };
}
