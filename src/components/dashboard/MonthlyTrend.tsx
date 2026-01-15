'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppSelector } from '@/Redux/store/hooks';
import {
  selectMonthlyTrend,
  selectDashboardLoading,
} from '@/Redux/features/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(value);
};

export function MonthlyTrend() {
  const monthlyTrend = useAppSelector(selectMonthlyTrend);
  const loading = useAppSelector(selectDashboardLoading);

  const hasData = monthlyTrend.length > 0;

  if (loading && monthlyTrend.length === 0) {
    return (
      <div className='glass-card rounded-2xl p-6'>
        <Skeleton className='h-6 w-40 mb-6' />
        <div className='h-[300px]'>
          <Skeleton className='w-full h-full rounded-xl' />
        </div>
      </div>
    );
  }

  return (
    <div className='glass-card rounded-2xl p-6'>
      <h3 className='text-lg font-semibold mb-6'>Tendencia Mensual</h3>
      <div className='h-[300px]'>
        {!hasData ? (
          <div className='h-full flex items-center justify-center'>
            <p className='text-muted-foreground'>No hay datos para mostrar</p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id='colorIngresos' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='hsl(160, 84%, 39%)'
                    stopOpacity={0.3}
                  />
                  <stop
                    offset='95%'
                    stopColor='hsl(160, 84%, 39%)'
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id='colorGastos' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='hsl(0, 72%, 51%)'
                    stopOpacity={0.3}
                  />
                  <stop
                    offset='95%'
                    stopColor='hsl(0, 72%, 51%)'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='hsl(var(--border))'
              />
              <XAxis
                dataKey='month'
                stroke='hsl(var(--muted-foreground))'
                fontSize={12}
              />
              <YAxis
                tickFormatter={formatCurrency}
                stroke='hsl(var(--muted-foreground))'
                fontSize={12}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                }}
              />
              <Area
                type='monotone'
                dataKey='ingresos'
                stroke='hsl(160, 84%, 39%)'
                strokeWidth={2}
                fillOpacity={1}
                fill='url(#colorIngresos)'
                name='Ingresos'
              />
              <Area
                type='monotone'
                dataKey='gastos'
                stroke='hsl(0, 72%, 51%)'
                strokeWidth={2}
                fillOpacity={1}
                fill='url(#colorGastos)'
                name='Gastos'
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
