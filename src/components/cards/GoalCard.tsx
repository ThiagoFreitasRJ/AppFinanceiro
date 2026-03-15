'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Goal } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, calculateXP } from '@/lib/utils/format';
import { useGoals } from '@/lib/hooks/useGoals';
import { differenceInDays } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onDelete?: (id: string) => void;
  index?: number;
}

export function GoalCard({ goal, onDelete, index = 0 }: GoalCardProps) {
  const { depositToGoal } = useGoals();
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [xpFloat, setXpFloat] = useState<number | null>(null);

  const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
  const isCompleted = !!goal.completed_at;
  const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;
  const previewXP = calculateXP(parseFloat(depositAmount.replace(/\./g, '').replace(',', '.')) || 0);

  function formatAmount(value: string) {
    const nums = value.replace(/\D/g, '');
    const amount = parseFloat(nums) / 100;
    if (isNaN(amount)) return '';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  }

  async function handleDeposit() {
    const amount = parseFloat(depositAmount.replace(/\./g, '').replace(',', '.')) || 0;
    if (amount <= 0) { toast.error('Informe um valor válido'); return; }

    setLoading(true);
    const result = await depositToGoal(goal.id, amount);

    if (result.error) {
      toast.error('Erro ao depositar');
    } else {
      setXpFloat(result.xpEarned);
      setTimeout(() => setXpFloat(null), 2000);
      toast.success(
        result.levelUp
          ? `🎉 LEVEL UP! Nível ${result.newLevel}! +${result.xpEarned} XP`
          : `+${result.xpEarned} XP ganho!`,
        { duration: 3000 }
      );
      setDepositAmount('');
      setShowDeposit(false);
    }
    setLoading(false);
  }

  return (
    <>
      <motion.div
        className="relative bg-[#0f0f1a] border rounded-2xl p-5 overflow-hidden hover:border-opacity-80 transition-all duration-300 group"
        style={{ borderColor: `${goal.color}35` }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        whileHover={{ y: -2 }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-36 h-36 rounded-full -translate-y-16 translate-x-16 opacity-[0.07] blur-2xl"
          style={{ backgroundColor: goal.color }}
        />

        {/* XP Float */}
        <AnimatePresence>
          {xpFloat && (
            <motion.div
              className="absolute top-4 right-4 text-emerald-400 font-bold text-base z-10"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              +{xpFloat} XP
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${goal.color}18` }}
            >
              {goal.icon}
            </div>
            <div>
              <h3 className="font-semibold text-[#e2e8f0] text-sm">{goal.name}</h3>
              {isCompleted ? (
                <span className="text-xs text-emerald-400 font-medium">✅ Concluído!</span>
              ) : daysLeft !== null ? (
                <span className={`text-xs flex items-center gap-1 ${daysLeft <= 7 ? 'text-red-400' : 'text-[#475569]'}`}>
                  <Calendar size={10} />
                  {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido'}
                </span>
              ) : (
                <span className="text-xs text-[#475569]">Sem prazo</span>
              )}
            </div>
          </div>
          {onDelete && !isCompleted && (
            <button
              onClick={() => onDelete(goal.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 text-[#334155] transition-all rounded-lg hover:bg-red-500/10"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-[#e2e8f0] font-mono-numbers">{formatCurrency(goal.current_amount)}</span>
            <span className="text-xs text-[#475569] font-mono-numbers">{progress.toFixed(0)}%</span>
          </div>
          <ProgressBar value={progress} color={goal.color} height={6} />
          <p className="text-right text-xs text-[#475569] mt-1.5 font-mono-numbers">{formatCurrency(goal.target_amount)}</p>
        </div>

        {/* Action */}
        {!isCompleted && (
          <Button
            onClick={() => setShowDeposit(true)}
            fullWidth
            size="sm"
            variant="secondary"
          >
            <Plus size={14} /> Depositar
          </Button>
        )}
      </motion.div>

      {/* Deposit Modal */}
      <Modal isOpen={showDeposit} onClose={() => setShowDeposit(false)} title={`Depositar em "${goal.name}"`} size="sm">
        <div className="space-y-5">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
              style={{ backgroundColor: `${goal.color}18` }}
            >
              {goal.icon}
            </div>
            <ProgressBar value={progress} color={goal.color} height={6} />
            <p className="text-xs text-[#475569] mt-2 font-mono-numbers">
              {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
            </p>
          </div>

          <Input
            label="Valor do Depósito"
            prefix="R$"
            placeholder="0,00"
            value={depositAmount}
            onChange={e => setDepositAmount(formatAmount(e.target.value))}
            inputMode="numeric"
            autoFocus
          />

          {depositAmount && (
            <motion.div
              className="flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-sm text-[#94a3b8]">Você ganhará</span>
              <span className="text-base font-bold text-emerald-400">+{previewXP} XP</span>
            </motion.div>
          )}

          <Button onClick={handleDeposit} fullWidth loading={loading} size="lg">
            💰 Confirmar Depósito
          </Button>
        </div>
      </Modal>
    </>
  );
}
