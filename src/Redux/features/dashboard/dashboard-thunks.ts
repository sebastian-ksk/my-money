import { createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/Firebase/dashboard-service';
import type { RootState } from '@/Redux/store/types';
import type {
  DashboardStats,
  MonthlyTrendData,
  ExpenseDistribution,
  PeriodSummary,
  PeriodFilter,
} from './dashboard-models';

// Convertir filtro de periodo a número de meses
const periodToMonths = (period: PeriodFilter): number => {
  switch (period) {
    case '1m':
      return 1;
    case '3m':
      return 3;
    case '6m':
      return 6;
    case '1y':
      return 12;
    default:
      return 6;
  }
};

// Cargar estadísticas del dashboard
export const loadDashboardStats = createAsyncThunk<
  DashboardStats,
  { userId: string; period?: PeriodFilter; monthResetDay?: number },
  { rejectValue: string; state: RootState }
>(
  'dashboard/loadStats',
  async (
    { userId, period = '1m', monthResetDay },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState();
      const resetDay =
        monthResetDay ?? state.configMyMoney.userConfig?.monthResetDay ?? 1;
      const months = periodToMonths(period);
      const stats = await dashboardService.getDashboardStats(
        userId,
        months,
        resetDay
      );
      return stats;
    } catch (error: unknown) {
      console.error('Error en loadDashboardStats:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar estadísticas del dashboard'
      );
    }
  }
);

// Cargar tendencia mensual
export const loadMonthlyTrend = createAsyncThunk<
  MonthlyTrendData[],
  { userId: string; period?: PeriodFilter; monthResetDay?: number },
  { rejectValue: string; state: RootState }
>(
  'dashboard/loadMonthlyTrend',
  async (
    { userId, period = '6m', monthResetDay },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState();
      const resetDay =
        monthResetDay ?? state.configMyMoney.userConfig?.monthResetDay ?? 1;
      const months = periodToMonths(period);
      const trend = await dashboardService.getMonthlyTrend(
        userId,
        months,
        resetDay
      );
      return trend;
    } catch (error: unknown) {
      console.error('Error en loadMonthlyTrend:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar tendencia mensual'
      );
    }
  }
);

// Cargar distribución de gastos
export const loadExpenseDistribution = createAsyncThunk<
  ExpenseDistribution[],
  { userId: string; period?: PeriodFilter; monthResetDay?: number },
  { rejectValue: string; state: RootState }
>(
  'dashboard/loadExpenseDistribution',
  async (
    { userId, period = '1m', monthResetDay },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState();
      const resetDay =
        monthResetDay ?? state.configMyMoney.userConfig?.monthResetDay ?? 1;
      const months = periodToMonths(period);
      const distribution = await dashboardService.getExpenseDistribution(
        userId,
        months,
        resetDay
      );
      return distribution;
    } catch (error: unknown) {
      console.error('Error en loadExpenseDistribution:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar distribución de gastos'
      );
    }
  }
);

// Cargar resumen del periodo
export const loadPeriodSummary = createAsyncThunk<
  PeriodSummary,
  { userId: string; period?: PeriodFilter; monthResetDay?: number },
  { rejectValue: string; state: RootState }
>(
  'dashboard/loadPeriodSummary',
  async (
    { userId, period = '1m', monthResetDay },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState();
      const resetDay =
        monthResetDay ?? state.configMyMoney.userConfig?.monthResetDay ?? 1;
      const months = periodToMonths(period);
      const summary = await dashboardService.getPeriodSummary(
        userId,
        months,
        resetDay
      );
      return summary;
    } catch (error: unknown) {
      console.error('Error en loadPeriodSummary:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar resumen del periodo'
      );
    }
  }
);

// Cargar todos los datos del dashboard
export const loadDashboardData = createAsyncThunk<
  {
    stats: DashboardStats;
    monthlyTrend: MonthlyTrendData[];
    expenseDistribution: ExpenseDistribution[];
    periodSummary: PeriodSummary;
  },
  { userId: string; period?: PeriodFilter; monthResetDay?: number },
  { rejectValue: string; state: RootState }
>(
  'dashboard/loadAllData',
  async (
    { userId, period = '6m', monthResetDay },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState();
      const resetDay =
        monthResetDay ?? state.configMyMoney.userConfig?.monthResetDay ?? 1;
      const months = periodToMonths(period);

      console.log('Loading dashboard data:', {
        userId,
        period,
        months,
        resetDay,
      });

      // Cargar todos los datos en paralelo
      const [stats, monthlyTrend, expenseDistribution, periodSummary] =
        await Promise.all([
          dashboardService.getDashboardStats(userId, months, resetDay),
          dashboardService.getMonthlyTrend(userId, months, resetDay),
          dashboardService.getExpenseDistribution(userId, months, resetDay),
          dashboardService.getPeriodSummary(userId, months, resetDay),
        ]);

      console.log('Dashboard data loaded:', {
        stats,
        monthlyTrend,
        expenseDistribution,
        periodSummary,
      });

      return {
        stats,
        monthlyTrend,
        expenseDistribution,
        periodSummary,
      };
    } catch (error: unknown) {
      console.error('Error en loadDashboardData:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar datos del dashboard'
      );
    }
  }
);
