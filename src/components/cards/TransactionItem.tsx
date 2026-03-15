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
      className="flex items-center gap-3 py-3 border-b border-[#1F1F1F] last:border-0 group"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${category?.color || '#666'}20` }}
      >
        {category?.icon || '💰'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {transaction.description || category?.name || transaction.category}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#666666]">{formatDate(transaction.date)}</span>
          <span className="text-xs text-[#444444]">•</span>
          <span className="text-xs text-[#666666]">{paymentMethod?.icon} {paymentMethod?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className={`text-sm font-semibold ${isIncome ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </p>
        {onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-[#FF4444] text-[#666666]"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
