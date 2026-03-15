'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Goal } from '@/types';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, calculateXP } from '@/lib/utils/format';
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
        className={`relative bg-[#111111] border rounded-xl p-5 overflow-hidden transition-all duration-300 hover:border-opacity-60`}
        style={{ borderColor: `${goal.color}40` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Background gradient */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-12 translate-x-12 opacity-10"
          style={{ backgroundColor: goal.color }}
        />

        {/* XP Float animation */}
        <AnimatePresence>
          {xpFloat && (
            <motion.div
              className="absolute top-4 right-4 text-[#00FF88] font-bold text-lg z-10"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -50 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
            >
              +{xpFloat} XP
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${goal.color}20` }}
            >
              {goal.icon}
            </div>
            <div>
              <h3 className="font-semibold text-white">{goal.name}</h3>
              {isCompleted ? (
                <span className="text-xs text-[#00FF88]">✅ Concluído!</span>
              ) : daysLeft !== null ? (
                <span className={`text-xs ${daysLeft <= 7 ? 'text-[#FF4444]' : 'text-[#666666]'}`}>
                  <Calendar size={10} className="inline mr-1" />
                  {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido'}
                </span>
              ) : (
                <span className="text-xs text-[#666666]">Sem prazo</span>
              )}
            </div>
          </div>
          {onDelete && !isCompleted && (
            <button
              onClick={() => onDelete(goal.id)}
              className="text-[#666666] hover:text-[#FF4444] transition-colors p-1"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white font-medium">{formatCurrency(goal.current_amount)}</span>
            <span className="text-sm text-[#666666]">{formatCurrency(goal.target_amount)}</span>
          </div>
          <ProgressBar value={progress} color={goal.color} height={10} />
          <p className="text-right text-xs text-[#666666] mt-1">{progress.toFixed(1)}%</p>
        </div>

        {/* Actions */}
        {!isCompleted && (
          <Button
            onClick={() => setShowDeposit(true)}
            fullWidth
            size="sm"
            variant="secondary"
          >
            <Plus size={16} /> Depositar
          </Button>
        )}
      </motion.div>

      {/* Deposit Modal */}
      <Modal isOpen={showDeposit} onClose={() => setShowDeposit(false)} title={`Depositar em "${goal.name}"`} size="sm">
        <div className="space-y-4">
          <div className="text-center mb-2">
            <span className="text-4xl">{goal.icon}</span>
            <div className="mt-2">
              <ProgressBar value={progress} color={goal.color} />
              <p className="text-xs text-[#666666] mt-1">{formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}</p>
            </div>
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
              className="flex items-center justify-center gap-2 bg-[#0066FF]/10 border border-[#0066FF]/20 rounded-lg p-3"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-sm text-[#0066FF]">Você ganhará</span>
              <span className="text-lg font-bold text-[#00FF88]">+{previewXP} XP</span>
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
