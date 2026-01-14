'use client';

import React from 'react';

export type TransactionFilter = 
  | 'all' 
  | 'expenses' 
  | 'incomes' 
  | 'fixed_expense' 
  | 'regular_expense' 
  | 'expected_income' 
  | 'unexpected_income' 
  | 'savings';

interface TransactionFiltersProps {
  activeFilter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
  totalCount: number;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  activeFilter,
  onFilterChange,
  totalCount,
}) => {
  return (
    <div className='mb-4 sm:mb-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
          <h3 className='text-base sm:text-lg lg:text-xl font-semibold text-primary-dark'>
            Transacciones del Mes
          </h3>
          <div className='flex gap-2 flex-wrap'>
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-primary-dark text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => onFilterChange('expenses')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeFilter === 'expenses'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Gastos
            </button>
            <button
              onClick={() => onFilterChange('incomes')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeFilter === 'incomes'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Ingresos
            </button>
          </div>
        </div>
        <span className='text-xs sm:text-sm text-zinc-600 bg-zinc-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap'>
          {totalCount} {totalCount === 1 ? 'transacción' : 'transacciones'}
        </span>
      </div>
    </div>
  );
};
