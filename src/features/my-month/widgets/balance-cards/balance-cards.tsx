'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/utils/currency';

interface BalanceCardsProps {
  displayLiquidity: number;
  totalExpenses: number;
  totalIncomes: number;
  totalSavings: number;
  finalBalance: number;
  currency: string;
  onEditLiquidity: () => void;
}

export const BalanceCards: React.FC<BalanceCardsProps> = ({
  displayLiquidity,
  totalExpenses,
  totalIncomes,
  totalSavings,
  finalBalance,
  currency,
  onEditLiquidity,
}) => {
  return (
    <div className='mb-6 sm:mb-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4'>
        {/* Card: Saldo Inicial */}
        <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 lg:p-5 border border-blue-200 shadow-sm min-w-0'>
          <div className='flex items-start justify-between mb-2 gap-2'>
            <div className='flex items-center gap-2 min-w-0 flex-1'>
              <div className='p-1.5 sm:p-2 bg-blue-200 rounded-lg flex-shrink-0'>
                <svg
                  className='w-4 h-4 sm:w-5 sm:h-5 text-blue-700'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h3 className='text-xs sm:text-sm font-medium text-blue-900 truncate'>
                Saldo Inicial
              </h3>
            </div>
            <Button
              onClick={onEditLiquidity}
              variant='ghost'
              size='sm'
              className='!p-1 flex-shrink-0'
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
          </div>
          <p className='text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 break-words overflow-hidden'>
            {formatCurrency(displayLiquidity ?? 0, currency)}
          </p>
          <p className='text-xs text-blue-700 mt-1'>Del mes anterior</p>
        </div>

        {/* Card: Gastos */}
        <div className='bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 sm:p-4 lg:p-5 border border-red-200 shadow-sm min-w-0'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='p-1.5 sm:p-2 bg-red-200 rounded-lg flex-shrink-0'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-red-700'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
            <h3 className='text-xs sm:text-sm font-medium text-red-900'>
              Gastos
            </h3>
          </div>
          <p className='text-xl sm:text-2xl lg:text-3xl font-bold text-red-700 break-words overflow-hidden'>
            {formatCurrency(totalExpenses, currency)}
          </p>
          <p className='text-xs text-red-700 mt-1'>Este mes</p>
        </div>

        {/* Card: Ingresos */}
        <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 lg:p-5 border border-green-200 shadow-sm min-w-0'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='p-1.5 sm:p-2 bg-green-200 rounded-lg flex-shrink-0'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-green-700'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h3 className='text-xs sm:text-sm font-medium text-green-900'>
              Ingresos
            </h3>
          </div>
          <p className='text-xl sm:text-2xl lg:text-3xl font-bold text-green-700 break-words overflow-hidden'>
            {formatCurrency(totalIncomes, currency)}
          </p>
          <p className='text-xs text-green-700 mt-1'>Este mes</p>
        </div>

        {/* Card: Ahorros */}
        <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 lg:p-5 border border-purple-200 shadow-sm min-w-0'>
          <div className='flex items-center gap-2 mb-2'>
            <div className='p-1.5 sm:p-2 bg-purple-200 rounded-lg flex-shrink-0'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-purple-700'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
            <h3 className='text-xs sm:text-sm font-medium text-purple-900'>
              Ahorros
            </h3>
          </div>
          <p className='text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700 break-words overflow-hidden'>
            {formatCurrency(totalSavings, currency)}
          </p>
          <p className='text-xs text-purple-700 mt-1'>Este mes</p>
        </div>

        {/* Card: Balance Final */}
        <div
          className={`rounded-xl p-3 sm:p-4 lg:p-5 border shadow-sm min-w-0 ${
            finalBalance >= 0
              ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
              : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
          }`}
        >
          <div className='flex items-center gap-2 mb-2'>
            <div
              className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                finalBalance >= 0 ? 'bg-green-200' : 'bg-red-200'
              }`}
            >
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  finalBalance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            </div>
            <h3
              className={`text-xs sm:text-sm font-medium ${
                finalBalance >= 0 ? 'text-green-900' : 'text-red-900'
              }`}
            >
              Balance Final
            </h3>
          </div>
          <p
            className={`text-xl sm:text-2xl lg:text-3xl font-bold break-words overflow-hidden ${
              finalBalance >= 0 ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {formatCurrency(finalBalance, currency)}
          </p>
          <p
            className={`text-xs mt-1 ${
              finalBalance >= 0 ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {finalBalance >= 0 ? 'Disponible' : 'En déficit'}
          </p>
        </div>
      </div>
    </div>
  );
};
