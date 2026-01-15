'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/Redux/store/hooks';
import {
  selectExpenseDistribution,
  selectDashboardLoading,
} from '@/Redux/features/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

// Datos de ejemplo cuando no hay datos reales
const fallbackData = [
  { name: 'Sin datos', value: 1, color: 'hsl(var(--muted))' },
];

export function ExpenseChart() {
  const expenseDistribution = useAppSelector(selectExpenseDistribution);
  const loading = useAppSelector(selectDashboardLoading);

  const data =
    expenseDistribution.length > 0 ? expenseDistribution : fallbackData;
  const hasData = expenseDistribution.length > 0;

  if (loading && expenseDistribution.length === 0) {
    return (
      <div className='glass-card rounded-2xl p-6'>
        <Skeleton className='h-6 w-48 mb-6' />
        <div className='h-[300px] flex items-center justify-center'>
          <Skeleton className='w-48 h-48 rounded-full' />
        </div>
      </div>
    );
  }

  return (
    <div className='glass-card rounded-2xl p-6'>
      <h3 className='text-lg font-semibold mb-6'>Distribución de Gastos</h3>
      <div className='h-[300px]'>
        {!hasData ? (
          <div className='h-full flex items-center justify-center'>
            <p className='text-muted-foreground'>No hay gastos registrados</p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey='value'
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                }}
              />
              <Legend
                verticalAlign='bottom'
                height={36}
                formatter={(value) => (
                  <span className='text-sm text-foreground'>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
