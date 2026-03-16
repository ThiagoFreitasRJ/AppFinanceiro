import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { Streak } from '@/types';

export function useStreaks(userId?: string) {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'savings')
      .single();
    setStreak(data || null);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function recordActivity() {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];

    if (!streak) {
      // Create new streak
      const { data } = await supabase.from('streaks').insert({
        user_id: userId,
        type: 'savings',
        current_count: 1,
        best_count: 1,
        last_date: today,
      }).select().single();
      setStreak(data);
      return;
    }

    if (streak.last_date === today) return; // Already recorded today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const isConsecutive = streak.last_date === yesterdayStr;
    const newCurrent = isConsecutive ? streak.current_count + 1 : 1;
    const newBest = Math.max(streak.best_count, newCurrent);

    const { data } = await supabase
      .from('streaks')
      .update({ current_count: newCurrent, best_count: newBest, last_date: today })
      .eq('id', streak.id)
      .select()
      .single();

    // Milestone XP bonuses
    if (newCurrent === 7 || newCurrent === 30 || newCurrent === 100) {
      const bonusXp = newCurrent === 7 ? 50 : newCurrent === 30 ? 200 : 500;
      await supabase.from('users').select('xp').eq('id', userId).single().then(({ data: u }) => {
        if (u) supabase.from('users').update({ xp: (u.xp || 0) + bonusXp }).eq('id', userId);
      });
    }

    setStreak(data);
  }

  const multiplier = () => {
    if (!streak) return 1;
    if (streak.current_count >= 30) return 2;
    if (streak.current_count >= 7) return 1.5;
    return 1;
  };

  return { streak, loading, recordActivity, multiplier, refetch: fetch };
}
