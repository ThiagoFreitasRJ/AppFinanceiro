'use client';

import { useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        xp: 0,
        level: 1,
        savings_goal: 0,
      });
    }
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function updateProfile(updates: Partial<User>) {
    if (!user) return;
    const { data } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (data) setProfile(data);
  }

  return { user, profile, loading, signIn, signUp, signOut, updateProfile, refetchProfile: () => user && fetchProfile(user.id) };
}
