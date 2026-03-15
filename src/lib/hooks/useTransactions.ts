'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { Transaction } from '@/types';

export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  async function addTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...transaction, user_id: userId })
      .select()
      .single();
    if (!error && data) {
      setTransactions(prev => [data, ...prev]);
      // Award XP for transaction
      supabase.from('users').select('xp').eq('id', userId).single().then(({ data }) => {
        if (data) supabase.from('users').update({ xp: data.xp + 5 }).eq('id', userId);
      });
    }
    return { data, error };
  }

  async function deleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions(prev => prev.filter(t => t.id !== id));
    return { error };
  }

  const totalIncome = transactions.reduce((sum, t) => t.type === 'entrada' ? sum + t.amount : sum, 0);
  const totalExpense = transactions.reduce((sum, t) => t.type === 'saida' ? sum + t.amount : sum, 0);
  const balance = totalIncome - totalExpense;

  return { transactions, loading, addTransaction, deleteTransaction, refetch: fetchTransactions, totalIncome, totalExpense, balance };
}

export function useMonthTransactions(userId?: string, month?: number, year?: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = month ?? new Date().getMonth() + 1;
  const currentYear = year ?? new Date().getFullYear();

  useEffect(() => {
    if (!userId) return;
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = new Date(currentYear, currentMonth, 0);
    const endDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${endDate.getDate()}`;

    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDateStr)
      .order('date', { ascending: false })
      .then(({ data }) => {
        setTransactions(data || []);
        setLoading(false);
      });
  }, [userId, currentMonth, currentYear]);

  const income = transactions.reduce((sum, t) => t.type === 'entrada' ? sum + t.amount : sum, 0);
  const expense = transactions.reduce((sum, t) => t.type === 'saida' ? sum + t.amount : sum, 0);
  const savings = income - expense;

  return { transactions, loading, income, expense, savings };
}
