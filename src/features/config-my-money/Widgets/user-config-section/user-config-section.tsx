'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import {
  loadUserConfig,
  saveUserConfig,
  selectUserConfig,
  selectConfigLoading,
} from '@/Redux/features/config-my-money';
import { selectUser } from '@/Redux/features/auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENCIES } from '@/utils/currency';

const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function UserConfigSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userConfig = useAppSelector(selectUserConfig);
  const loading = useAppSelector(selectConfigLoading);
  const [formData, setFormData] = useState({
    monthResetDay: 1,
    currency: 'COP',
  });

  useEffect(() => {
    if (user?.uid) {
      dispatch(loadUserConfig(user.uid));
    }
  }, [dispatch, user?.uid]);

  useEffect(() => {
    if (userConfig) {
      setFormData({
        monthResetDay: userConfig.monthResetDay,
        currency: userConfig.currency || 'COP',
      });
    }
  }, [userConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    await dispatch(
      saveUserConfig({
        userId: user.uid,
        config: formData,
      })
    );
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid sm:grid-cols-2 gap-6'>
        <div className='space-y-2' data-tour='config-general'>
          <Label htmlFor='cutoff'>Día de Corte Mensual</Label>
          <Select
            value={formData.monthResetDay.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, monthResetDay: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day} value={day.toString()}>
                  Día {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-xs text-muted-foreground'>
            El día en que inicia tu período mensual
          </p>
        </div>

        <div className='space-y-2' data-tour='config-currency'>
          <Label htmlFor='currency'>Moneda</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) =>
              setFormData({ ...formData, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code, currency]) => (
                <SelectItem key={code} value={code}>
                  {currency.name} ({currency.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-xs text-muted-foreground'>
            Moneda para mostrar los valores
          </p>
        </div>
      </div>

      <Button variant='hero' type='submit' disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </form>
  );
}
