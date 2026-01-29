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
import { selectUser } from '@/Redux/features/auth';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/confirm-modal';
import { formatCurrency } from '@/utils/currency';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function FixedExpensesSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
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
    if (user?.uid) {
      dispatch(loadFixedExpenses(user.uid));
      dispatch(loadExpenseCategories(user.uid));
    }
  }, [dispatch, user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

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
    if (user?.uid) {
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
    <div className='space-y-6'>
      <div className='flex items-start justify-between'>
        <div>
          <h3 className='text-xl font-semibold mb-2'>Gastos Fijos</h3>
          <p className='text-muted-foreground'>
            Gastos recurrentes mensuales como servicios y suscripciones.
          </p>
        </div>
        <Button variant='expense' onClick={() => setShowModal(true)}>
          <Plus className='w-4 h-4 mr-2' />
          Agregar
        </Button>
      </div>

      {fixedExpenses.length === 0 ? (
        <div className='text-center py-12 text-muted-foreground'>
          <p>No hay gastos fijos configurados</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {fixedExpenses.map((expense) => {
            const category = categories.find(
              (c) => c.id === expense.categoryId
            );
            return (
              <div
                key={expense.id}
                className='flex items-center gap-4 p-4 rounded-xl bg-muted/50 group hover:bg-muted transition-colors'
              >
                <div className='flex-1'>
                  <p className='font-medium'>{expense.name}</p>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground flex-wrap'>
                    <span>{formatCurrency(expense.amount, currency)}</span>
                    <span>•</span>
                    <span>Día {expense.dayOfMonth}</span>
                    {category && (
                      <>
                        <span>•</span>
                        <span className='px-2 py-0.5 bg-muted rounded text-xs'>
                          {category.name}
                        </span>
                      </>
                    )}
                    {expense.months && expense.months.length > 0 && (
                      <>
                        <span>•</span>
                        <span className='text-xs'>
                          {[...expense.months]
                            .sort((a, b) => a - b)
                            .map((m) => monthNames[m - 1])
                            .join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleEdit(expense)}
                  >
                    <Edit2 className='w-4 h-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => expense.id && handleDelete(expense.id)}
                  >
                    <Trash2 className='w-4 h-4 text-destructive' />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div className='flex items-center justify-between p-4 rounded-xl bg-expense/10 border border-expense/20'>
            <span className='font-semibold'>Total Gastos Fijos</span>
            <span className='font-bold text-lg text-expense'>
              {formatCurrency(totalExpenses, currency)}
            </span>
          </div>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-background rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto'>
            <h4 className='text-xl font-bold mb-4'>
              {editingId ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}
            </h4>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Nombre *</label>
                <input
                  type='text'
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  placeholder='Ej: Arriendo'
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Día del Mes *</label>
                  <input
                    type='number'
                    min='1'
                    max='31'
                    required
                    value={formData.dayOfMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, dayOfMonth: e.target.value })
                    }
                    className='w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                    placeholder='Ej: 10'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Monto *</label>
                  <input
                    type='text'
                    required
                    value={formData.amount}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, '');
                      setFormData({ ...formData, amount: rawValue });
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
                    className='w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                    placeholder='Ej: 110000'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Categoría</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: e.target.value,
                      categoryName: '',
                    })
                  }
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <option value=''>Seleccionar categoría existente</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className='text-xs text-muted-foreground'>O crear nueva:</p>
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
                  className='w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  placeholder='Nombre de nueva categoría'
                  disabled={!!formData.categoryId}
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Meses Aplicables</label>
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
                    className='w-4 h-4 rounded'
                  />
                  <span className='text-sm'>Aplica a todos los meses</span>
                </label>

                {!formData.appliesToAllMonths && (
                  <div className='border border-input rounded-lg p-3 bg-muted/50'>
                    <p className='text-xs text-muted-foreground mb-2'>
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
                              className='w-4 h-4 rounded'
                            />
                            <span className='text-xs'>{month}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className='flex gap-3 pt-2'>
                <Button
                  type='button'
                  onClick={handleCancel}
                  variant='outline'
                  className='flex-1'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  variant='expense'
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
