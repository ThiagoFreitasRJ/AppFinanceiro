import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { Debt, DebtPayment } from '@/types';

export function useDebts(userId?: string) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data: d } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setDebts(d || []);

    const ids = (d || []).map((x: Debt) => x.id);
    if (ids.length > 0) {
      const { data: p } = await supabase
        .from('debt_payments')
        .select('*')
        .in('debt_id', ids)
        .order('payment_date', { ascending: false });
      setPayments(p || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function addDebt(data: Omit<Debt, 'id' | 'user_id' | 'created_at'>) {
    if (!userId) return;
    const { error } = await supabase.from('debts').insert({ ...data, user_id: userId });
    if (!error) fetch();
    return error;
  }

  async function payInstallment(debtId: string) {
    if (!userId) return;
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const newPaid = debt.installments_paid + 1;
    const newRemaining = Math.max(0, debt.remaining_amount - debt.installment_value);
    const isFinished = newPaid >= debt.installments_total;

    const { error } = await supabase
      .from('debts')
      .update({
        installments_paid: newPaid,
        remaining_amount: newRemaining,
        is_active: !isFinished,
      })
      .eq('id', debtId);

    if (!error) {
      await supabase.from('debt_payments').insert({
        debt_id: debtId,
        amount: debt.installment_value,
        payment_date: new Date().toISOString().split('T')[0],
        installment_number: newPaid,
      });

      // XP: +30 por parcela, +100 ao quitar
      const xpGain = isFinished ? 130 : 30;
      await supabase.rpc('increment_xp', { user_id: userId, amount: xpGain }).catch(() => {
        supabase.from('users').select('xp').eq('id', userId).single().then(({ data }) => {
          if (data) supabase.from('users').update({ xp: (data.xp || 0) + xpGain }).eq('id', userId);
        });
      });

      fetch();
    }
    return error;
  }

  async function deleteDebt(id: string) {
    await supabase.from('debts').update({ is_active: false }).eq('id', id);
    fetch();
  }

  // Totals
  const totalDebt = debts.reduce((s, d) => s + d.remaining_amount, 0);
  const monthlyInstallments = debts.reduce((s, d) => s + d.installment_value, 0);
  const totalOriginal = debts.reduce((s, d) => s + d.total_amount, 0);
  const totalPaid = totalOriginal - totalDebt;

  // Months to finish: based on highest installments remaining
  const maxMonthsLeft = debts.reduce((max, d) => {
    const left = d.installments_total - d.installments_paid;
    return Math.max(max, left);
  }, 0);

  return {
    debts, payments, loading,
    totalDebt, monthlyInstallments, totalOriginal, totalPaid, maxMonthsLeft,
    addDebt, payInstallment, deleteDebt, refetch: fetch,
  };
}
