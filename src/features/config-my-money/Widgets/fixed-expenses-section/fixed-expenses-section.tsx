'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  loadFixedExpenses,
  loadExpenseCategories,
  createFixedExpense,
  deleteFixedExpense,
  selectFixedExpenses,
  selectExpenseCategories,
  selectConfigLoading,
} from '@/Redux/features/config-my-money';
import { Button } from '@/components/ui';

export default function FixedExpensesSection() {
  const dispatch = useAppDispatch();
  const fixedExpenses = useAppSelector(selectFixedExpenses);
  const categories = useAppSelector(selectExpenseCategories);
  const loading = useAppSelector(selectConfigLoading);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dayOfMonth: '',
    categoryId: '',
    categoryName: '',
  });

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
      }
    }

    if (!categoryId) {
      alert('Debe seleccionar o crear una categoría');
      return;
    }

    await dispatch(
      createFixedExpense({
        userId: user.uid,
        expense: {
          name: formData.name,
          amount: parseFloat(formData.amount),
          dayOfMonth: parseInt(formData.dayOfMonth),
          categoryId,
        },
      })
    );

    setFormData({
      name: '',
      amount: '',
      dayOfMonth: '',
      categoryId: '',
      categoryName: '',
    });
    setShowModal(false);
  };

  const handleDelete = async (expenseId: string) => {
    if (confirm('¿Está seguro de eliminar este gasto fijo?')) {
      await dispatch(deleteFixedExpense(expenseId));
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-xl font-bold text-primary-dark'>Gastos Fijos</h3>
        <Button
          onClick={() => setShowModal(true)}
          variant='secondary'
          size='md'
          icon={
            <svg
              className='w-5 h-5'
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
          Agregar Gasto Fijo
        </Button>
      </div>

      {fixedExpenses.length === 0 ? (
        <p className='text-zinc-600 text-center py-8'>
          No hay gastos fijos configurados
        </p>
      ) : (
        <div className='space-y-2'>
          {fixedExpenses.map((expense) => {
            const category = categories.find(
              (c) => c.id === expense.categoryId
            );
            return (
              <div
                key={expense.id}
                className='flex justify-between items-center p-4 border border-zinc-200 rounded-lg hover:bg-neutral-light'
              >
                <div>
                  <p className='font-semibold text-primary-dark'>
                    {expense.name}
                  </p>
                  <p className='text-sm text-zinc-600'>
                    Día {expense.dayOfMonth} -{' '}
                    {category?.name || 'Sin categoría'} - $
                    {expense.amount.toLocaleString()}
                  </p>
                </div>
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
            );
          })}
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h4 className='text-xl font-bold mb-4 text-primary-dark'>
              Nuevo Gasto Fijo
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
                  type='number'
                  step='0.01'
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='0.00'
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

              <div className='flex gap-3'>
                <Button
                  type='button'
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      name: '',
                      amount: '',
                      dayOfMonth: '',
                      categoryId: '',
                      categoryName: '',
                    });
                  }}
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
