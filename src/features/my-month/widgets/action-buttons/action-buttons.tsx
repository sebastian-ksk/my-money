'use client';

import React from 'react';
import { Button } from '@/components/ui';

interface ActionButtonsProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onAddSavings: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAddExpense,
  onAddIncome,
  onAddSavings,
}) => {
  return (
    <div className='flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8'>
      <Button
        onClick={onAddExpense}
        variant='secondary'
        size='md'
        className='flex-1 sm:flex-initial sm:min-w-[160px]'
        icon={
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4v16m8-8H4'
            />
          </svg>
        }
      >
        <span className='hidden sm:inline'>Agregar Gasto</span>
        <span className='sm:hidden'>Gasto</span>
      </Button>
      <Button
        onClick={onAddIncome}
        variant='secondary'
        size='md'
        className='flex-1 sm:flex-initial sm:min-w-[160px]'
        icon={
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4v16m8-8H4'
            />
          </svg>
        }
      >
        <span className='hidden sm:inline'>Agregar Ingreso</span>
        <span className='sm:hidden'>Ingreso</span>
      </Button>
      <Button
        onClick={onAddSavings}
        variant='secondary'
        size='md'
        className='flex-1 sm:flex-initial sm:min-w-[160px]'
        icon={
          <svg
            className='w-5 h-5'
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
        }
      >
        <span className='hidden sm:inline'>Agregar Ahorro</span>
        <span className='sm:hidden'>Ahorro</span>
      </Button>
    </div>
  );
};

