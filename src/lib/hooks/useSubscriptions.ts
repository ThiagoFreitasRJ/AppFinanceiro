import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { Subscription, SUBSCRIPTION_LOGOS, BillingCycle } from '@/types';

function resolveLogo(name: string): string | null {
  const lower = name.toLowerCase().trim();
  for (const [key, url] of Object.entries(SUBSCRIPTION_LOGOS)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

function monthlyValue(amount: number, cycle: BillingCycle): number {
  const map = { mensal: 1, trimestral: 3, semestral: 6, anual: 12 };
  return amount / map[cycle];
}

export function useSubscriptions(userId?: string) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('amount', { ascending: false });
    setSubscriptions(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addSubscription(data: Omit<Subscription, 'id' | 'user_id' | 'created_at'>) {
    if (!userId) return;
    const logo_url = data.logo_url || resolveLogo(data.name);
    const { error } = await supabase.from('subscriptions').insert({
      ...data,
      logo_url,
      user_id: userId,
    });
    if (!error) fetch();
    return error;
  }

  async function toggleSubscription(id: string) {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;
    await supabase.from('subscriptions').update({ is_active: !sub.is_active }).eq('id', id);
    fetch();
  }

  async function deleteSubscription(id: string) {
    await supabase.from('subscriptions').delete().eq('id', id);
    fetch();
  }

  const active = subscriptions.filter(s => s.is_active);
  const totalMonthly = active.reduce((s, sub) => s + monthlyValue(sub.amount, sub.billing_cycle), 0);
  const totalAnnual = totalMonthly * 12;

  // Next billing day for each active sub
  function nextBillingDate(sub: Subscription): Date {
    const today = new Date();
    const next = new Date(today.getFullYear(), today.getMonth(), sub.billing_day);
    if (next <= today) next.setMonth(next.getMonth() + 1);
    return next;
  }

  const sortedByBilling = [...active].sort((a, b) =>
    nextBillingDate(a).getTime() - nextBillingDate(b).getTime()
  );

  return {
    subscriptions, loading,
    active, totalMonthly, totalAnnual,
    sortedByBilling, nextBillingDate,
    addSubscription, toggleSubscription, deleteSubscription, refetch: fetch,
    monthlyValue,
  };
}
