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
import type { ExpectedIncome } from '@/Redux/features/config-my-money/config-my-money-models';
import { Button } from '@/components/ui';
import ModalWithContent from '@/components/modal-with-content';
import { formatCurrency } from '@/utils/currency';

interface IncomeModalProps {
  userId: string;
  monthPeriod: string;
  expectedIncomes: ExpectedIncome[];
  currency: string;
  editingTransaction: Transaction | null;
  onClose: () => void;
  onSave: () => void;
}

const IncomeModal: React.FC<IncomeModalProps> = ({
  userId,
  monthPeriod,
  expectedIncomes,
  currency,
  editingTransaction,
  onClose,
  onSave,
}) => {
  const dispatch = useAppDispatch();
  const [expectedIncomeId, setExpectedIncomeId] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [realAmount, setRealAmount] = useState('');
  const [value, setValue] = useState('');
  const [concept, setConcept] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  useEffect(() => {
    if (editingTransaction) {
      if (editingTransaction.type === 'expected_income') {
        setExpectedIncomeId(editingTransaction.expectedIncomeId || '');
        setExpectedAmount(editingTransaction.expectedAmount?.toString() || '');
        setRealAmount(editingTransaction.value?.toString() || '');
        setPaymentMethod(editingTransaction.paymentMethod || 'efectivo');
      } else if (editingTransaction.type === 'unexpected_income') {
        setExpectedIncomeId('');
        setValue(editingTransaction.value?.toString() || '');
        setConcept(editingTransaction.concept || '');
        setPaymentMethod(editingTransaction.paymentMethod || 'efectivo');
      }
    } else {
      // Reset form
      setExpectedIncomeId('');
      setExpectedAmount('');
      setRealAmount('');
      setValue('');
      setConcept('');
      setPaymentMethod('efectivo');
    }
  }, [editingTransaction]);

  const handleExpectedIncomeChange = (selectedId: string) => {
    setExpectedIncomeId(selectedId);
    const expectedIncome = expectedIncomes.find((ei) => ei.id === selectedId);
    if (expectedIncome) {
      setExpectedAmount(expectedIncome.amount.toString());
      setRealAmount(expectedIncome.amount.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      // Si hay expectedIncomeId, es un ingreso esperado
      if (expectedIncomeId) {
        const expectedIncome = expectedIncomes.find(
          (ei) => ei.id === expectedIncomeId
        );
        if (!expectedIncome) return;

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
                type: 'expected_income',
                expectedIncomeId,
                expectedAmount: parseFloat(expectedAmount),
                value: parseFloat(realAmount),
                concept: expectedIncome.name,
                paymentMethod,
                date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
                monthPeriod,
              },
            })
          ).unwrap();
        }
      } else {
        // Es un ingreso inesperado
        if (!concept || !value) return;

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
                type: 'unexpected_income',
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
      console.error('Error al guardar ingreso:', error);
    }
  };

  return (
    <ModalWithContent
      isOpen={true}
      onClose={onClose}
      title={
        expectedIncomeId
          ? 'Agregar Ingreso Esperado'
          : 'Agregar Ingreso Inesperado'
      }
      maxWidth='md'
    >
      <form onSubmit={handleSubmit}>
        {/* Tipo de Ingreso */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2 text-primary-medium'>
            Tipo de Ingreso
          </label>
          <select
            value={expectedIncomeId || 'unexpected'}
            onChange={(e) => {
              if (e.target.value === 'unexpected') {
                setExpectedIncomeId('');
                setExpectedAmount('');
                setRealAmount('');
              } else {
                handleExpectedIncomeChange(e.target.value);
              }
            }}
            disabled={!!editingTransaction}
            className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white disabled:bg-zinc-100 disabled:text-zinc-600'
            aria-label='Tipo de ingreso'
          >
            <option value='unexpected'>Ingreso Inesperado</option>
            {expectedIncomes.length > 0 && (
              <optgroup label='Ingresos Esperados'>
                {expectedIncomes.map((ei) => (
                  <option key={ei.id} value={ei.id}>
                    {ei.name} - {formatCurrency(ei.amount, currency)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {expectedIncomeId ? (
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
                aria-label='Valor esperado'
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
        ) : (
          <>
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
                placeholder='Descripción del ingreso'
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
            size='default'
            className='flex-1'
          >
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='secondary'
            size='default'
            className='flex-1'
            disabled={
              expectedIncomeId
                ? !realAmount
                : !value || !concept
            }
          >
            Guardar
          </Button>
        </div>
      </form>
    </ModalWithContent>
  );
};

export default IncomeModal;

