'use client';

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useAppSelector } from '@/Redux/store/hooks';
import {
  selectDashboardStats,
  selectDashboardLoading,
} from '@/Redux/features/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  amount: number;
  change?: number;
  icon: React.ElementType;
  variant?: 'default' | 'income' | 'expense' | 'savings';
  loading?: boolean;
}

function StatCard({
  title,
  amount,
  change,
  icon: Icon,
  variant = 'default',
  loading,
}: StatCardProps) {
  const variantStyles = {
    default: 'glass-card',
    income: 'bg-income/10 border-income/20',
    expense: 'bg-expense/10 border-expense/20',
    savings: 'bg-savings/10 border-savings/20',
  };

  const iconColors = {
    default: 'text-primary bg-primary/10',
    income: 'text-income bg-income/20',
    expense: 'text-expense bg-expense/20',
    savings: 'text-savings bg-savings/20',
  };

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-2xl p-6 border transition-all',
          variantStyles[variant]
        )}
      >
        <div className='flex items-start justify-between'>
          <Skeleton className='w-12 h-12 rounded-xl' />
          <Skeleton className='w-16 h-6 rounded-full' />
        </div>
        <div className='mt-4'>
          <Skeleton className='h-4 w-24 mb-2' />
          <Skeleton className='h-8 w-32' />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-6 border transition-all hover:shadow-lg',
        variantStyles[variant]
      )}
    >
      <div className='flex items-start justify-between'>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconColors[variant]
          )}
        >
          <Icon className='w-6 h-6' />
        </div>
        {change !== undefined && change !== 0 && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              change >= 0
                ? 'bg-income/10 text-income'
                : 'bg-expense/10 text-expense'
            )}
          >
            {change >= 0 ? (
              <ArrowUpRight className='w-3 h-3' />
            ) : (
              <ArrowDownRight className='w-3 h-3' />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className='mt-4'>
        <p className='text-sm text-muted-foreground'>{title}</p>
        <p className='text-2xl font-bold mt-1'>{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}

export function StatsCards() {
  const stats = useAppSelector(selectDashboardStats);
  const loading = useAppSelector(selectDashboardLoading);

  return (
    <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      <StatCard
        title='Balance Total'
        amount={stats?.totalBalance ?? 0}
        change={stats?.balanceChange}
        icon={Wallet}
        variant='default'
        loading={loading && !stats}
      />
      <StatCard
        title='Ingresos del Mes'
        amount={stats?.totalIncomes ?? 0}
        change={stats?.incomeChange}
        icon={TrendingUp}
        variant='income'
        loading={loading && !stats}
      />
      <StatCard
        title='Gastos del Mes'
        amount={stats?.totalExpenses ?? 0}
        change={stats?.expenseChange}
        icon={TrendingDown}
        variant='expense'
        loading={loading && !stats}
      />
      <StatCard
        title='Total Ahorrado'
        amount={stats?.totalSavings ?? 0}
        change={stats?.savingsChange}
        icon={PiggyBank}
        variant='savings'
        loading={loading && !stats}
      />
    </div>
  );
}
