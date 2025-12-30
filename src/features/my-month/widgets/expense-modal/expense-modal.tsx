'use client';

import React, { useState, useEffect } from 'react';
import firebaseApp from 'firebase/app';
import { useAppDispatch } from '@/Redux/store/hooks';
import {
  createTransaction,
  updateTransaction,
  loadTransactions,
} from '@/Redux/features/my-month/my-month-thunks';
import type { Transaction } from '@/Redux/features/my-month/my-month-models';
import type { FixedExpense } from '@/Redux/features/config-my-money/config-my-money-models';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/utils/currency';

interface ExpenseModalProps {
  userId: string;
  monthPeriod: string;
  fixedExpenses: FixedExpense[];
  currency: string;
  editingTransaction: Transaction | null;
  onClose: () => void;
  onSave: () => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  userId,
  monthPeriod,
  fixedExpenses,
  currency,
  editingTransaction,
  onClose,
  onSave,
}) => {
  const dispatch = useAppDispatch();
  const [expenseType, setExpenseType] = useState<'fixed' | 'regular'>('fixed');
  const [fixedExpenseId, setFixedExpenseId] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [realAmount, setRealAmount] = useState('');
  const [value, setValue] = useState('');
  const [concept, setConcept] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  useEffect(() => {
    if (editingTransaction) {
      if (editingTransaction.type === 'fixed_expense') {
        setExpenseType('fixed');
        setFixedExpenseId(editingTransaction.fixedExpenseId || '');
        setExpectedAmount(editingTransaction.expectedAmount?.toString() || '');
        setRealAmount(editingTransaction.value?.toString() || '');
        setPaymentMethod(editingTransaction.paymentMethod || 'efectivo');
      } else if (editingTransaction.type === 'regular_expense') {
        setExpenseType('regular');
        setValue(editingTransaction.value?.toString() || '');
        setConcept(editingTransaction.concept || '');
        setPaymentMethod(editingTransaction.paymentMethod || 'efectivo');
      }
    } else {
      // Reset form
      setExpenseType('fixed');
      setFixedExpenseId('');
      setExpectedAmount('');
      setRealAmount('');
      setValue('');
      setConcept('');
      setPaymentMethod('efectivo');
    }
  }, [editingTransaction]);

  const handleFixedExpenseChange = (selectedId: string) => {
    setFixedExpenseId(selectedId);
    const fixedExpense = fixedExpenses.find((fe) => fe.id === selectedId);
    if (fixedExpense) {
      setExpectedAmount(fixedExpense.amount.toString());
      setRealAmount(fixedExpense.amount.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (expenseType === 'fixed') {
        if (!fixedExpenseId || !realAmount) return;

        const fixedExpense = fixedExpenses.find((fe) => fe.id === fixedExpenseId);
        if (!fixedExpense) return;

        if (editingTransaction && editingTransaction.id) {
          await dispatch(
            updateTransaction({
              transactionId: editingTransaction.id,
              transaction: {
                value: parseFloat(realAmount),
                paymentMethod,
              },
            })
          ).unwrap();
        } else {
          await dispatch(
            createTransaction({
              userId,
              transaction: {
                type: 'fixed_expense',
                fixedExpenseId,
                expectedAmount: parseFloat(expectedAmount),
                value: parseFloat(realAmount),
                concept: fixedExpense.name,
                paymentMethod,
                date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
                monthPeriod,
              },
            })
          ).unwrap();
        }
      } else {
        // Regular expense
        if (!value || !concept) return;

        if (editingTransaction && editingTransaction.id) {
          await dispatch(
            updateTransaction({
              transactionId: editingTransaction.id,
              transaction: {
                value: parseFloat(value),
                concept,
                paymentMethod,
              },
            })
          ).unwrap();
        } else {
          await dispatch(
            createTransaction({
              userId,
              transaction: {
                type: 'regular_expense',
                value: parseFloat(value),
                concept,
                paymentMethod,
                date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
                monthPeriod,
              },
            })
          ).unwrap();
        }
      }

      await dispatch(
        loadTransactions({
          userId,
          monthPeriod,
        })
      ).unwrap();

      await onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar gasto:', error);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
        <h3 className='text-2xl font-bold mb-4 text-primary-dark'>
          {editingTransaction ? 'Editar Gasto' : 'Agregar Gasto'}
        </h3>
        <form onSubmit={handleSubmit}>
          {/* Tipo de Gasto */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2 text-primary-medium'>
              Tipo de Gasto *
            </label>
            <select
              value={expenseType}
              onChange={(e) => {
                setExpenseType(e.target.value as 'fixed' | 'regular');
                setFixedExpenseId('');
                setExpectedAmount('');
                setRealAmount('');
                setValue('');
                setConcept('');
              }}
              disabled={!!editingTransaction}
              className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white disabled:bg-zinc-100 disabled:text-zinc-600'
              aria-label='Tipo de gasto'
            >
              <option value='fixed'>Gasto Fijo</option>
              <option value='regular'>Gasto Ocasional</option>
            </select>
          </div>

          {expenseType === 'fixed' ? (
            <>
              {/* Gasto Fijo */}
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Gasto Fijo *
                </label>
                <select
                  required
                  value={fixedExpenseId}
                  onChange={(e) => handleFixedExpenseChange(e.target.value)}
                  disabled={!!editingTransaction}
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white disabled:bg-zinc-100 disabled:text-zinc-600'
                  aria-label='Gasto Fijo'
                >
                  <option value=''>Seleccione un gasto fijo</option>
                  {fixedExpenses.length === 0 ? (
                    <option value='' disabled>
                      No hay gastos fijos configurados. Configúralos primero.
                    </option>
                  ) : (
                    fixedExpenses.map((fe) => (
                      <option key={fe.id} value={fe.id}>
                        {fe.name} - {formatCurrency(fe.amount, currency)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {fixedExpenseId && (
                <>
                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2 text-primary-medium'>
                      Valor Esperado
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      required
                      value={expectedAmount}
                      readOnly
                      className='w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-100 text-zinc-600'
                    />
                  </div>

                  <div className='mb-4'>
                    <label className='block text-sm font-medium mb-2 text-primary-medium'>
                      Valor Real *
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      required
                      value={realAmount}
                      onChange={(e) => setRealAmount(e.target.value)}
                      className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white'
                      placeholder='0.00'
                      aria-label='Valor real'
                    />
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Gasto Ocasional */}
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Concepto *
                </label>
                <input
                  type='text'
                  required
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white'
                  placeholder='Descripción del gasto'
                  aria-label='Concepto'
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Valor *
                </label>
                <input
                  type='number'
                  step='0.01'
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white'
                  placeholder='0.00'
                  aria-label='Valor'
                />
              </div>
            </>
          )}

          {/* Medio de Pago */}
          <div className='mb-6'>
            <label className='block text-sm font-medium mb-2 text-primary-medium'>
              Medio de Pago *
            </label>
            <select
              required
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white'
              aria-label='Medio de pago'
            >
              <option value='efectivo'>Efectivo</option>
              <option value='tarjeta_debito'>Tarjeta Débito</option>
              <option value='tarjeta_credito'>Tarjeta Crédito</option>
              <option value='transferencia'>Transferencia</option>
              <option value='nequi'>Nequi</option>
              <option value='daviplata'>Daviplata</option>
              <option value='otro'>Otro</option>
            </select>
          </div>

          <div className='flex gap-3'>
            <Button
              type='button'
              onClick={onClose}
              variant='outline'
              size='md'
              className='flex-1'
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='secondary'
              size='md'
              className='flex-1'
              disabled={
                expenseType === 'fixed'
                  ? !fixedExpenseId || !realAmount
                  : !value || !concept
              }
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;

