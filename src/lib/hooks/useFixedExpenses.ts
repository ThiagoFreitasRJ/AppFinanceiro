'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { FixedExpense, FixedExpensePayment } from '@/types';

export function useFixedExpenses(userId?: string) {
  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [payments, setPayments] = useState<FixedExpensePayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const now = new Date();
    const [{ data: expData }, { data: payData }] = await Promise.all([
      supabase.from('fixed_expenses').select('*').eq('user_id', userId).order('due_day'),
      supabase
        .from('fixed_expense_payments')
        .select('*')
        .in('fixed_expense_id',
          (await supabase.from('fixed_expenses').select('id').eq('user_id', userId)).data?.map(e => e.id) || []
        )
        .eq('month', now.getMonth() + 1)
        .eq('year', now.getFullYear()),
    ]);
    setExpenses(expData || []);
    setPayments(payData || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  async function createExpense(expense: Omit<FixedExpense, 'id' | 'user_id' | 'created_at'>) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert({ ...expense, user_id: userId })
      .select()
      .single();
    if (!error && data) setExpenses(prev => [...prev, data].sort((a, b) => a.due_day - b.due_day));
    return { data, error };
  }

  async function markAsPaid(expenseId: string) {
    if (!userId) return;
    const now = new Date();
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    const { data: payment, error: payError } = await supabase
      .from('fixed_expense_payments')
      .insert({ fixed_expense_id: expenseId, month: now.getMonth() + 1, year: now.getFullYear() })
      .select()
      .single();

    if (!payError && payment) {
      setPayments(prev => [...prev, payment]);
      // Create transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'saida',
        amount: expense.amount,
        description: expense.name,
        category: expense.category,
        payment_method: 'transferencia',
        date: now.toISOString().split('T')[0],
      });
      // XP for paying
      const { data: userData } = await supabase.from('users').select('xp').eq('id', userId).single();
      if (userData) await supabase.from('users').update({ xp: userData.xp + 10 }).eq('id', userId);
    }
  }

  async function deleteExpense(id: string) {
    const { error } = await supabase.from('fixed_expenses').delete().eq('id', id);
    if (!error) setExpenses(prev => prev.filter(e => e.id !== id));
    return { error };
  }

  async function toggleExpense(id: string, isActive: boolean) {
    await supabase.from('fixed_expenses').update({ is_active: isActive }).eq('id', id);
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, is_active: isActive } : e));
  }

  function isPaid(expenseId: string): boolean {
    return payments.some(p => p.fixed_expense_id === expenseId);
  }

  function getStatus(expense: FixedExpense): 'paid' | 'overdue' | 'upcoming' | 'normal' {
    if (isPaid(expense.id)) return 'paid';
    const today = new Date().getDate();
    const daysLeft = expense.due_day - today;
    if (daysLeft < 0) return 'overdue';
    if (daysLeft <= 5) return 'upcoming';
    return 'normal';
  }

  const totalMonthly = expenses.filter(e => e.is_active).reduce((sum, e) => sum + e.amount, 0);

  return { expenses, payments, loading, createExpense, markAsPaid, deleteExpense, toggleExpense, isPaid, getStatus, totalMonthly, refetch: fetchExpenses };
}
