'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HiTrash, HiPencil } from 'react-icons/hi';
import { useAppDispatch } from '@/Redux/store/hooks';
import {
  createLiquiditySource,
  updateLiquiditySource,
  deleteLiquiditySource,
} from '@/Redux/features/my-month/my-month-thunks';
import type {
  LiquiditySource,
  MonthlyLiquidityState,
} from '@/Redux/features/my-month/my-month-models';
import { Button, useConfirm } from '@/components/ui';
import ModalWithContent from '@/components/modal-with-content';
import { formatCurrency } from '@/utils/currency';
import { myMonthService } from '@/services/Firebase/my-month-service';

interface LiquidityModalProps {
  userId: string;
  monthPeriod: string;
  monthlyLiquidity: MonthlyLiquidityState | null;
  currency: string;
  onClose: () => void;
  onSave: () => void;
}

const LiquidityModal: React.FC<LiquidityModalProps> = ({
  userId,
  monthPeriod,
  monthlyLiquidity,
  currency,
  onClose,
  onSave,
}) => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const sources = useMemo(
    () => monthlyLiquidity?.liquiditySources || [],
    [monthlyLiquidity?.liquiditySources]
  );
  // Calcular total real de fuentes (solo valores reales, no esperados)
  const totalRealFromSources = useMemo(() => {
    return sources.reduce((sum, s) => sum + (s.realAmount ?? 0), 0);
  }, [sources]);

  // El expectedAmount siempre es el valor calculado del mes anterior
  const baseExpected = useMemo(() => {
    return monthlyLiquidity?.expectedAmount ?? 0;
  }, [monthlyLiquidity?.expectedAmount]);

  // El valor neto es la suma de todas las fuentes
  const totalNet = useMemo(() => {
    return totalRealFromSources;
  }, [totalRealFromSources]);

  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [previousMonthSources, setPreviousMonthSources] = useState<
    LiquiditySource[]
  >([]);

  // Formulario para agregar/editar fuente
  const sourceForm = useForm<{
    sourceName: string;
    realAmount: string;
  }>({
    defaultValues: {
      sourceName: '',
      realAmount: '',
    },
  });

  // Cargar datos de la fuente al formulario cuando se selecciona para editar
  useEffect(() => {
    if (editingSourceId) {
      const sourceToEdit = sources.find((s) => s.id === editingSourceId);
      if (sourceToEdit) {
        sourceForm.setValue('sourceName', sourceToEdit.name);
        sourceForm.setValue(
          'realAmount',
          sourceToEdit.realAmount?.toString() || ''
        );
      }
    } else {
      sourceForm.reset({ sourceName: '', realAmount: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSourceId, sources]);

  // Cargar fuentes del mes anterior
  useEffect(() => {
    const loadPreviousSources = async () => {
      try {
        const prevSources =
          await myMonthService.getPreviousMonthLiquiditySources(
            userId,
            monthPeriod
          );
        setPreviousMonthSources(prevSources);
      } catch (error) {
        console.error('Error al cargar fuentes del mes anterior:', error);
      }
    };
    loadPreviousSources();
  }, [userId, monthPeriod]);

  const handleAddOrUpdateSource = async (data: {
    sourceName: string;
    realAmount: string;
  }) => {
    if (!data.sourceName || !data.realAmount) return;

    try {
      const sourceName = data.sourceName.trim();

      // Buscar si la fuente existía en el mes anterior
      const previousSource = previousMonthSources.find(
        (s) => s.name === sourceName
      );
      // Si existía en el mes anterior, usar su valor real como expectedAmount
      // Si no existía, el expectedAmount es 0
      const expectedAmount = previousSource?.realAmount ?? 0;
      const realAmount = parseFloat(data.realAmount);

      if (editingSourceId) {
        // Actualizar fuente existente
        await dispatch(
          updateLiquiditySource({
            userId,
            monthPeriod,
            sourceId: editingSourceId,
            source: {
              name: sourceName,
              expectedAmount,
              realAmount,
            },
          })
        ).unwrap();
      } else {
        // Crear nueva fuente
        await dispatch(
          createLiquiditySource({
            userId,
            monthPeriod,
            source: {
              name: sourceName,
              expectedAmount,
              realAmount,
            },
          })
        ).unwrap();
      }

      // Limpiar formulario y estado de edición
      setEditingSourceId(null);
      sourceForm.reset({ sourceName: '', realAmount: '' });
      await onSave();
    } catch (error) {
      console.error('Error al guardar fuente:', error);
    }
  };

  const handleEditSource = (sourceId: string) => {
    setEditingSourceId(sourceId);
  };

  const handleCancelEdit = () => {
    setEditingSourceId(null);
    sourceForm.reset({ sourceName: '', realAmount: '' });
  };

  const handleDeleteSource = async (sourceId: string) => {
    const confirmed = await confirm.showConfirm({
      title: 'Eliminar Fuente',
      message: '¿Está seguro de eliminar esta fuente de liquidez?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await dispatch(
        deleteLiquiditySource({
          userId,
          monthPeriod,
          sourceId,
        })
      ).unwrap();
      await onSave();
    } catch (error) {
      console.error('Error al eliminar fuente:', error);
    }
  };

  return (
    <ModalWithContent
      isOpen={true}
      onClose={onClose}
      title='Líquido del Mes Anterior'
      maxWidth='2xl'
    >
      {/* Resumen */}
      <div className='mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <div className='text-xs text-zinc-500 mb-1'>Total Esperado</div>
            <div className='text-lg font-semibold text-zinc-800'>
              {formatCurrency(baseExpected, currency)}
            </div>
            <div className='text-xs text-zinc-400 mt-1'>
              Calculado del mes anterior
            </div>
          </div>
          <div>
            <div className='text-xs text-zinc-500 mb-1'>Total Real (Neto)</div>
            <div className='text-lg font-semibold text-green-600'>
              {formatCurrency(totalNet, currency)}
            </div>
            <div className='text-xs text-zinc-400 mt-1'>
              Suma de todas las fuentes
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Fuentes */}
      <div className='mb-6'>
        <h4 className='text-lg font-semibold mb-4 text-primary-dark'>
          Fuentes de Liquidez
        </h4>
        {sources.length === 0 ? (
          <div className='text-center py-8 text-zinc-500'>
            <p>No hay fuentes de liquidez agregadas</p>
            <p className='text-sm mt-1'>Agrega una fuente para comenzar</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {sources.map((source: LiquiditySource, index: number) => (
              <div
                key={source.id || `source-${index}`}
                className='p-4 border border-zinc-200 rounded-lg bg-white hover:border-zinc-300 transition-colors'
              >
                <div className='flex justify-between items-start gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='font-semibold text-zinc-800 mb-3'>
                      {source.name}
                    </div>
                    <div className='grid grid-cols-2 gap-4 mb-3'>
                      <div>
                        <div className='text-xs text-zinc-500 mb-1'>
                          Esperado
                        </div>
                        <div className='text-sm font-medium text-zinc-700'>
                          {formatCurrency(source.expectedAmount, currency)}
                        </div>
                      </div>
                      <div>
                        <div className='text-xs text-zinc-500 mb-1'>Real</div>
                        <div className='text-sm font-medium text-green-600'>
                          {source.realAmount !== null
                            ? formatCurrency(source.realAmount, currency)
                            : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {source.id && (
                    <div className='flex gap-2 shrink-0'>
                      <Button
                        onClick={() => handleEditSource(source.id!)}
                        variant='ghost'
                        size='sm'
                        icon={<HiPencil className='w-4 h-4' />}
                        iconOnly
                        aria-label='Editar fuente'
                        disabled={editingSourceId === source.id}
                      />
                      <Button
                        onClick={() => {
                          if (source.id) {
                            handleDeleteSource(source.id);
                          }
                        }}
                        variant='ghost'
                        size='sm'
                        icon={<HiTrash className='w-4 h-4' />}
                        iconOnly
                        aria-label='Eliminar fuente'
                        disabled={!!editingSourceId}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agregar/Actualizar Fuente */}
      <div className='mb-6 p-4 border border-zinc-200 rounded-lg bg-zinc-50'>
        <h4 className='text-md font-semibold mb-3 text-primary-dark'>
          {editingSourceId ? 'Actualizar Fuente' : 'Agregar Fuente'}
        </h4>
        <form
          onSubmit={sourceForm.handleSubmit(handleAddOrUpdateSource)}
          className='space-y-3'
        >
          <div>
            <label className='block text-sm font-medium mb-1 text-primary-medium'>
              Nombre de la Fuente *
            </label>
            <input
              type='text'
              {...sourceForm.register('sourceName', {
                required: 'El nombre es requerido',
              })}
              disabled={!!editingSourceId}
              className='w-full px-3 py-2 border border-zinc-200 rounded-lg text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-light disabled:bg-zinc-100 disabled:text-zinc-600'
              placeholder='Nombre de la fuente (ej: Efectivo, Banco, etc.)'
              aria-label='Nombre de la fuente'
            />
            {sourceForm.formState.errors.sourceName && (
              <p className='text-xs text-red-500 mt-1'>
                {sourceForm.formState.errors.sourceName.message}
              </p>
            )}
          </div>
          <div>
            <label className='block text-sm font-medium mb-1 text-primary-medium'>
              Valor Real *
            </label>
            <input
              type='number'
              step='0.01'
              {...sourceForm.register('realAmount', {
                required: 'El valor real es requerido',
                min: {
                  value: 0,
                  message: 'El valor debe ser mayor o igual a 0',
                },
              })}
              className='w-full px-3 py-2 border border-zinc-200 rounded-lg text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-light'
              placeholder='Ingrese el valor real'
              aria-label='Valor real'
            />
            {sourceForm.formState.errors.realAmount && (
              <p className='text-xs text-red-500 mt-1'>
                {sourceForm.formState.errors.realAmount.message}
              </p>
            )}
            {(() => {
              const sourceName = sourceForm.watch('sourceName');
              if (sourceName) {
                const prevSource = previousMonthSources.find(
                  (s) => s.name === sourceName.trim()
                );
                const expectedValue = prevSource?.realAmount ?? 0;
                return (
                  <p className='text-xs text-zinc-500 mt-1'>
                    Valor esperado: {formatCurrency(expectedValue, currency)}{' '}
                    {prevSource
                      ? '(del mes anterior)'
                      : '(nueva fuente, sin valor anterior)'}
                  </p>
                );
              }
              return null;
            })()}
          </div>
          <div className='flex gap-2'>
            <Button
              type='submit'
              variant='secondary'
              size='md'
              className='flex-1'
              disabled={
                !sourceForm.watch('sourceName') ||
                !sourceForm.watch('realAmount')
              }
            >
              {editingSourceId ? 'Actualizar Fuente' : 'Agregar Fuente'}
            </Button>
            {editingSourceId && (
              <Button
                type='button'
                onClick={handleCancelEdit}
                variant='outline'
                size='md'
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className='flex gap-3'>
        <Button
          type='button'
          onClick={onClose}
          variant='outline'
          size='md'
          className='flex-1'
        >
          Cerrar
        </Button>
      </div>
    </ModalWithContent>
  );
};

export default LiquidityModal;
