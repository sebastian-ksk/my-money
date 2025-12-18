'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  loadSavingsSources,
  createSavingsSource,
  updateSavingsSource,
  deleteSavingsSource,
  selectSavingsSources,
  selectConfigLoading,
  selectUserConfig,
} from '@/Redux/features/config-my-money';
import { Button } from '@/components/ui';
import { formatCurrency, parseCurrencyInput } from '@/utils/currency';

export default function SavingsBalanceSection() {
  const dispatch = useAppDispatch();
  const savingsSources = useAppSelector(selectSavingsSources);
  const loading = useAppSelector(selectConfigLoading);
  const userConfig = useAppSelector(selectUserConfig);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
  });

  const currency = userConfig?.currency || 'COP';

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      dispatch(loadSavingsSources(user.uid));
    }
  }, [dispatch]);

  const totalSavings = savingsSources.reduce(
    (sum, source) => sum + source.amount,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = sessionStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    const numericAmount = parseFloat(parseCurrencyInput(formData.amount));

    if (editingId) {
      await dispatch(
        updateSavingsSource({
          sourceId: editingId,
          source: {
            name: formData.name,
            amount: numericAmount,
          },
        })
      );
    } else {
      await dispatch(
        createSavingsSource({
          userId: user.uid,
          source: {
            name: formData.name,
            amount: numericAmount,
          },
        })
      );
    }

    setFormData({
      name: '',
      amount: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (source: {
    id?: string;
    name: string;
    amount: number;
  }) => {
    if (source.id) {
      setEditingId(source.id);
      setFormData({
        name: source.name,
        amount: formatCurrency(source.amount, currency),
      });
      setShowModal(true);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (confirm('¿Está seguro de eliminar esta fuente de ahorro?')) {
      await dispatch(deleteSavingsSource(sourceId));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  return (
    <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h3 className='text-xl font-bold text-primary-dark'>
            Balance en Ahorro
          </h3>
          <p className='text-sm text-zinc-600 mt-1'>
            Dinero reservado que no debe utilizarse para gastos
          </p>
        </div>
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
          Agregar Fuente
        </Button>
      </div>

      {savingsSources.length === 0 ? (
        <p className='text-zinc-600 text-center py-8'>
          No hay fuentes de ahorro configuradas
        </p>
      ) : (
        <div className='space-y-2 mb-4'>
          {savingsSources.map((source) => (
            <div
              key={source.id}
              className='flex justify-between items-center p-4 border border-zinc-200 rounded-lg hover:bg-neutral-light'
            >
              <div className='flex-1'>
                <p className='font-semibold text-primary-dark'>{source.name}</p>
                <p className='text-sm text-zinc-600'>
                  {formatCurrency(source.amount, currency)}
                </p>
              </div>
              <div className='flex gap-2'>
                <Button
                  onClick={() => handleEdit(source)}
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
                  onClick={() => source.id && handleDelete(source.id)}
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
            </div>
          ))}
        </div>
      )}

      {savingsSources.length > 0 && (
        <div className='mt-4 pt-4 border-t border-zinc-200'>
          <div className='flex justify-between items-center'>
            <span className='text-lg font-semibold text-primary-dark'>
              Total Ahorro:
            </span>
            <span className='text-xl font-bold text-primary-medium'>
              {formatCurrency(totalSavings, currency)}
            </span>
          </div>
        </div>
      )}

      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h4 className='text-xl font-bold mb-4 text-primary-dark'>
              {editingId ? 'Editar Fuente' : 'Nueva Fuente de Ahorro'}
            </h4>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Nombre de la Fuente *
                </label>
                <input
                  type='text'
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder='Ej: Cuenta de Ahorro, Fondo de Emergencia, etc.'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2 text-primary-medium'>
                  Monto *
                </label>
                <input
                  type='text'
                  required
                  value={formData.amount}
                  onChange={(e) => {
                    const rawValue = parseCurrencyInput(e.target.value);
                    if (rawValue !== '' || e.target.value === '') {
                      const num = rawValue ? parseFloat(rawValue) : 0;
                      setFormData({
                        ...formData,
                        amount: num > 0 ? formatCurrency(num, currency) : '',
                      });
                    }
                  }}
                  onBlur={(e) => {
                    const rawValue = parseCurrencyInput(e.target.value);
                    if (rawValue) {
                      const num = parseFloat(rawValue);
                      setFormData({
                        ...formData,
                        amount: formatCurrency(num, currency),
                      });
                    }
                  }}
                  className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
                  placeholder={formatCurrency(0, currency)}
                />
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
