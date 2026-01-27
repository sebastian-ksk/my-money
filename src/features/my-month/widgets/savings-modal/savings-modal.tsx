'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '@/Redux/store/hooks';
import {
  createSavingsTransaction,
  updateSavingsTransaction,
  loadSavingsTransactions,
} from '@/Redux/features/my-month/savings-thunks';
import { loadTransactions } from '@/Redux/features/my-month/my-month-thunks';
import type { Transaction } from '@/Redux/features/my-month/my-month-models';
import type { SavingsSource } from '@/Redux/features/config-my-money/config-my-money-models';
import { Button } from '@/components/ui';
import ModalWithContent from '@/components/modal-with-content';
import { formatCurrency } from '@/utils/currency';

interface SavingsModalProps {
  userId: string;
  monthPeriod: string;
  savingsSources: SavingsSource[];
  currency: string;
  editingTransaction: Transaction | null;
  onClose: () => void;
  onSave: () => void;
}

const ORIGIN_SOURCES = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'cuenta_bancaria', label: 'Cuenta Bancaria' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'tarjeta_debito', label: 'Tarjeta Débito' },
  { value: 'otro', label: 'Otro' },
];

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
  const [originSource, setOriginSource] = useState('efectivo');
  const [value, setValue] = useState('');
  const [concept, setConcept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener información de la fuente seleccionada
  const selectedSource = savingsSources.find((s) => s.id === savingsSourceId);

  useEffect(() => {
    if (editingTransaction && editingTransaction.type === 'savings') {
      setSavingsSourceId(editingTransaction.savingsSourceId || '');
      setOriginSource(editingTransaction.originSource || editingTransaction.paymentMethod || 'efectivo');
      setValue(editingTransaction.value?.toString() || '');
      setConcept(editingTransaction.concept || '');
    } else {
      // Reset form
      setSavingsSourceId('');
      setOriginSource('efectivo');
      setValue('');
      setConcept('');
    }
  }, [editingTransaction]);

  const handleSavingsSourceChange = (selectedId: string) => {
    setSavingsSourceId(selectedId);
    const source = savingsSources.find((s) => s.id === selectedId);
    if (source && !concept) {
      setConcept(`Ahorro a ${source.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !savingsSourceId || !value || !originSource) return;

    setIsSubmitting(true);

    try {
      // Convertir a número y redondear para evitar errores de precisión
      const numericValue = Math.round(Number(value));

      if (editingTransaction && editingTransaction.id) {
        // Actualizar transacción existente
        await dispatch(
          updateSavingsTransaction({
            transactionId: editingTransaction.id,
            value: numericValue,
            originSource,
            concept: concept || undefined,
          })
        ).unwrap();
      } else {
        // Crear nueva transacción de ahorro
        await dispatch(
          createSavingsTransaction({
            userId,
            monthPeriod,
            savingsSourceId,
            originSource,
            value: numericValue,
            concept: concept || undefined,
            date: new Date(),
          })
        ).unwrap();
      }

      // Recargar transacciones
      await dispatch(
        loadTransactions({
          userId,
          monthPeriod,
        })
      ).unwrap();

      // Recargar datos de ahorros
      await dispatch(
        loadSavingsTransactions({
          userId,
          monthPeriod,
        })
      ).unwrap();

      await onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar ahorro:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar ahorro');
    } finally {
      setIsSubmitting(false);
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
        {/* Destino del ahorro */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2 text-primary-medium'>
            Destino del Ahorro *
          </label>
          <select
            required
            value={savingsSourceId}
            onChange={(e) => handleSavingsSourceChange(e.target.value)}
            disabled={!!editingTransaction}
            className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white disabled:bg-zinc-100 disabled:text-zinc-600'
            aria-label='Destino del ahorro'
          >
            <option value=''>Seleccione una fuente de ahorro</option>
            {savingsSources.length === 0 ? (
              <option value='' disabled>
                No hay fuentes de ahorro configuradas. Configúralas primero.
              </option>
            ) : (
              savingsSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name} - Balance: {formatCurrency(source.currentBalance || 0, currency)}
                </option>
              ))
            )}
          </select>
          {selectedSource && (
            <p className='text-xs text-zinc-500 mt-1'>
              Balance actual: {formatCurrency(selectedSource.currentBalance || 0, currency)}
              {selectedSource.amount > 0 && (
                <span> (Inicial: {formatCurrency(selectedSource.amount, currency)})</span>
              )}
            </p>
          )}
        </div>

        {/* Origen del dinero */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2 text-primary-medium'>
            Origen del Dinero *
          </label>
          <select
            required
            value={originSource}
            onChange={(e) => setOriginSource(e.target.value)}
            className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white'
            aria-label='Origen del dinero'
          >
            {ORIGIN_SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
          <p className='text-xs text-zinc-500 mt-1'>
            De dónde viene el dinero que vas a ahorrar
          </p>
        </div>

        {/* Monto */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2 text-primary-medium'>
            Monto a Ahorrar *
          </label>
          <input
            type='number'
            step='0.01'
            min='0.01'
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white'
            placeholder='0.00'
            aria-label='Monto a ahorrar'
          />
        </div>

        {/* Concepto (opcional) */}
        <div className='mb-6'>
          <label className='block text-sm font-medium mb-2 text-primary-medium'>
            Concepto (opcional)
          </label>
          <input
            type='text'
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-zinc-900 bg-white'
            placeholder='Descripción del ahorro'
            aria-label='Concepto'
          />
        </div>

        {/* Resumen */}
        {savingsSourceId && value && (
          <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
            <h4 className='text-sm font-medium text-green-800 mb-2'>Resumen</h4>
            <div className='text-sm text-green-700 space-y-1'>
              <p>
                <span className='font-medium'>Monto:</span>{' '}
                {formatCurrency(parseFloat(value) || 0, currency)}
              </p>
              <p>
                <span className='font-medium'>De:</span>{' '}
                {ORIGIN_SOURCES.find((s) => s.value === originSource)?.label}
              </p>
              <p>
                <span className='font-medium'>A:</span> {selectedSource?.name}
              </p>
              {selectedSource && (
                <p>
                  <span className='font-medium'>Nuevo balance:</span>{' '}
                  {formatCurrency(
                    (selectedSource.currentBalance || 0) + (parseFloat(value) || 0),
                    currency
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        <div className='flex gap-3'>
          <Button
            type='button'
            onClick={onClose}
            variant='outline'
            size='default'
            className='flex-1'
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type='submit'
            variant='secondary'
            size='default'
            className='flex-1'
            disabled={!savingsSourceId || !value || !originSource || isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </ModalWithContent>
  );
};

export default SavingsModal;
