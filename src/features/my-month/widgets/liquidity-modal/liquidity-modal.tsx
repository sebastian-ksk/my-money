'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/Redux/store/hooks';
import {
  createLiquiditySource,
  updateLiquiditySource,
  deleteLiquiditySource,
  updateMonthlyLiquidity,
} from '@/Redux/features/my-month/my-month-thunks';
import type {
  LiquiditySource,
  MonthlyLiquidityState,
} from '@/Redux/features/my-month/my-month-models';
import { Button, useConfirm } from '@/components/ui';
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

  const [mode, setMode] = useState<'simple' | 'sources'>(
    sources.length > 0 && sources.length > 1 ? 'sources' : 'simple'
  );

  // El expectedAmount siempre es el valor calculado del mes anterior
  const baseExpected = useMemo(() => {
    return monthlyLiquidity?.expectedAmount ?? 0;
  }, [monthlyLiquidity?.expectedAmount]);

  // El realAmount es el valor neto directo del usuario O la suma de los valores reales de las fuentes
  const baseReal = useMemo(() => {
    // Si hay un valor real directo en monthlyLiquidity, usarlo
    if (
      monthlyLiquidity?.realAmount !== null &&
      monthlyLiquidity?.realAmount !== undefined
    ) {
      return monthlyLiquidity.realAmount;
    }
    // Si no, usar la suma de los valores reales de las fuentes
    if (sources.length > 0 && totalRealFromSources > 0) {
      return totalRealFromSources;
    }
    // Si no hay nada, usar 0
    return 0;
  }, [monthlyLiquidity, sources.length, totalRealFromSources]);

  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [selectedSourceName, setSelectedSourceName] = useState('');
  const [previousMonthSources, setPreviousMonthSources] = useState<
    LiquiditySource[]
  >([]);

  // Formulario para modo simple
  const simpleForm = useForm<{ realAmount: string }>({
    defaultValues: {
      realAmount: baseReal.toString(),
    },
  });

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

  // Formulario para editar fuente existente
  const editSourceForm = useForm<{ realAmount: string }>({
    defaultValues: {
      realAmount: '',
    },
  });

  // Actualizar valores por defecto cuando cambian los datos
  useEffect(() => {
    simpleForm.reset({ realAmount: baseReal.toString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseReal]);

  useEffect(() => {
    if (selectedSourceName) {
      const existing = sources.find((s) => s.name === selectedSourceName);
      if (existing) {
        sourceForm.setValue('sourceName', selectedSourceName);
        sourceForm.setValue(
          'realAmount',
          existing.realAmount?.toString() || ''
        );
      }
    } else {
      sourceForm.reset({ sourceName: '', realAmount: '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSourceName, sources]);

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

  // Cargar nombres de fuentes disponibles
  const availableSourceNames = useMemo(() => {
    return Array.from(new Set(sources.map((s) => s.name).filter(Boolean)));
  }, [sources]);

  const handleSaveSimple = async (data: { realAmount: string }) => {
    if (!data.realAmount) return;

    try {
      const realAmount = parseFloat(data.realAmount);

      // El expectedAmount no se actualiza aquí, se mantiene el valor calculado del mes anterior
      // Solo actualizamos el realAmount como valor neto directo del usuario
      await dispatch(
        updateMonthlyLiquidity({
          userId,
          monthPeriod,
          realAmount: realAmount,
        })
      ).unwrap();

      // Si hay fuentes existentes, reemplazarlas con solo Neto
      if (sources.length > 0) {
        // Eliminar todas las fuentes existentes y crear solo Neto
        for (const source of sources) {
          if (source.id) {
            await dispatch(
              deleteLiquiditySource({
                userId,
                monthPeriod,
                sourceId: source.id,
              })
            ).unwrap();
          }
        }
      }

      // Crear la fuente Neto con el valor real ingresado
      // Buscar si "Neto" existía en el mes anterior
      const previousNeto = previousMonthSources.find((s) => s.name === 'Neto');
      // Si existía, usar su valor real como expectedAmount, si no, usar 0
      const netoExpectedAmount = previousNeto?.realAmount ?? 0;

      await dispatch(
        createLiquiditySource({
          userId,
          monthPeriod,
          source: {
            name: 'Neto',
            expectedAmount: netoExpectedAmount,
            realAmount,
          },
        })
      ).unwrap();

      await onSave();
    } catch (error) {
      console.error('Error al guardar valor neto:', error);
    }
  };

  const handleAddSource = async (data: {
    sourceName: string;
    realAmount: string;
  }) => {
    if (!data.sourceName || !data.realAmount) return;

    try {
      const sourceName = data.sourceName.trim();
      // Verificar si la fuente ya existe en este mes
      const existingSource = sources.find((s) => s.name === sourceName);

      // Buscar si la fuente existía en el mes anterior
      const previousSource = previousMonthSources.find(
        (s) => s.name === sourceName
      );
      // Si existía en el mes anterior, usar su valor real como expectedAmount
      // Si no existía, el expectedAmount es 0
      const expectedAmount = previousSource?.realAmount ?? 0;
      const realAmount = parseFloat(data.realAmount);

      if (existingSource && existingSource.id) {
        // Actualizar fuente existente
        await dispatch(
          updateLiquiditySource({
            userId,
            monthPeriod,
            sourceId: existingSource.id,
            source: {
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

      setSelectedSourceName('');
      sourceForm.reset({ sourceName: '', realAmount: '' });
      await onSave();
    } catch (error) {
      console.error('Error al agregar fuente:', error);
    }
  };

  const handleEditSource = (source: LiquiditySource) => {
    setEditingSourceId(source.id || null);
    editSourceForm.reset({ realAmount: source.realAmount?.toString() || '' });
  };

  const handleCancelEdit = () => {
    setEditingSourceId(null);
    editSourceForm.reset({ realAmount: '' });
  };

  const handleSaveEdit = async (data: { realAmount: string }) => {
    if (!editingSourceId || !data.realAmount) return;

    try {
      const source = sources.find((s) => s.id === editingSourceId);
      if (!source) return;

      // Buscar si la fuente existía en el mes anterior
      const previousSource = previousMonthSources.find(
        (s) => s.name === source.name
      );
      const expectedAmount = previousSource?.realAmount ?? 0;
      const realAmount = parseFloat(data.realAmount);

      await dispatch(
        updateLiquiditySource({
          userId,
          monthPeriod,
          sourceId: editingSourceId,
          source: {
            expectedAmount,
            realAmount,
          },
        })
      ).unwrap();

      setEditingSourceId(null);
      editSourceForm.reset({ realAmount: '' });
      await onSave();
    } catch (error) {
      console.error('Error al actualizar fuente:', error);
    }
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
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <h3 className='text-2xl font-bold mb-4 text-primary-dark'>
          Líquido del Mes Anterior
        </h3>

        {/* Selector de Modo */}
        <div className='mb-6 flex gap-2'>
          <Button
            onClick={() => setMode('simple')}
            variant={mode === 'simple' ? 'secondary' : 'outline'}
            size='md'
            className='flex-1'
          >
            Valor Neto
          </Button>
          <Button
            onClick={() => setMode('sources')}
            variant={mode === 'sources' ? 'secondary' : 'outline'}
            size='md'
            className='flex-1'
          >
            Con Fuentes
          </Button>
        </div>

        {/* Resumen */}
        <div className='mb-6 p-4 bg-zinc-50 rounded-lg'>
          <div className='flex justify-between items-center mb-2'>
            <span className='font-medium text-zinc-700'>Total Esperado:</span>
            <span className='text-lg font-semibold text-zinc-800'>
              {formatCurrency(baseExpected, currency)}
            </span>
            <span className='text-xs text-zinc-500'>
              (Calculado del mes anterior)
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='font-medium text-zinc-700'>Total Real:</span>
            <span className='text-lg font-semibold text-green-600'>
              {formatCurrency(
                mode === 'simple'
                  ? parseFloat(simpleForm.watch('realAmount')) || baseReal || 0
                  : totalRealFromSources > 0
                  ? totalRealFromSources
                  : baseReal || 0,
                currency
              )}
            </span>
            <span className='text-xs text-zinc-500'>
              {mode === 'simple'
                ? '(Valor real del usuario)'
                : '(Suma de todas las fuentes)'}
            </span>
          </div>
        </div>

        {/* Modo Simple */}
        {mode === 'simple' && (
          <form
            onSubmit={simpleForm.handleSubmit(handleSaveSimple)}
            className='mb-6 space-y-4'
          >
            <div>
              <label className='block text-sm font-medium mb-2 text-primary-medium'>
                Valor Esperado (Calculado del mes anterior)
              </label>
              <input
                type='number'
                step='0.01'
                value={baseExpected}
                readOnly
                className='w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-100 text-zinc-600'
                placeholder='0.00'
                aria-label='Valor esperado'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2 text-primary-medium'>
                Valor Real *
              </label>
              <input
                type='number'
                step='0.01'
                {...simpleForm.register('realAmount', {
                  required: 'El valor real es requerido',
                  min: {
                    value: 0,
                    message: 'El valor debe ser mayor o igual a 0',
                  },
                })}
                className='w-full px-4 py-2 border border-zinc-200 rounded-lg text-zinc-900 bg-white'
                placeholder='Ingrese el valor real que quedó'
                aria-label='Valor real'
              />
              {simpleForm.formState.errors.realAmount && (
                <p className='text-sm text-red-500 mt-1'>
                  {simpleForm.formState.errors.realAmount.message}
                </p>
              )}
            </div>
            <Button
              type='submit'
              variant='secondary'
              size='md'
              className='w-full'
              disabled={!simpleForm.watch('realAmount')}
            >
              Guardar Valor Neto
            </Button>
          </form>
        )}

        {/* Modo con Fuentes */}
        {mode === 'sources' && (
          <>
            {/* Lista de Fuentes */}
            <div className='mb-6'>
              <h4 className='text-lg font-semibold mb-3 text-primary-dark'>
                Fuentes de Liquidez
              </h4>
              <div className='space-y-3'>
                {sources.map((source: LiquiditySource, index: number) => (
                  <div
                    key={source.id || `source-${index}`}
                    className='p-4 border border-zinc-200 rounded-lg'
                  >
                    {editingSourceId === source.id ? (
                      // Modo edición
                      <form
                        onSubmit={editSourceForm.handleSubmit(handleSaveEdit)}
                        className='space-y-3'
                      >
                        <div className='font-medium text-zinc-800'>
                          {source.name}
                        </div>
                        <div className='text-sm text-zinc-600 mb-2'>
                          <span className='font-medium'>Valor Esperado:</span>{' '}
                          {formatCurrency(source.expectedAmount, currency)}
                        </div>
                        <div>
                          <label className='block text-sm font-medium mb-1 text-primary-medium'>
                            Valor Real *
                          </label>
                          <input
                            type='number'
                            step='0.01'
                            {...editSourceForm.register('realAmount', {
                              required: 'El valor real es requerido',
                              min: {
                                value: 0,
                                message: 'El valor debe ser mayor o igual a 0',
                              },
                            })}
                            className='w-full px-3 py-2 border border-zinc-200 rounded-lg text-zinc-900 bg-white'
                            placeholder='Ingrese el valor real'
                            aria-label='Valor real'
                          />
                          {editSourceForm.formState.errors.realAmount && (
                            <p className='text-xs text-red-500 mt-1'>
                              {
                                editSourceForm.formState.errors.realAmount
                                  .message
                              }
                            </p>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            type='submit'
                            variant='secondary'
                            size='sm'
                            disabled={!editSourceForm.watch('realAmount')}
                            className='flex-1'
                          >
                            Guardar
                          </Button>
                          <Button
                            type='button'
                            onClick={handleCancelEdit}
                            variant='outline'
                            size='sm'
                            className='flex-1'
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      // Modo visualización
                      <div className='flex justify-between items-center'>
                        <div className='flex-1'>
                          <div className='font-medium text-zinc-800'>
                            {source.name}
                          </div>
                          <div className='text-sm text-zinc-600 mt-1 space-y-1'>
                            <div>
                              <span className='font-medium'>
                                Valor Esperado:
                              </span>{' '}
                              {formatCurrency(source.expectedAmount, currency)}
                            </div>
                            {source.realAmount !== null ? (
                              <div>
                                <span className='font-medium'>Valor Real:</span>{' '}
                                {formatCurrency(source.realAmount, currency)}
                              </div>
                            ) : (
                              <div className='text-zinc-400 italic'>
                                Valor Real: No ingresado
                              </div>
                            )}
                          </div>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            onClick={() => handleEditSource(source)}
                            variant='ghost'
                            size='sm'
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
                          {sources.length > 1 && source.id && (
                            <Button
                              onClick={() => {
                                if (source.id) {
                                  handleDeleteSource(source.id);
                                }
                              }}
                              variant='ghost'
                              size='sm'
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
                                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                  />
                                </svg>
                              }
                              iconOnly
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Agregar Fuente */}
            <div className='mb-6 p-4 border border-zinc-200 rounded-lg bg-zinc-50'>
              <h4 className='text-md font-semibold mb-3 text-primary-dark'>
                Agregar Fuente
              </h4>
              <form
                onSubmit={sourceForm.handleSubmit(handleAddSource)}
                className='space-y-3'
              >
                {availableSourceNames.length > 0 && (
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Seleccionar Fuente Existente
                    </label>
                    <select
                      value={selectedSourceName}
                      onChange={(e) => {
                        setSelectedSourceName(e.target.value);
                        const existing = sources.find(
                          (s) => s.name === e.target.value
                        );
                        if (existing) {
                          sourceForm.setValue('sourceName', e.target.value);
                          sourceForm.setValue(
                            'realAmount',
                            existing.realAmount?.toString() || ''
                          );
                        } else {
                          sourceForm.setValue('sourceName', e.target.value);
                          sourceForm.setValue('realAmount', '');
                        }
                      }}
                      className='w-full px-3 py-2 border border-zinc-200 rounded-lg text-zinc-900 bg-white'
                      aria-label='Seleccionar fuente existente'
                    >
                      <option value=''>Seleccione una fuente existente</option>
                      {availableSourceNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    {selectedSourceName
                      ? 'Actualizar Valores'
                      : 'Nombre de Nueva Fuente'}
                  </label>
                  {selectedSourceName ? (
                    <input
                      type='text'
                      value={selectedSourceName}
                      readOnly
                      className='w-full px-3 py-2 border border-zinc-200 rounded-lg bg-zinc-100 text-zinc-600'
                      aria-label='Nombre de la fuente'
                    />
                  ) : (
                    <input
                      type='text'
                      {...sourceForm.register('sourceName', {
                        required:
                          !selectedSourceName && 'El nombre es requerido',
                      })}
                      onChange={(e) => {
                        sourceForm.setValue('sourceName', e.target.value);
                        setSelectedSourceName('');
                      }}
                      className='w-full px-3 py-2 border border-zinc-200 rounded-lg text-zinc-900 bg-white'
                      placeholder='Nombre de la fuente (ej: Efectivo, Banco, etc.)'
                      aria-label='Nombre de la nueva fuente'
                    />
                  )}
                  {sourceForm.formState.errors.sourceName && (
                    <p className='text-xs text-red-500 mt-1'>
                      {sourceForm.formState.errors.sourceName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
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
                    className='w-full px-3 py-2 border border-zinc-200 rounded-lg text-zinc-900 bg-white'
                    placeholder='Ingrese el valor real'
                    aria-label='Valor real'
                  />
                  {sourceForm.formState.errors.realAmount && (
                    <p className='text-xs text-red-500 mt-1'>
                      {sourceForm.formState.errors.realAmount.message}
                    </p>
                  )}
                  {(() => {
                    const sourceName =
                      selectedSourceName || sourceForm.watch('sourceName');
                    const prevSource = previousMonthSources.find(
                      (s) => s.name === sourceName
                    );
                    const expectedValue = prevSource?.realAmount ?? 0;
                    if (sourceName) {
                      return (
                        <p className='text-xs text-zinc-500 mt-1'>
                          Valor esperado:{' '}
                          {formatCurrency(expectedValue, currency)}{' '}
                          {prevSource
                            ? '(del mes anterior)'
                            : '(nueva fuente, sin valor anterior)'}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
                <Button
                  type='submit'
                  variant='secondary'
                  size='md'
                  disabled={
                    !sourceForm.watch('sourceName') ||
                    !sourceForm.watch('realAmount')
                  }
                >
                  {selectedSourceName ? 'Actualizar Fuente' : 'Agregar Fuente'}
                </Button>
              </form>
            </div>
          </>
        )}

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
      </div>
    </div>
  );
};

export default LiquidityModal;
