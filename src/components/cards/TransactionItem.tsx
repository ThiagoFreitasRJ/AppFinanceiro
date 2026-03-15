'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Transaction, CATEGORIES, PAYMENT_METHODS } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/format';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  index?: number;
}

export function TransactionItem({ transaction, onDelete, index = 0 }: TransactionItemProps) {
  const category = CATEGORIES.find(c => c.id === transaction.category);
  const paymentMethod = PAYMENT_METHODS.find(p => p.id === transaction.payment_method);
  const isIncome = transaction.type === 'entrada';

  return (
    <motion.div
      className="flex items-center gap-4 py-3.5 border-b border-[#1e1e32]/60 last:border-0 group"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
        style={{ backgroundColor: `${category?.color || '#3b82f6'}15` }}
      >
        {category?.icon || '💰'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#e2e8f0] truncate">
          {transaction.description || category?.name || transaction.category}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-[#475569]">{formatDate(transaction.date)}</span>
          <span className="text-[#2a2a45]">·</span>
          <span className="text-xs text-[#334155]">{paymentMethod?.icon} {paymentMethod?.name}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2">
        <p className={`text-sm font-bold font-mono-numbers ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        {onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:text-red-400 text-[#334155] rounded-lg hover:bg-red-500/10"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
