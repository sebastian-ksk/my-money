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
  onDelete: (transactionId: string) => void;
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
    fixed_expense: 'Gasto Fijo',
    regular_expense: 'Gasto',
    expected_income: 'Ingreso Esperado',
    unexpected_income: 'Ingreso Inesperado',
    savings: 'Ahorro',
  };
  return types[type] || 'Gasto';
};

const getTransactionTypeColor = (
  type: TransactionType,
  isPending: boolean
): string => {
  if (isPending) return 'bg-amber-100 text-amber-800 border-amber-300';
  const colors: Record<string, string> = {
    fixed_expense: 'bg-red-100 text-red-800 border-red-300',
    regular_expense: 'bg-orange-100 text-orange-800 border-orange-300',
    expected_income: 'bg-blue-100 text-blue-800 border-blue-300',
    unexpected_income: 'bg-green-100 text-green-800 border-green-300',
    savings: 'bg-purple-100 text-purple-800 border-purple-300',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
};

const formatDate = (timestamp: firebaseApp.firestore.Timestamp): string => {
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
  // Filtros específicos por tipo de transacción
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
      <div className='text-center py-12'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark mb-4'></div>
        <p className='text-zinc-600'>Cargando transacciones...</p>
      </div>
    );
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className='text-center py-12 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200'>
        <svg
          className='w-16 h-16 text-zinc-400 mx-auto mb-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
        <p className='text-zinc-600 text-lg font-medium'>
          No hay transacciones registradas
        </p>
        <p className='text-zinc-500 text-sm mt-1'>
          en {months[selectedMonth]} {selectedYear}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className='hidden lg:block overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b-2 border-zinc-300 bg-zinc-50'>
              <th className='text-left py-4 px-4 font-semibold text-primary-medium text-sm'>
                Fecha
              </th>
              <th className='text-left py-4 px-4 font-semibold text-primary-medium text-sm'>
                Concepto
              </th>
              <th className='text-left py-4 px-4 font-semibold text-primary-medium text-sm'>
                Tipo
              </th>
              <th className='text-left py-4 px-4 font-semibold text-primary-medium text-sm'>
                Medio de Pago
              </th>
              <th className='text-right py-4 px-4 font-semibold text-primary-medium text-sm'>
                Esperado
              </th>
              <th className='text-right py-4 px-4 font-semibold text-primary-medium text-sm'>
                Real
              </th>
              <th className='text-center py-4 px-4 font-semibold text-primary-medium text-sm w-24'>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => {
              const isPending = Boolean(transaction.id?.startsWith('pending-'));
              return (
                <tr
                  key={transaction.id}
                  className={`border-b border-zinc-200 hover:bg-zinc-50 transition-colors ${
                    isPending ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <td className='py-4 px-4 text-zinc-700 text-sm'>
                    {formatDate(transaction.date)}
                  </td>
                  <td className='py-4 px-4'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-zinc-900'>
                        {transaction.concept}
                      </span>
                      {isPending && (
                        <span className='text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-300'>
                          Pendiente
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='py-4 px-4'>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTransactionTypeColor(
                        transaction.type,
                        isPending
                      )}`}
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td className='py-4 px-4 text-zinc-600 text-sm'>
                    {transaction.paymentMethod}
                  </td>
                  <td className='py-4 px-4 text-right text-zinc-500 text-sm'>
                    {transaction.expectedAmount !== null &&
                    transaction.expectedAmount !== undefined
                      ? formatCurrency(transaction.expectedAmount, currency)
                      : '-'}
                  </td>
                  <td
                    className={`py-4 px-4 text-right font-semibold text-sm ${
                      transaction.type === 'expected_income' ||
                      transaction.type === 'unexpected_income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'expected_income' ||
                    transaction.type === 'unexpected_income'
                      ? '+'
                      : '-'}
                    {formatCurrency(transaction.value, currency)}
                  </td>
                  <td className='py-4 px-4 text-center'>
                    {!isPending && transaction.id ? (
                      <div className='flex justify-center items-center gap-2'>
                        <Button
                          onClick={() => {
                            if (
                              transaction.id &&
                              !transaction.id.startsWith('pending-')
                            ) {
                              onEdit(transaction as Transaction);
                            }
                          }}
                          variant='ghost'
                          size='sm'
                          icon={
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                              />
                            </svg>
                          }
                          iconOnly
                        />
                        <Button
                          onClick={() =>
                            transaction.id && onDelete(transaction.id)
                          }
                          variant='ghost'
                          size='sm'
                          icon={
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                              />
                            </svg>
                          }
                          iconOnly
                        />
                      </div>
                    ) : (
                      <span className='text-zinc-400 text-xs'>Pendiente</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className='lg:hidden space-y-3'>
        {filteredTransactions.map((transaction) => {
          const isPending = Boolean(transaction.id?.startsWith('pending-'));
          return (
            <div
              key={transaction.id}
              className={`bg-white border-2 rounded-xl p-4 shadow-sm transition-all ${
                isPending
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-zinc-200 hover:border-primary-light hover:shadow-md'
              }`}
            >
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h4 className='font-semibold text-zinc-900 text-base'>
                      {transaction.concept}
                    </h4>
                    {isPending && (
                      <span className='text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-300'>
                        Pendiente
                      </span>
                    )}
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getTransactionTypeColor(
                        transaction.type,
                        isPending
                      )}`}
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                    <span className='text-xs text-zinc-500'>
                      {formatDate(transaction.date)}
                    </span>
                    {transaction.paymentMethod !== '-' && (
                      <span className='text-xs text-zinc-500'>
                        • {transaction.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-zinc-200'>
                <div>
                  <p className='text-xs text-zinc-500 mb-1'>Valor Esperado</p>
                  <p className='text-sm font-medium text-zinc-700'>
                    {transaction.expectedAmount !== null &&
                    transaction.expectedAmount !== undefined
                      ? formatCurrency(transaction.expectedAmount, currency)
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-zinc-500 mb-1'>Valor Real</p>
                  <p
                    className={`text-sm font-bold ${
                      transaction.type === 'expected_income' ||
                      transaction.type === 'unexpected_income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'expected_income' ||
                    transaction.type === 'unexpected_income'
                      ? '+'
                      : '-'}
                    {formatCurrency(transaction.value, currency)}
                  </p>
                </div>
              </div>

              {!isPending && transaction.id && (
                <div className='flex justify-end gap-2 pt-3 border-t border-zinc-200'>
                  <Button
                    onClick={() => {
                      if (
                        transaction.id &&
                        !transaction.id.startsWith('pending-')
                      ) {
                        onEdit(transaction as Transaction);
                      }
                    }}
                    variant='ghost'
                    size='sm'
                    className='!px-3'
                    icon={
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => transaction.id && onDelete(transaction.id)}
                    variant='ghost'
                    size='sm'
                    className='!px-3 text-red-600 hover:text-red-700 hover:bg-red-50'
                    icon={
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    }
                  >
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
