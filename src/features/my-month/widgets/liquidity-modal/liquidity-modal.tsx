'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { MonthlyLiquidityState } from '@/Redux/features/my-month/my-month-models';
import { Button } from '@/components/ui';
import { useConfirm } from '@/components/confirm-modal';
import ModalWithContent from '@/components/modal-with-content';
import { formatCurrency } from '@/utils/currency';

interface LiquidityModalProps {
  userId: string;
  monthPeriod: string;
  monthlyLiquidity: MonthlyLiquidityState | null;
  currency: string;
  initialLiquidityAmount?: number;
  wasCalculated?: boolean;
  onClose: () => void;
  onSave: (amount?: number) => void;
  onDelete?: () => void;
}

const LiquidityModal: React.FC<LiquidityModalProps> = ({
  monthPeriod,
  currency,
  initialLiquidityAmount = 0,
  wasCalculated = false,
  onClose,
  onSave,
  onDelete,
}) => {
  const confirm = useConfirm();
  const [isEditing, setIsEditing] = useState(false);

  // Formulario para editar liquidez inicial
  const form = useForm<{ amount: string }>({
    defaultValues: {
      amount: initialLiquidityAmount.toString(),
    },
  });

  // Actualizar valor del formulario cuando cambia la prop
  useEffect(() => {
    form.setValue('amount', initialLiquidityAmount.toString());
  }, [initialLiquidityAmount, form]);

  const handleSave = async (data: { amount: string }) => {
    const amount = parseFloat(data.amount);
    if (isNaN(amount)) return;

    try {
      await onSave(amount);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al guardar liquidez inicial:', error);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm.showConfirm({
      title: 'Eliminar Liquidez Manual',
      message:
        '¿Está seguro de eliminar el valor manual? Se usará el valor calculado automáticamente.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      if (onDelete) {
        await onDelete();
      }
    } catch (error) {
      console.error('Error al eliminar liquidez inicial:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setValue('amount', initialLiquidityAmount.toString());
  };

  return (
    <ModalWithContent
      isOpen={true}
      onClose={onClose}
      title='Liquidez Inicial del Mes'
      maxWidth='md'
    >
      {/* Info del periodo */}
      <div className='mb-4 text-sm text-zinc-500'>
        Periodo: <span className='font-medium text-zinc-700'>{monthPeriod}</span>
      </div>

      {/* Valor actual */}
      <div className='mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200'>
        <div className='text-xs text-blue-600 mb-1'>Liquidez Inicial</div>
        <div className='text-2xl font-bold text-blue-900'>
          {formatCurrency(initialLiquidityAmount, currency)}
        </div>
        <div className='text-xs text-blue-600 mt-2'>
          {wasCalculated ? (
            <span className='flex items-center gap-1'>
              <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' />
              </svg>
              Calculado automáticamente (mes anterior + ingresos - gastos - ahorros)
            </span>
          ) : (
            <span className='flex items-center gap-1'>
              <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
              </svg>
              Valor ingresado manualmente
            </span>
          )}
        </div>
      </div>

      {/* Formulario de edición */}
      {isEditing ? (
        <form onSubmit={form.handleSubmit(handleSave)} className='mb-6'>
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2 text-zinc-700'>
              Nuevo valor de liquidez inicial
            </label>
            <input
              type='number'
              step='0.01'
              {...form.register('amount', {
                required: 'El valor es requerido',
              })}
              className='w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Ingrese el valor'
              autoFocus
            />
            {form.formState.errors.amount && (
              <p className='text-xs text-red-500 mt-1'>
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>
          <div className='flex gap-2'>
            <Button type='submit' variant='primary' size='default' className='flex-1'>
              Guardar
            </Button>
            <Button
              type='button'
              onClick={handleCancel}
              variant='outline'
              size='default'
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className='flex gap-2 mb-6'>
          <Button
            onClick={() => setIsEditing(true)}
            variant='secondary'
            size='default'
            className='flex-1'
          >
            <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
            </svg>
            Editar Valor
          </Button>
          {!wasCalculated && onDelete && (
            <Button
              onClick={handleDelete}
              variant='outline'
              size='default'
              className='text-red-600 hover:text-red-700 hover:border-red-300'
            >
              <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
              </svg>
              Usar Calculado
            </Button>
          )}
        </div>
      )}

      {/* Nota explicativa */}
      <div className='p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-600'>
        <p className='font-medium mb-1'>¿Qué es la liquidez inicial?</p>
        <p>
          Es el dinero disponible al inicio del mes. Por defecto se calcula automáticamente 
          como: <span className='font-medium'>liquidez del mes anterior + ingresos - gastos - ahorros</span>.
          Puedes editarlo manualmente si el cálculo no coincide con tu saldo real.
        </p>
      </div>

      <div className='flex gap-3 mt-6'>
        <Button
          type='button'
          onClick={onClose}
          variant='outline'
          size='default'
          className='flex-1'
        >
          Cerrar
        </Button>
      </div>
    </ModalWithContent>
  );
};

export default LiquidityModal;
