'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  loadExpectedIncomes,
  createExpectedIncome,
  updateExpectedIncome,
  deleteExpectedIncome,
  selectExpectedIncomes,
  selectConfigLoading,
  selectUserConfig,
} from '@/Redux/features/config-my-money';
import { Button, useConfirm } from '@/components/ui';
import { formatCurrency } from '@/utils/currency';

export default function ExpectedIncomesSection() {
  const dispatch = useAppDispatch();
  const expectedIncomes = useAppSelector(selectExpectedIncomes);
  const loading = useAppSelector(selectConfigLoading);
  const userConfig = useAppSelector(selectUserConfig);
  const confirm = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dayOfMonth: '',
    appliesToAllMonths: true,
    selectedMonths: [] as number[],
  });

  const monthNames = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  const currency = userConfig?.currency || 'COP';

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      dispatch(loadExpectedIncomes(user.uid));
    }
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = sessionStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    const numericAmount = parseFloat(formData.amount.replace(/[^\d]/g, '')) || 0;
    // Si aplica a todos los meses: undefined (no se incluirá el campo)
    // Si hay meses seleccionados: array con los meses
    // Si no hay meses seleccionados: array vacío []
    const months = formData.appliesToAllMonths
      ? undefined
      : formData.selectedMonths;

    if (editingId) {
      await dispatch(
        updateExpectedIncome({
          incomeId: editingId,
          income: {
            name: formData.name,
            amount: numericAmount,
            dayOfMonth: parseInt(formData.dayOfMonth),
            months,
          },
        })
      );
    } else {
      await dispatch(
        createExpectedIncome({
          userId: user.uid,
          income: {
            name: formData.name,
            amount: numericAmount,
            dayOfMonth: parseInt(formData.dayOfMonth),
            months,
          },
        })
      );
    }

    setFormData({
      name: '',
      amount: '',
      dayOfMonth: '',
      appliesToAllMonths: true,
      selectedMonths: [],
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (income: {
    id?: string;
    name: string;
    amount: number;
    dayOfMonth: number;
    months?: number[];
  }) => {
    if (income.id) {
      setEditingId(income.id);
      setFormData({
        name: income.name,
        amount: income.amount.toString(),
        dayOfMonth: income.dayOfMonth.toString(),
        appliesToAllMonths: !income.months || income.months.length === 0,
        selectedMonths: income.months || [],
      });
      setShowModal(true);
    }
  };

  const handleDelete = async (incomeId: string) => {
    const confirmed = await confirm.showConfirm({
      title: 'Eliminar Ingreso Esperado',
      message: '¿Está seguro de eliminar este ingreso esperado?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;

    await dispatch(deleteExpectedIncome(incomeId));
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
      dayOfMonth: '',
      appliesToAllMonths: true,
      selectedMonths: [],
    });
    setEditingId(null);
    setShowModal(false);
  };

  const totalIncomes = expectedIncomes.reduce(
    (sum, income) => sum + income.amount,
    0
  );

  return (
    <div className='w-full'>
      <div className='flex flex-col sm:flex-row justify-end items-start sm:items-center gap-3 sm:gap-4 mb-4'>
        <Button
          onClick={() => setShowModal(true)}
          variant='secondary'
          size='sm'
          className='w-full sm:w-auto'
          icon={
            <svg
              className='w-4 h-4 sm:w-5 sm:h-5'
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
          <span className='sm:hidden'>Agregar</span>
        </Button>
      </div>

      {expectedIncomes.length === 0 ? (
        <div className='text-center py-8 sm:py-12'>
          <p className='text-zinc-500 text-sm sm:text-base'>
            No hay ingresos esperados configurados
          </p>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b border-zinc-200'>
                <th className='text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-zinc-700'>
                  Nombre
                </th>
                <th className='text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-zinc-700'>
                  Día
                </th>
                <th className='text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-zinc-700'>
                  Meses
                </th>
                <th className='text-right py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-zinc-700'>
                  Monto
                </th>
                <th className='text-center py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-zinc-700 w-24'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {expectedIncomes.map((income) => (
                <tr
                  key={income.id}
                  className='border-b border-zinc-100 hover:bg-zinc-50 transition-colors'
                >
                  <td className='py-3 px-2 sm:px-4'>
                    <p className='font-medium text-sm sm:text-base text-primary-dark'>
                      {income.name}
                    </p>
                  </td>
                  <td className='py-3 px-2 sm:px-4 text-center'>
                    <span className='text-sm sm:text-base text-zinc-600'>
                      {income.dayOfMonth}
                    </span>
                  </td>
                  <td className='py-3 px-2 sm:px-4'>
                    <span className='text-xs sm:text-sm text-zinc-600'>
                      {!income.months || income.months.length === 0
                        ? 'Todos'
                        : income.months
                            .sort((a, b) => a - b)
                            .map((m) => monthNames[m - 1])
                            .join(', ')}
                    </span>
                  </td>
                  <td className='py-3 px-2 sm:px-4 text-right'>
                    <p className='text-sm sm:text-base font-semibold text-zinc-700'>
                      {formatCurrency(income.amount, currency)}
                    </p>
                  </td>
                  <td className='py-3 px-2 sm:px-4'>
                    <div className='flex justify-center gap-1 sm:gap-2'>
                      <Button
                        onClick={() => handleEdit(income)}
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
                      <Button
                        onClick={() => income.id && handleDelete(income.id)}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className='bg-zinc-50 border-t-2 border-zinc-200'>
                <td colSpan={3} className='py-3 px-2 sm:px-4'>
                  <span className='font-semibold text-sm sm:text-base text-primary-dark'>
                    Total
                  </span>
                </td>
                <td className='py-3 px-2 sm:px-4 text-right'>
                  <span className='font-bold text-base sm:text-lg text-primary-medium'>
                    {formatCurrency(totalIncomes, currency)}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h4 className='text-xl font-bold mb-4 text-primary-dark'>
              {editingId ? 'Editar Ingreso Esperado' : 'Nuevo Ingreso Esperado'}
            </h4>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Nombre *
                </label>
                <input
                  type='text'
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='Ej: Salario'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Día del Mes (1-31) *
                </label>
                <input
                  type='number'
                  min='1'
                  max='31'
                  required
                  value={formData.dayOfMonth}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfMonth: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='Ej: 25'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Valor Estimado *
                </label>
                <input
                  type='text'
                  required
                  value={formData.amount}
                  onChange={(e) => {
                    // Permitir solo números
                    const rawValue = e.target.value.replace(/[^\d]/g, '');
                    setFormData({
                      ...formData,
                      amount: rawValue,
                    });
                  }}
                  onBlur={(e) => {
                    const rawValue = e.target.value.replace(/[^\d]/g, '');
                    if (rawValue) {
                      const num = parseFloat(rawValue);
                      if (!isNaN(num) && num > 0) {
                        setFormData({
                          ...formData,
                          amount: formatCurrency(num, currency),
                        });
                      }
                    }
                  }}
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='Ej: 110000'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Meses Aplicables
                </label>
                <div className='space-y-3'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={formData.appliesToAllMonths}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          appliesToAllMonths: e.target.checked,
                          selectedMonths: e.target.checked
                            ? []
                            : formData.selectedMonths,
                        });
                      }}
                      className='w-4 h-4 text-primary-medium rounded focus:ring-primary-light'
                    />
                    <span className='text-sm text-zinc-700'>
                      Aplica a todos los meses
                    </span>
                  </label>

                  {!formData.appliesToAllMonths && (
                    <div className='border border-zinc-200 rounded-lg p-3 bg-zinc-50'>
                      <p className='text-xs text-zinc-600 mb-2'>
                        Selecciona los meses específicos:
                      </p>
                      <div className='grid grid-cols-4 sm:grid-cols-6 gap-2'>
                        {monthNames.map((month, index) => {
                          const monthNumber = index + 1;
                          return (
                            <label
                              key={monthNumber}
                              className='flex items-center gap-1 cursor-pointer'
                            >
                              <input
                                type='checkbox'
                                checked={formData.selectedMonths.includes(
                                  monthNumber
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      selectedMonths: [
                                        ...formData.selectedMonths,
                                        monthNumber,
                                      ],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      selectedMonths:
                                        formData.selectedMonths.filter(
                                          (m) => m !== monthNumber
                                        ),
                                    });
                                  }
                                }}
                                className='w-4 h-4 text-primary-medium rounded focus:ring-primary-light'
                              />
                              <span className='text-xs text-zinc-700'>
                                {month}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex gap-3'>
                <Button
                  type='button'
                  onClick={handleCancel}
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
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
