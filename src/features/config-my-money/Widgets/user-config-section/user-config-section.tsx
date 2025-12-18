'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  loadUserConfig,
  saveUserConfig,
  selectUserConfig,
  selectConfigLoading,
} from '@/Redux/features/config-my-money';
import { Button } from '@/components/ui';

export default function UserConfigSection() {
  const dispatch = useAppDispatch();
  const userConfig = useAppSelector(selectUserConfig);
  const loading = useAppSelector(selectConfigLoading);
  const [formData, setFormData] = useState({
    monthResetDay: 1,
    initialBalance: 0,
    initialSavings: 0,
  });

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      dispatch(loadUserConfig(user.uid));
    }
  }, [dispatch]);

  useEffect(() => {
    if (userConfig) {
      setFormData({
        monthResetDay: userConfig.monthResetDay,
        initialBalance: userConfig.initialBalance,
        initialSavings: userConfig.initialSavings,
      });
    }
  }, [userConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = sessionStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    await dispatch(
      saveUserConfig({
        userId: user.uid,
        config: formData,
      })
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium mb-2 text-primary-medium'>
            Día de Reinicio del Mes (1-31)
          </label>
          <input
            type='number'
            min='1'
            max='31'
            required
            value={formData.monthResetDay}
            onChange={(e) =>
              setFormData({
                ...formData,
                monthResetDay: parseInt(e.target.value) || 1,
              })
            }
            className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
            placeholder='Ej: 25'
          />
          <p className='text-xs text-zinc-600 mt-1'>
            El mes se reiniciará este día cada mes
          </p>
        </div>

        <div>
          <label className='block text-sm font-medium mb-2 text-primary-medium'>
            Saldo Inicial en Banco
          </label>
          <input
            type='number'
            step='0.01'
            required
            value={formData.initialBalance}
            onChange={(e) =>
              setFormData({
                ...formData,
                initialBalance: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
            placeholder='0.00'
          />
        </div>

        <div>
          <label className='block text-sm font-medium mb-2 text-primary-medium'>
            Saldo Inicial en Ahorros
          </label>
          <input
            type='number'
            step='0.01'
            required
            value={formData.initialSavings}
            onChange={(e) =>
              setFormData({
                ...formData,
                initialSavings: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light text-black bg-white'
            placeholder='0.00'
          />
        </div>

        <Button type='submit' variant='primary' size='md' disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </form>
    </div>
  );
}
