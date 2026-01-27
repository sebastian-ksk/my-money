'use client';

import { useEffect } from 'react';
import {
  PieChart as PieChartIcon,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import { selectUser } from '@/Redux/features/auth';
import { selectUserConfig } from '@/Redux/features/config-my-money';
import {
  loadCompleteDashboard,
  setSelectedPeriod,
  selectSelectedPeriod,
  selectDashboardLoading,
  selectFinancialStats,
  selectMonthlyFinancialData,
  selectGlobalSummary,
  selectCurrentMonthData,
  selectExpensesByCategory,
  selectIncomesByCategory,
  selectTransactionsByPaymentMethod,
  selectTotalSavingsBalance,
  selectSavingsSources,
  type PeriodFilter,
} from '@/Redux/features/dashboard';
import { formatCurrency, cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Colores para gráficos
const COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(43, 96%, 56%)',
  'hsl(217, 91%, 60%)',
  'hsl(280, 70%, 60%)',
  'hsl(340, 80%, 55%)',
  'hsl(200, 50%, 50%)',
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userConfig = useAppSelector(selectUserConfig);
  const selectedPeriod = useAppSelector(selectSelectedPeriod);
  const loading = useAppSelector(selectDashboardLoading);
  const financialStats = useAppSelector(selectFinancialStats);
  const monthlyData = useAppSelector(selectMonthlyFinancialData);
  const globalSummary = useAppSelector(selectGlobalSummary);
  const currentMonth = useAppSelector(selectCurrentMonthData);
  const expensesByCategory = useAppSelector(selectExpensesByCategory);
  const incomesByCategory = useAppSelector(selectIncomesByCategory);
  const transactionsByPaymentMethod = useAppSelector(selectTransactionsByPaymentMethod);
  const totalSavingsBalance = useAppSelector(selectTotalSavingsBalance);
  const savingsSources = useAppSelector(selectSavingsSources);

  useEffect(() => {
    if (user?.uid && userConfig?.monthResetDay) {
      dispatch(
        loadCompleteDashboard({
          userId: user.uid,
          period: selectedPeriod,
          monthResetDay: userConfig.monthResetDay,
        })
      );
    }
  }, [dispatch, user?.uid, userConfig?.monthResetDay, selectedPeriod]);

  const handlePeriodChange = (value: string) => {
    dispatch(setSelectedPeriod(value as PeriodFilter));
  };

  // Preparar datos para el gráfico de barras comparativo
  const chartData = monthlyData.map((m) => ({
    name: m.monthName,
    ingresos: m.totalIncomes,
    gastos: m.totalExpenses,
    balance: m.netBalance,
  }));

  // Preparar datos para el pie chart de distribución
  const distributionData = [
    { name: 'Gastos', value: financialStats?.totalExpenses || 0, color: COLORS[4] },
    { name: 'Ahorros', value: financialStats?.totalSavings || 0, color: COLORS[0] },
    {
      name: 'Disponible',
      value: Math.max(0, (financialStats?.netBalance || 0) - (financialStats?.totalSavings || 0)),
      color: COLORS[2],
    },
  ].filter((d) => d.value > 0);

  return (
    <div className='container mx-auto px-4 py-8 space-y-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shadow-gold'>
            <PieChartIcon className='w-6 h-6 text-secondary-foreground' />
          </div>
          <div>
            <h1 className='text-3xl font-bold'>Dashboard Financiero</h1>
            <p className='text-muted-foreground'>
              Vista global de tus finanzas
            </p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-muted-foreground' />
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Período' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='1m'>Último mes</SelectItem>
                <SelectItem value='3m'>3 meses</SelectItem>
                <SelectItem value='6m'>6 meses</SelectItem>
                <SelectItem value='1y'>1 año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant='outline'>
            <Download className='w-4 h-4 mr-2' />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards Principales */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-5 gap-4'>
        <StatCard
          title='Total Ingresos'
          amount={financialStats?.totalIncome || 0}
          change={financialStats?.incomeChange}
          icon={TrendingUp}
          variant='income'
          loading={loading && !financialStats}
        />
        <StatCard
          title='Total Gastos'
          amount={financialStats?.totalExpenses || 0}
          change={financialStats?.expenseChange}
          icon={TrendingDown}
          variant='expense'
          loading={loading && !financialStats}
        />
        <StatCard
          title='Balance Neto'
          amount={financialStats?.netBalance || 0}
          change={financialStats?.balanceChange}
          icon={Wallet}
          variant='default'
          loading={loading && !financialStats}
        />
        <StatCard
          title='Ahorrado (Periodo)'
          amount={financialStats?.totalSavings || 0}
          change={financialStats?.savingsChange}
          icon={PiggyBank}
          variant='savings'
          loading={loading && !financialStats}
        />
        <StatCard
          title='Total en Ahorros'
          amount={totalSavingsBalance}
          icon={PiggyBank}
          variant='savings'
          loading={loading && !financialStats}
          subtitle={`${savingsSources.length} fuente${savingsSources.length !== 1 ? 's' : ''}`}
        />
      </div>

      {/* Promedios y Tasas */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <MetricCard
          title='Promedio Mensual Ingresos'
          value={formatCurrency(financialStats?.averageMonthlyIncome || 0)}
          icon={<BarChart3 className='w-5 h-5' />}
          loading={loading && !financialStats}
        />
        <MetricCard
          title='Promedio Mensual Gastos'
          value={formatCurrency(financialStats?.averageMonthlyExpenses || 0)}
          icon={<BarChart3 className='w-5 h-5' />}
          loading={loading && !financialStats}
        />
        <MetricCard
          title='Tasa de Ahorro'
          value={`${financialStats?.savingsRate || 0}%`}
          subtitle='del ingreso total'
          icon={<Target className='w-5 h-5' />}
          highlight={(financialStats?.savingsRate ?? 0) >= 20}
          loading={loading && !financialStats}
        />
        <MetricCard
          title='Tasa de Gasto'
          value={`${financialStats?.expenseRate || 0}%`}
          subtitle='del ingreso total'
          icon={<Target className='w-5 h-5' />}
          loading={loading && !financialStats}
        />
      </div>

      {/* Gráficos principales */}
      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Tendencia Mensual */}
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>Tendencia Mensual</h3>
          <div className='h-[300px]'>
            {loading && monthlyData.length === 0 ? (
              <Skeleton className='w-full h-full rounded-xl' />
            ) : monthlyData.length === 0 ? (
              <div className='h-full flex items-center justify-center'>
                <p className='text-muted-foreground'>No hay datos para mostrar</p>
              </div>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id='colorIngresos' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor={COLORS[0]} stopOpacity={0.3} />
                      <stop offset='95%' stopColor={COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id='colorGastos' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor={COLORS[4]} stopOpacity={0.3} />
                      <stop offset='95%' stopColor={COLORS[4]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                  <XAxis dataKey='name' stroke='hsl(var(--muted-foreground))' fontSize={12} />
                  <YAxis
                    tickFormatter={(v) => formatCompact(v)}
                    stroke='hsl(var(--muted-foreground))'
                    fontSize={12}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Area
                    type='monotone'
                    dataKey='ingresos'
                    stroke={COLORS[0]}
                    strokeWidth={2}
                    fill='url(#colorIngresos)'
                    name='Ingresos'
                  />
                  <Area
                    type='monotone'
                    dataKey='gastos'
                    stroke={COLORS[4]}
                    strokeWidth={2}
                    fill='url(#colorGastos)'
                    name='Gastos'
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribución */}
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>Distribución del Ingreso</h3>
          <div className='h-[300px]'>
            {loading && distributionData.length === 0 ? (
              <div className='h-full flex items-center justify-center'>
                <Skeleton className='w-48 h-48 rounded-full' />
              </div>
            ) : distributionData.length === 0 ? (
              <div className='h-full flex items-center justify-center'>
                <p className='text-muted-foreground'>No hay datos</p>
              </div>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey='value'
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.75rem',
                    }}
                  />
                  <Legend
                    verticalAlign='bottom'
                    formatter={(value) => <span className='text-sm'>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Balance por mes */}
      <div className='glass-card rounded-2xl p-6'>
        <h3 className='text-lg font-semibold mb-6'>Balance por Mes</h3>
        <div className='h-[300px]'>
          {loading && monthlyData.length === 0 ? (
            <Skeleton className='w-full h-full rounded-xl' />
          ) : monthlyData.length === 0 ? (
            <div className='h-full flex items-center justify-center'>
              <p className='text-muted-foreground'>No hay datos</p>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                <XAxis dataKey='name' stroke='hsl(var(--muted-foreground))' fontSize={12} />
                <YAxis
                  tickFormatter={(v) => formatCompact(v)}
                  stroke='hsl(var(--muted-foreground))'
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Legend />
                <Bar dataKey='ingresos' fill={COLORS[0]} name='Ingresos' radius={[4, 4, 0, 0]} />
                <Bar dataKey='gastos' fill={COLORS[4]} name='Gastos' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Resumen Global e Histórico */}
      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Mejor y Peor Mes */}
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>Mejor y Peor Mes</h3>
          {loading && !globalSummary ? (
            <div className='space-y-4'>
              <Skeleton className='h-20 w-full' />
              <Skeleton className='h-20 w-full' />
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='flex items-center gap-4 p-4 rounded-xl bg-income/10 border border-income/20'>
                <div className='w-12 h-12 rounded-xl bg-income/20 flex items-center justify-center'>
                  <Award className='w-6 h-6 text-income' />
                </div>
                <div className='flex-1'>
                  <p className='text-sm text-muted-foreground'>Mejor Mes</p>
                  <p className='text-lg font-bold'>
                    {globalSummary?.bestMonth?.period || 'N/A'}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-bold text-income'>
                    {formatCurrency(globalSummary?.bestMonth?.balance || 0)}
                  </p>
                  <p className='text-sm text-muted-foreground'>balance</p>
                </div>
              </div>

              <div className='flex items-center gap-4 p-4 rounded-xl bg-expense/10 border border-expense/20'>
                <div className='w-12 h-12 rounded-xl bg-expense/20 flex items-center justify-center'>
                  <AlertTriangle className='w-6 h-6 text-expense' />
                </div>
                <div className='flex-1'>
                  <p className='text-sm text-muted-foreground'>Peor Mes</p>
                  <p className='text-lg font-bold'>
                    {globalSummary?.worstMonth?.period || 'N/A'}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-bold text-expense'>
                    {formatCurrency(globalSummary?.worstMonth?.balance || 0)}
                  </p>
                  <p className='text-sm text-muted-foreground'>balance</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tendencias Globales */}
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>Tendencias (vs 3 meses anteriores)</h3>
          {loading && !globalSummary ? (
            <div className='space-y-4'>
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
            </div>
          ) : (
            <div className='space-y-4'>
              <TrendItem
                label='Tendencia de Ingresos'
                value={globalSummary?.incomeTrend || 0}
              />
              <TrendItem
                label='Tendencia de Gastos'
                value={globalSummary?.expenseTrend || 0}
                inverse
              />
              <TrendItem
                label='Tendencia de Ahorros'
                value={globalSummary?.savingsTrend || 0}
              />
            </div>
          )}
        </div>
      </div>

      {/* Resumen del Periodo */}
      <div className='glass-card rounded-2xl p-6'>
        <h3 className='text-lg font-semibold mb-6'>Resumen Histórico Global</h3>
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          <SummaryCard
            title='Total Histórico Ingresos'
            value={formatCurrency(globalSummary?.totalHistoricalIncome || 0)}
            loading={loading && !globalSummary}
          />
          <SummaryCard
            title='Total Histórico Gastos'
            value={formatCurrency(globalSummary?.totalHistoricalExpenses || 0)}
            loading={loading && !globalSummary}
          />
          <SummaryCard
            title='Total Histórico Ahorros'
            value={formatCurrency(globalSummary?.totalHistoricalSavings || 0)}
            loading={loading && !globalSummary}
          />
          <SummaryCard
            title='Balance Histórico'
            value={formatCurrency(globalSummary?.totalHistoricalBalance || 0)}
            highlight
            loading={loading && !globalSummary}
          />
        </div>
        <div className='mt-6 pt-6 border-t border-border grid sm:grid-cols-3 gap-6'>
          <div className='text-center'>
            <p className='text-3xl font-bold text-gradient'>
              {globalSummary?.totalMonths || 0}
            </p>
            <p className='text-muted-foreground'>Meses registrados</p>
          </div>
          <div className='text-center'>
            <p className='text-3xl font-bold text-gradient'>
              {formatCurrency(globalSummary?.averageMonthlyIncome || 0)}
            </p>
            <p className='text-muted-foreground'>Promedio ingreso/mes</p>
          </div>
          <div className='text-center'>
            <p className='text-3xl font-bold text-gradient-gold'>
              {globalSummary?.averageSavingsRate || 0}%
            </p>
            <p className='text-muted-foreground'>Tasa ahorro promedio</p>
          </div>
        </div>
      </div>

      {/* Mes Actual */}
      {currentMonth && (
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>
            Mes Actual: {currentMonth.monthName} {currentMonth.year}
          </h3>
          <div className='grid sm:grid-cols-2 lg:grid-cols-5 gap-4'>
            <div className='text-center p-4 rounded-xl bg-muted/50'>
              <p className='text-2xl font-bold'>{formatCurrency(currentMonth.totalIncomes)}</p>
              <p className='text-sm text-muted-foreground'>Ingresos</p>
            </div>
            <div className='text-center p-4 rounded-xl bg-muted/50'>
              <p className='text-2xl font-bold'>{formatCurrency(currentMonth.totalExpenses)}</p>
              <p className='text-sm text-muted-foreground'>Gastos</p>
            </div>
            <div className='text-center p-4 rounded-xl bg-muted/50'>
              <p className='text-2xl font-bold'>{formatCurrency(currentMonth.netBalance)}</p>
              <p className='text-sm text-muted-foreground'>Balance</p>
            </div>
            <div className='text-center p-4 rounded-xl bg-muted/50'>
              <p className='text-2xl font-bold'>{currentMonth.savingsRate}%</p>
              <p className='text-sm text-muted-foreground'>Tasa Ahorro</p>
            </div>
            <div className='text-center p-4 rounded-xl bg-muted/50'>
              <p className='text-2xl font-bold'>{currentMonth.transactionCount}</p>
              <p className='text-sm text-muted-foreground'>Transacciones</p>
            </div>
          </div>
        </div>
      )}

      {/* Desglose de Gastos e Ingresos */}
      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Desglose de Gastos */}
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>Desglose de Gastos</h3>
          {loading && !financialStats ? (
            <div className='space-y-4'>
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 rounded-xl bg-expense/10 border border-expense/20'>
                <div>
                  <p className='text-sm text-muted-foreground'>Gastos Fijos</p>
                  <p className='text-xl font-bold'>{formatCurrency(financialStats?.fixedExpensesTotal || 0)}</p>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-expense'>{financialStats?.fixedExpenseRate || 0}%</p>
                  <p className='text-xs text-muted-foreground'>del total</p>
                </div>
              </div>
              <div className='flex items-center justify-between p-4 rounded-xl bg-orange-500/10 border border-orange-500/20'>
                <div>
                  <p className='text-sm text-muted-foreground'>Gastos Variables</p>
                  <p className='text-xl font-bold'>{formatCurrency(financialStats?.regularExpensesTotal || 0)}</p>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-orange-500'>{financialStats?.regularExpenseRate || 0}%</p>
                  <p className='text-xs text-muted-foreground'>del total</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desglose de Ingresos */}
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>Desglose de Ingresos</h3>
          {loading && !financialStats ? (
            <div className='space-y-4'>
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
            </div>
          ) : (
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 rounded-xl bg-income/10 border border-income/20'>
                <div>
                  <p className='text-sm text-muted-foreground'>Ingresos Esperados</p>
                  <p className='text-xl font-bold'>{formatCurrency(financialStats?.expectedIncomeTotal || 0)}</p>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-income'>
                    {financialStats?.totalIncome ? Math.round((financialStats.expectedIncomeTotal / financialStats.totalIncome) * 100) : 0}%
                  </p>
                  <p className='text-xs text-muted-foreground'>del total</p>
                </div>
              </div>
              <div className='flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20'>
                <div>
                  <p className='text-sm text-muted-foreground'>Ingresos Inesperados</p>
                  <p className='text-xl font-bold'>{formatCurrency(financialStats?.unexpectedIncomeTotal || 0)}</p>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-bold text-blue-500'>
                    {financialStats?.totalIncome ? Math.round((financialStats.unexpectedIncomeTotal / financialStats.totalIncome) * 100) : 0}%
                  </p>
                  <p className='text-xs text-muted-foreground'>del total</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Categorías */}
      <div className='grid lg:grid-cols-2 gap-6'>
        {/* Top Gastos por Categoría */}
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>Top Gastos por Categoría</h3>
          {loading && expensesByCategory.length === 0 ? (
            <div className='space-y-3'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : expensesByCategory.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>No hay gastos registrados</p>
          ) : (
            <div className='space-y-3'>
              {expensesByCategory.slice(0, 5).map((cat, idx) => (
                <div key={cat.concept} className='flex items-center gap-3'>
                  <div
                    className='w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold'
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  >
                    {idx + 1}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{cat.concept}</p>
                    <div className='flex items-center gap-2'>
                      <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{ width: `${cat.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                      </div>
                      <span className='text-xs text-muted-foreground w-10'>{cat.percentage}%</span>
                    </div>
                  </div>
                  <p className='text-sm font-bold'>{formatCurrency(cat.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Ingresos por Categoría */}
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>Top Ingresos por Categoría</h3>
          {loading && incomesByCategory.length === 0 ? (
            <div className='space-y-3'>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : incomesByCategory.length === 0 ? (
            <p className='text-muted-foreground text-center py-8'>No hay ingresos registrados</p>
          ) : (
            <div className='space-y-3'>
              {incomesByCategory.slice(0, 5).map((cat, idx) => (
                <div key={cat.concept} className='flex items-center gap-3'>
                  <div
                    className='w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold'
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  >
                    {idx + 1}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{cat.concept}</p>
                    <div className='flex items-center gap-2'>
                      <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                        <div
                          className='h-full rounded-full'
                          style={{ width: `${cat.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                      </div>
                      <span className='text-xs text-muted-foreground w-10'>{cat.percentage}%</span>
                    </div>
                  </div>
                  <p className='text-sm font-bold'>{formatCurrency(cat.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fuentes de Ahorro */}
      {savingsSources.length > 0 && (
        <div className='glass-card rounded-2xl p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-semibold'>Fuentes de Ahorro</h3>
            <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-savings/10'>
              <PiggyBank className='w-4 h-4 text-savings' />
              <span className='text-sm font-bold text-savings'>
                {formatCurrency(totalSavingsBalance)}
              </span>
            </div>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {savingsSources.map((source) => (
              <div
                key={source.id}
                className='p-4 rounded-xl bg-savings/5 border border-savings/20 hover:border-savings/40 transition-colors'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-10 h-10 rounded-lg bg-savings/20 flex items-center justify-center'>
                    <PiggyBank className='w-5 h-5 text-savings' />
                  </div>
                  <div>
                    <p className='font-medium'>{source.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      Inicial: {formatCurrency(source.amount)}
                    </p>
                  </div>
                </div>
                <div className='flex items-end justify-between'>
                  <div>
                    <p className='text-xs text-muted-foreground'>Balance Actual</p>
                    <p className='text-xl font-bold text-savings'>
                      {formatCurrency(source.currentBalance)}
                    </p>
                  </div>
                  {source.currentBalance > source.amount && (
                    <div className='flex items-center gap-1 text-xs text-income'>
                      <ArrowUpRight className='w-3 h-3' />
                      +{formatCurrency(source.currentBalance - source.amount)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métodos de Pago */}
      {transactionsByPaymentMethod.length > 0 && (
        <div className='glass-card rounded-2xl p-6'>
          <h3 className='text-lg font-semibold mb-6'>Distribución por Método de Pago</h3>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {transactionsByPaymentMethod.map((method, idx) => (
              <div key={method.paymentMethod} className='p-4 rounded-xl bg-muted/50'>
                <div className='flex items-center gap-2 mb-2'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <p className='text-sm font-medium capitalize'>{method.paymentMethod}</p>
                </div>
                <p className='text-xl font-bold'>{formatCurrency(method.total)}</p>
                <p className='text-xs text-muted-foreground'>{method.count} transacciones ({method.percentage}%)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas de Transacciones */}
      <div className='glass-card rounded-2xl p-6'>
        <h3 className='text-lg font-semibold mb-6'>Resumen de Transacciones del Periodo</h3>
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='text-center p-4 rounded-xl bg-muted/50'>
            <p className='text-3xl font-bold'>{financialStats?.transactionCount || 0}</p>
            <p className='text-sm text-muted-foreground'>Total Transacciones</p>
          </div>
          <div className='text-center p-4 rounded-xl bg-income/10'>
            <p className='text-3xl font-bold text-income'>{financialStats?.incomeTransactionCount || 0}</p>
            <p className='text-sm text-muted-foreground'>Ingresos</p>
          </div>
          <div className='text-center p-4 rounded-xl bg-expense/10'>
            <p className='text-3xl font-bold text-expense'>{financialStats?.expenseTransactionCount || 0}</p>
            <p className='text-sm text-muted-foreground'>Gastos</p>
          </div>
          <div className='text-center p-4 rounded-xl bg-savings/10'>
            <p className='text-3xl font-bold text-savings'>{financialStats?.savingsTransactionCount || 0}</p>
            <p className='text-sm text-muted-foreground'>Ahorros</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares

function formatCompact(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

interface StatCardProps {
  title: string;
  amount: number;
  change?: number;
  icon: React.ElementType;
  variant?: 'default' | 'income' | 'expense' | 'savings';
  loading?: boolean;
  subtitle?: string;
}

function StatCard({ title, amount, change, icon: Icon, variant = 'default', loading, subtitle }: StatCardProps) {
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
      <div className={cn('rounded-2xl p-6 border transition-all', variantStyles[variant])}>
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
    <div className={cn('rounded-2xl p-6 border transition-all hover:shadow-lg', variantStyles[variant])}>
      <div className='flex items-start justify-between'>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColors[variant])}>
          <Icon className='w-6 h-6' />
        </div>
        {change !== undefined && change !== 0 && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              change >= 0 ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
            )}
          >
            {change >= 0 ? <ArrowUpRight className='w-3 h-3' /> : <ArrowDownRight className='w-3 h-3' />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className='mt-4'>
        <p className='text-sm text-muted-foreground'>{title}</p>
        <p className='text-2xl font-bold mt-1'>{formatCurrency(amount)}</p>
        {subtitle && <p className='text-xs text-muted-foreground mt-0.5'>{subtitle}</p>}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  highlight?: boolean;
  loading?: boolean;
}

function MetricCard({ title, value, subtitle, icon, highlight, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className='glass-card rounded-xl p-4'>
        <Skeleton className='h-4 w-32 mb-2' />
        <Skeleton className='h-6 w-20' />
      </div>
    );
  }

  return (
    <div className={cn('glass-card rounded-xl p-4', highlight && 'ring-2 ring-income/50')}>
      <div className='flex items-center gap-2 text-muted-foreground mb-2'>
        {icon}
        <span className='text-sm'>{title}</span>
      </div>
      <p className={cn('text-xl font-bold', highlight && 'text-income')}>{value}</p>
      {subtitle && <p className='text-xs text-muted-foreground'>{subtitle}</p>}
    </div>
  );
}

interface TrendItemProps {
  label: string;
  value: number;
  inverse?: boolean;
}

function TrendItem({ label, value, inverse }: TrendItemProps) {
  const isPositive = inverse ? value <= 0 : value >= 0;

  return (
    <div className='flex items-center justify-between p-4 rounded-xl bg-muted/50'>
      <span className='text-sm'>{label}</span>
      <div
        className={cn(
          'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
          isPositive ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
        )}
      >
        {value >= 0 ? <ArrowUpRight className='w-4 h-4' /> : <ArrowDownRight className='w-4 h-4' />}
        {Math.abs(value)}%
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  highlight?: boolean;
  loading?: boolean;
}

function SummaryCard({ title, value, highlight, loading }: SummaryCardProps) {
  if (loading) {
    return (
      <div className='text-center p-4 rounded-xl bg-muted/50'>
        <Skeleton className='h-8 w-24 mx-auto mb-2' />
        <Skeleton className='h-4 w-32 mx-auto' />
      </div>
    );
  }

  return (
    <div className={cn('text-center p-4 rounded-xl bg-muted/50', highlight && 'ring-2 ring-primary/50')}>
      <p className={cn('text-2xl font-bold', highlight && 'text-gradient')}>{value}</p>
      <p className='text-sm text-muted-foreground'>{title}</p>
    </div>
  );
}
