'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  loadFixedExpenses,
  loadExpenseCategories,
  createFixedExpense,
  updateFixedExpense,
  deleteFixedExpense,
  selectFixedExpenses,
  selectExpenseCategories,
  selectConfigLoading,
  selectUserConfig,
} from '@/Redux/features/config-my-money';
import { Button, useConfirm } from '@/components/ui';
import { formatCurrency } from '@/utils/currency';

export default function FixedExpensesSection() {
  const dispatch = useAppDispatch();
  const fixedExpenses = useAppSelector(selectFixedExpenses);
  const categories = useAppSelector(selectExpenseCategories);
  const loading = useAppSelector(selectConfigLoading);
  const userConfig = useAppSelector(selectUserConfig);
  const confirm = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dayOfMonth: '',
    categoryId: '',
    categoryName: '',
    appliesToAllMonths: true,
    selectedMonths: [] as number[],
  });

  const currency = userConfig?.currency || 'COP';

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

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      dispatch(loadFixedExpenses(user.uid));
      dispatch(loadExpenseCategories(user.uid));
    }
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = sessionStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    let categoryId = formData.categoryId;

    // Si no hay categoryId pero hay categoryName, crear la categoría
    if (!categoryId && formData.categoryName.trim()) {
      const { createExpenseCategory } = await import(
        '@/Redux/features/config-my-money'
      );
      const categoryResult = await dispatch(
        createExpenseCategory({
          userId: user.uid,
          name: formData.categoryName.trim(),
        })
      );
      if (createExpenseCategory.fulfilled.match(categoryResult)) {
        categoryId = categoryResult.payload.id || '';
      } else {
        console.error('Error al crear la categoría', categoryResult);
        return;
      }
    }

    if (!categoryId) {
      console.error('Debe seleccionar o crear una categoría');
      return;
    }

    const numericAmount = parseFloat(formData.amount.replace(/[^\d]/g, '')) || 0;
    if (numericAmount <= 0) {
      console.error('El monto debe ser mayor a 0');
      return;
    }

    const dayOfMonth = parseInt(formData.dayOfMonth);
    if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      console.error('El día del mes debe ser un número entre 1 y 31');
      return;
    }

    // Si aplica a todos los meses: undefined (no se incluirá el campo)
    // Si hay meses seleccionados: array con los meses
    // Si no hay meses seleccionados: array vacío []
    const months = formData.appliesToAllMonths
      ? undefined
      : formData.selectedMonths;

    try {
      let result;
      if (editingId) {
        result = await dispatch(
          updateFixedExpense({
            expenseId: editingId,
            expense: {
              name: formData.name,
              amount: numericAmount,
              dayOfMonth,
              categoryId,
              months,
            },
          })
        );
      } else {
        result = await dispatch(
          createFixedExpense({
            userId: user.uid,
            expense: {
              name: formData.name,
              amount: numericAmount,
              dayOfMonth,
              categoryId,
              months,
            },
          })
        );
      }

      // Verificar si la acción fue exitosa
      if (createFixedExpense.fulfilled.match(result) || updateFixedExpense.fulfilled.match(result)) {
        // Recargar todos los gastos fijos
        await dispatch(loadFixedExpenses(user.uid));

        setFormData({
          name: '',
          amount: '',
          dayOfMonth: '',
          categoryId: '',
          categoryName: '',
          appliesToAllMonths: true,
          selectedMonths: [],
        });
        setEditingId(null);
        setShowModal(false);
      } else {
        console.error('Error al guardar el gasto fijo', result);
      }
    } catch (error: any) {
      console.error('Error al guardar gasto fijo:', error);
    }
  };

  const handleEdit = (expense: {
    id?: string;
    name: string;
    amount: number;
    dayOfMonth: number;
    categoryId: string;
    months?: number[];
  }) => {
    if (expense.id) {
      setEditingId(expense.id);
      setFormData({
        name: expense.name,
        amount: expense.amount.toString(),
        dayOfMonth: expense.dayOfMonth.toString(),
        categoryId: expense.categoryId,
        categoryName: '',
        appliesToAllMonths: !expense.months || expense.months.length === 0,
        selectedMonths: expense.months || [],
      });
      setShowModal(true);
    }
  };

  const handleDelete = async (expenseId: string) => {
    const confirmed = await confirm.showConfirm({
      title: 'Eliminar Gasto Fijo',
      message: '¿Está seguro de eliminar este gasto fijo?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;

    await dispatch(deleteFixedExpense(expenseId));
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      await dispatch(loadFixedExpenses(user.uid));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
      dayOfMonth: '',
      categoryId: '',
      categoryName: '',
      appliesToAllMonths: true,
      selectedMonths: [],
    });
    setEditingId(null);
    setShowModal(false);
  };

  const totalExpenses = fixedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
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
          <span className='hidden sm:inline'>Agregar Gasto Fijo</span>
          <span className='sm:hidden'>Agregar</span>
        </Button>
      </div>

      {fixedExpenses.length === 0 ? (
        <div className='text-center py-8 sm:py-12'>
          <p className='text-zinc-500 text-sm sm:text-base'>
            No hay gastos fijos configurados
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
                  Categoría
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
              {fixedExpenses.map((expense) => {
                const category = categories.find(
                  (c) => c.id === expense.categoryId
                );
                return (
                  <tr
                    key={expense.id}
                    className='border-b border-zinc-100 hover:bg-zinc-50 transition-colors'
                  >
                    <td className='py-3 px-2 sm:px-4'>
                      <p className='font-medium text-sm sm:text-base text-primary-dark'>
                        {expense.name}
                      </p>
                    </td>
                    <td className='py-3 px-2 sm:px-4 text-center'>
                      <span className='text-sm sm:text-base text-zinc-600'>
                        {expense.dayOfMonth}
                      </span>
                    </td>
                    <td className='py-3 px-2 sm:px-4'>
                      <span className='text-xs sm:text-sm text-zinc-600 bg-zinc-100 px-2 py-1 rounded'>
                        {category?.name || 'Sin categoría'}
                      </span>
                    </td>
                    <td className='py-3 px-2 sm:px-4'>
                      <span className='text-xs sm:text-sm text-zinc-600'>
                        {!expense.months || expense.months.length === 0
                          ? 'Todos'
                          : expense.months
                              .sort((a, b) => a - b)
                              .map((m) => monthNames[m - 1])
                              .join(', ')}
                      </span>
                    </td>
                    <td className='py-3 px-2 sm:px-4 text-right'>
                      <p className='text-sm sm:text-base font-semibold text-zinc-700'>
                        {formatCurrency(expense.amount, currency)}
                      </p>
                    </td>
                    <td className='py-3 px-2 sm:px-4'>
                      <div className='flex justify-center gap-1 sm:gap-2'>
                        <Button
                          onClick={() => handleEdit(expense)}
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
                          onClick={() => expense.id && handleDelete(expense.id)}
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
                );
              })}
            </tbody>
            <tfoot>
              <tr className='bg-zinc-50 border-t-2 border-zinc-200'>
                <td colSpan={4} className='py-3 px-2 sm:px-4'>
                  <span className='font-semibold text-sm sm:text-base text-primary-dark'>
                    Total
                  </span>
                </td>
                <td className='py-3 px-2 sm:px-4 text-right'>
                  <span className='font-bold text-base sm:text-lg text-primary-medium'>
                    {formatCurrency(totalExpenses, currency)}
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
              {editingId ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}
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
                  placeholder='Ej: Arriendo'
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
                  placeholder='Ej: 10'
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
                  Categoría
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: e.target.value,
                      categoryName: '',
                    })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white mb-2'
                >
                  <option value=''>Seleccionar categoría existente</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className='text-xs text-zinc-600 mb-2'>O crear nueva:</p>
                <input
                  type='text'
                  value={formData.categoryName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryName: e.target.value,
                      categoryId: '',
                    })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='Nombre de nueva categoría'
                  disabled={!!formData.categoryId}
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
