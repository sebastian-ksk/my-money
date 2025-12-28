'use client';

import React, { useState } from 'react';
import UserConfigSection from '../Widgets/user-config-section/user-config-section';
// import LiquidBalanceSection from '../Widgets/liquid-balance-section/liquid-balance-section';
import SavingsBalanceSection from '../Widgets/savings-balance-section/savings-balance-section';
import FixedExpensesSection from '../Widgets/fixed-expenses-section/fixed-expenses-section';
import ExpectedIncomesSection from '../Widgets/expected-incomes-section/expected-incomes-section';

const ConfigMyMoney = () => {
  const [openSection, setOpenSection] = useState<string | null>('user-config');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className='w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6'>
      <div className='space-y-3 sm:space-y-4'>
        {/* Sección: Configuración General */}
        <div className='bg-white rounded-lg shadow-md sm:shadow-lg overflow-hidden'>
          <button
            onClick={() => toggleSection('user-config')}
            className='w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-neutral-light transition-colors'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-primary-dark'>
              Configuración General
            </h2>
            <svg
              className={`w-5 h-5 text-primary-medium transition-transform ${
                openSection === 'user-config' ? 'rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
          {openSection === 'user-config' && (
            <div className='px-4 sm:px-6 pb-4 sm:pb-6'>
              <UserConfigSection />
            </div>
          )}
        </div>

        {/* Sección: Balance Líquido */}
        {/* <div className='bg-white rounded-lg shadow-md sm:shadow-lg overflow-hidden'>
          <button
            onClick={() => toggleSection('liquid-balance')}
            className='w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-neutral-light transition-colors'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-primary-dark'>
              Balance Líquido (Disponible)
            </h2>
            <svg
              className={`w-5 h-5 text-primary-medium transition-transform ${
                openSection === 'liquid-balance' ? 'rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
          {openSection === 'liquid-balance' && (
            <div className='px-4 sm:px-6 pb-4 sm:pb-6'>
              <LiquidBalanceSection />
            </div>
          )}
        </div> */}

        {/* Sección: Balance en Ahorro */}
        <div className='bg-white rounded-lg shadow-md sm:shadow-lg overflow-hidden'>
          <button
            onClick={() => toggleSection('savings-balance')}
            className='w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-neutral-light transition-colors'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-primary-dark'>
              Balance en Ahorro
            </h2>
            <svg
              className={`w-5 h-5 text-primary-medium transition-transform ${
                openSection === 'savings-balance' ? 'rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
          {openSection === 'savings-balance' && (
            <div className='px-4 sm:px-6 pb-4 sm:pb-6'>
              <SavingsBalanceSection />
            </div>
          )}
        </div>

        {/* Sección: Gastos Fijos */}
        <div className='bg-white rounded-lg shadow-md sm:shadow-lg overflow-hidden'>
          <button
            onClick={() => toggleSection('fixed-expenses')}
            className='w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-neutral-light transition-colors'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-primary-dark'>
              Gastos Fijos
            </h2>
            <svg
              className={`w-5 h-5 text-primary-medium transition-transform ${
                openSection === 'fixed-expenses' ? 'rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
          {openSection === 'fixed-expenses' && (
            <div className='px-4 sm:px-6 pb-4 sm:pb-6'>
              <FixedExpensesSection />
            </div>
          )}
        </div>

        {/* Sección: Ingresos Esperados */}
        <div className='bg-white rounded-lg shadow-md sm:shadow-lg overflow-hidden'>
          <button
            onClick={() => toggleSection('expected-incomes')}
            className='w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-neutral-light transition-colors'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-primary-dark'>
              Ingresos Esperados
            </h2>
            <svg
              className={`w-5 h-5 text-primary-medium transition-transform ${
                openSection === 'expected-incomes' ? 'rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
          {openSection === 'expected-incomes' && (
            <div className='px-4 sm:px-6 pb-4 sm:pb-6'>
              <ExpectedIncomesSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigMyMoney;
