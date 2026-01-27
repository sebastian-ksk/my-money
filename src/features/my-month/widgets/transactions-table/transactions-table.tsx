'use client';

import React from 'react';
import firebaseApp from 'firebase/app';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/utils/currency';
import type {
  Transaction,
  TransactionType,
} from '@/Redux/features/my-month/my-month-models';
import type { TransactionFilter } from '../transaction-filters';

interface TransactionWithPending extends Transaction {
  id?: string;
  concept: string;
  date: firebaseApp.firestore.Timestamp;
  type: TransactionType;
  paymentMethod: string;
  expectedAmount?: number;
  value: number;
}

interface TransactionsTableProps {
  transactions: TransactionWithPending[];
  loading: boolean;
  currency: string;
  selectedMonth: number;
  selectedYear: number;
  activeFilter: TransactionFilter;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string, transactionType?: string) => void;
}

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const getTransactionTypeLabel = (type: TransactionType): string => {
  const types: Record<string, string> = {
    fixed_expense: 'Fijo',
    regular_expense: 'Gasto',
    expected_income: 'Ingreso',
    unexpected_income: 'Extra',
    savings: 'Ahorro',
  };
  return types[type] || 'Gasto';
};

const getTransactionTypeStyles = (
  type: TransactionType,
  isPending: boolean
): { bg: string; text: string; dot: string } => {
  if (isPending) return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' };
  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    fixed_expense: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
    regular_expense: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
    expected_income: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
    unexpected_income: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
    savings: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  };
  return styles[type] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' };
};

const formatDate = (timestamp: firebaseApp.firestore.Timestamp): string => {
  const date = timestamp.toDate();
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });
};

const formatDateFull = (timestamp: firebaseApp.firestore.Timestamp): string => {
  const date = timestamp.toDate();
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const filterTransactions = (
  transactions: TransactionWithPending[],
  filter: TransactionFilter
): TransactionWithPending[] => {
  if (filter === 'all') return transactions;
  if (filter === 'expenses') {
    return transactions.filter(
      (t) =>
        t.type === 'fixed_expense' ||
        t.type === 'regular_expense' ||
        t.type === 'savings'
    );
  }
  if (filter === 'incomes') {
    return transactions.filter(
      (t) => t.type === 'expected_income' || t.type === 'unexpected_income'
    );
  }
  if (
    filter === 'fixed_expense' ||
    filter === 'regular_expense' ||
    filter === 'expected_income' ||
    filter === 'unexpected_income' ||
    filter === 'savings'
  ) {
    return transactions.filter((t) => t.type === filter);
  }
  return transactions;
};

const isIncomeType = (type: TransactionType): boolean => {
  return type === 'expected_income' || type === 'unexpected_income';
};

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  loading,
  currency,
  selectedMonth,
  selectedYear,
  activeFilter,
  onEdit,
  onDelete,
}) => {
  const filteredTransactions = filterTransactions(transactions, activeFilter);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-8 h-8 border-3 border-primary-light border-t-primary-dark rounded-full animate-spin'></div>
          <p className='text-sm text-slate-500'>Cargando...</p>
        </div>
      </div>
    );
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 px-4'>
        <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4'>
          <svg
            className='w-8 h-8 text-slate-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <p className='text-slate-600 font-medium text-center'>
          Sin transacciones
        </p>
        <p className='text-slate-400 text-sm text-center mt-1'>
          {months[selectedMonth]} {selectedYear}
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {/* Vista unificada - Cards compactas */}
      {filteredTransactions.map((transaction) => {
        const isPending = Boolean(transaction.id?.startsWith('pending-'));
        const styles = getTransactionTypeStyles(transaction.type, isPending);
        const isIncome = isIncomeType(transaction.type);

        return (
          <div
            key={transaction.id}
            className={`group flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isPending
                ? 'bg-amber-50/50 border-amber-200'
                : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
            }`}
          >
            {/* Indicador de tipo */}
            <div className={`w-1 h-12 rounded-full ${styles.dot}`}></div>

            {/* Contenido principal */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  <p className='font-medium text-slate-800 truncate text-sm sm:text-base'>
                    {transaction.concept}
                  </p>
                  <div className='flex items-center gap-2 mt-0.5'>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${styles.bg} ${styles.text}`}>
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                    <span className='text-xs text-slate-400'>
                      {formatDate(transaction.date)}
                    </span>
                    {isPending && (
                      <span className='text-xs text-amber-600 font-medium'>
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>

                {/* Monto */}
                <div className='text-right shrink-0'>
                  <p
                    className={`font-bold text-sm sm:text-base ${
                      isIncome ? 'text-green-600' : 'text-slate-800'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(transaction.value, currency)}
                  </p>
                  {transaction.expectedAmount !== null &&
                    transaction.expectedAmount !== undefined &&
                    transaction.expectedAmount !== transaction.value && (
                      <p className='text-xs text-slate-400 line-through'>
                        {formatCurrency(transaction.expectedAmount, currency)}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Acciones */}
            {!isPending && transaction.id && (
              <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                <button
                  onClick={() => onEdit(transaction as Transaction)}
                  className='p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors'
                  title='Editar'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(transaction.id!, transaction.type)}
                  className='p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors'
                  title='Eliminar'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Acciones móviles - siempre visibles */}
            {!isPending && transaction.id && (
              <div className='flex items-center gap-1 sm:hidden'>
                <button
                  onClick={() => onEdit(transaction as Transaction)}
                  className='p-2 rounded-lg bg-slate-100 text-slate-600'
                  title='Editar'
                  aria-label='Editar transacción'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Resumen al final */}
      <div className='mt-4 pt-4 border-t border-slate-200'>
        <p className='text-xs text-slate-400 text-center'>
          {filteredTransactions.length} transacción{filteredTransactions.length !== 1 ? 'es' : ''}
        </p>
      </div>
    </div>
  );
};
