'use client';

import React from 'react';
import { formatCurrency } from '@/utils/currency';

type FilterType = 'all' | 'incomes' | 'expenses' | 'savings';

interface BalanceCardsProps {
  displayLiquidity: number;
  totalExpenses: number;
  totalIncomes: number;
  totalSavings: number;
  finalBalance: number;
  currency: string;
  activeFilter?: FilterType;
  onEditLiquidity: () => void;
  onFilterChange?: (filter: FilterType) => void;
}

export const BalanceCards: React.FC<BalanceCardsProps> = ({
  displayLiquidity,
  totalExpenses,
  totalIncomes,
  totalSavings,
  finalBalance,
  currency,
  activeFilter = 'all',
  onEditLiquidity,
  onFilterChange,
}) => {
  const handleCardClick = (filter: FilterType) => {
    if (onFilterChange) {
      onFilterChange(activeFilter === filter ? 'all' : filter);
    }
  };

  return (
    <div className='mb-3'>
      {/* Balance disponible - Compacto */}
      <button
        onClick={() => handleCardClick('all')}
        className={`w-full rounded-lg p-2.5 mb-2 text-left transition-all flex items-center justify-between ${
          finalBalance >= 0
            ? 'bg-emerald-500 hover:bg-emerald-600'
            : 'bg-red-500 hover:bg-red-600'
        } ${activeFilter === 'all' ? 'shadow-md' : 'shadow-sm'}`}
      >
        <div>
          <p className='text-[10px] uppercase tracking-wide text-white/70'>Disponible</p>
          <p className='text-base sm:text-lg font-bold text-white'>
            {formatCurrency(finalBalance, currency)}
          </p>
        </div>
        <svg className='w-5 h-5 text-white/60' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
      </button>

      {/* Grid de tarjetas secundarias - 2x2 en móvil, 4 columnas en desktop */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
        {/* Saldo Inicial */}
        <div className='bg-slate-50 rounded-xl p-2.5 border border-slate-200'>
          <div className='flex items-center justify-between mb-1'>
            <span className='text-[10px] uppercase tracking-wide text-slate-400 font-medium'>Inicial</span>
            <button
              onClick={onEditLiquidity}
              className='p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors'
              title='Editar'
            >
              <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
              </svg>
            </button>
          </div>
          <p className='text-sm font-semibold text-slate-700 truncate'>
            {formatCurrency(displayLiquidity ?? 0, currency)}
          </p>
        </div>

        {/* Ingresos */}
        <button
          onClick={() => handleCardClick('incomes')}
          className={`rounded-xl p-2.5 text-left transition-all border-2 ${
            activeFilter === 'incomes' 
              ? 'bg-green-100 border-green-500 shadow-sm' 
              : 'bg-green-50 border-transparent hover:border-green-300'
          }`}
        >
          <span className='text-[10px] uppercase tracking-wide text-green-600 font-medium'>Ingresos</span>
          <p className='text-sm font-semibold text-green-700 truncate mt-1'>
            +{formatCurrency(totalIncomes, currency)}
          </p>
        </button>

        {/* Gastos */}
        <button
          onClick={() => handleCardClick('expenses')}
          className={`rounded-xl p-2.5 text-left transition-all border-2 ${
            activeFilter === 'expenses' 
              ? 'bg-red-100 border-red-500 shadow-sm' 
              : 'bg-red-50 border-transparent hover:border-red-300'
          }`}
        >
          <span className='text-[10px] uppercase tracking-wide text-red-600 font-medium'>Gastos</span>
          <p className='text-sm font-semibold text-red-700 truncate mt-1'>
            -{formatCurrency(totalExpenses, currency)}
          </p>
        </button>

        {/* Ahorros */}
        <button
          onClick={() => handleCardClick('savings')}
          className={`rounded-xl p-2.5 text-left transition-all border-2 ${
            activeFilter === 'savings' 
              ? 'bg-purple-100 border-purple-500 shadow-sm' 
              : 'bg-purple-50 border-transparent hover:border-purple-300'
          }`}
        >
          <span className='text-[10px] uppercase tracking-wide text-purple-600 font-medium'>Ahorros</span>
          <p className='text-sm font-semibold text-purple-700 truncate mt-1'>
            {formatCurrency(totalSavings, currency)}
          </p>
        </button>
      </div>
    </div>
  );
};
