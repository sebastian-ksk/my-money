'use client';

import React, { useState, useEffect } from 'react';
import firebaseApp from 'firebase/app';
import { useAppDispatch } from '@/Redux/store/hooks';
import {
  createTransaction,
  updateTransaction,
  loadTransactions,
} from '@/Redux/features/my-month/my-month-thunks';
import {
  createSavingsSource,
  loadSavingsSources,
} from '@/Redux/features/config-my-money';
import type { Transaction } from '@/Redux/features/my-month/my-month-models';
import type { SavingsSource } from '@/Redux/features/config-my-money/config-my-money-models';
import { Button } from '@/components/ui';
import ModalWithContent from '@/components/modal-with-content';

interface SavingsModalProps {
  userId: string;
  monthPeriod: string;
  savingsSources: SavingsSource[];
  currency: string;
  editingTransaction: Transaction | null;
  onClose: () => void;
  onSave: () => void;
}

const SavingsModal: React.FC<SavingsModalProps> = ({
  userId,
  monthPeriod,
  savingsSources,
  currency,
  editingTransaction,
  onClose,
  onSave,
}) => {
  const dispatch = useAppDispatch();
  const [savingsSourceId, setSavingsSourceId] = useState('');
  const [newSavingsSourceName, setNewSavingsSourceName] = useState('');
  const [value, setValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  useEffect(() => {
    if (editingTransaction) {
      setSavingsSourceId(editingTransaction.savingsSourceId || '');
      setValue(editingTransaction.value?.toString() || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'efectivo');
    } else {
      // Reset form
      setSavingsSourceId('');
      setNewSavingsSourceName('');
      setValue('');
      setPaymentMethod('efectivo');
    }
  }, [editingTransaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !value) return;

    let finalSavingsSourceId = savingsSourceId;

    // Si el usuario quiere crear un nuevo savings source
    if (savingsSourceId === 'new' && newSavingsSourceName) {
      try {
        const newSource = await dispatch(
          createSavingsSource({
            userId,
            source: {
              name: newSavingsSourceName,
              amount: 0,
            },
          })
        ).unwrap();

        if (!newSource.id) {
          console.error('Error al crear fuente de ahorro: no se obtuvo ID');
          return;
        }
        finalSavingsSourceId = newSource.id;
        await dispatch(loadSavingsSources(userId));
      } catch (error) {
        console.error('Error al crear fuente de ahorro:', error);
        return;
      }
    }

    if (!finalSavingsSourceId) {
      console.error('Debe seleccionar o crear una fuente de ahorro');
      return;
    }

    const savingsSource = savingsSources.find(
      (ss) => ss.id === finalSavingsSourceId
    );
    if (!savingsSource && savingsSourceId !== 'new') {
      console.error('Fuente de ahorro no encontrada');
      return;
    }

    try {
      if (editingTransaction && editingTransaction.id) {
        await dispatch(
          updateTransaction({
            transactionId: editingTransaction.id,
            transaction: {
              value: parseFloat(value),
              paymentMethod,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createTransaction({
            userId,
            transaction: {
              type: 'savings',
              value: parseFloat(value),
              concept: savingsSource?.name || newSavingsSourceName,
              paymentMethod,
              date: firebaseApp.firestore.Timestamp.fromDate(new Date()),
              monthPeriod,
              savingsSourceId: finalSavingsSourceId,
            },
          })
        ).unwrap();
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
      console.error('Error al guardar ahorro:', error);
    }
  };

  return (
    <ModalWithContent
      isOpen={true}
      onClose={onClose}
      title={editingTransaction ? 'Editar Ahorro' : 'Agregar Ahorro'}
      maxWidth='md'
    >
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2 text-primary-medium'>
            Fuente de Ahorro *
          </label>
          <select
            required
            value={savingsSourceId}
            onChange={(e) => {
              setSavingsSourceId(e.target.value);
              setNewSavingsSourceName('');
            }}
            disabled={!!editingTransaction}
            className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white disabled:bg-zinc-100 disabled:text-zinc-600'
            aria-label='Fuente de ahorro'
          >
            <option value=''>Seleccione una fuente de ahorro</option>
            {savingsSources.map((ss) => (
              <option key={ss.id} value={ss.id}>
                {ss.name}
              </option>
            ))}
            {!editingTransaction && (
              <option value='new'>+ Crear nueva fuente de ahorro</option>
            )}
          </select>
        </div>

        {savingsSourceId === 'new' && (
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2 text-primary-medium'>
              Nombre de la Nueva Fuente de Ahorro *
            </label>
            <input
              type='text'
              required
              value={newSavingsSourceName}
              onChange={(e) => setNewSavingsSourceName(e.target.value)}
              className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white'
              placeholder='Ej: Cuenta de ahorros, Caja fuerte, etc.'
              aria-label='Nombre de la nueva fuente de ahorro'
            />
          </div>
        )}

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
              !savingsSourceId ||
              !value ||
              (savingsSourceId === 'new' && !newSavingsSourceName)
            }
          >
            Guardar
          </Button>
        </div>
      </form>
    </ModalWithContent>
  );
};

export default SavingsModal;

