import { createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/Firebase/dashboard-service';
import { dashboardApiService } from '@/services/Firebase/dashboard-api-service';
import type { RootState } from '@/Redux/store/types';
import type {
  DashboardStats,
  MonthlyTrendData,
  ExpenseDistribution,
  PeriodSummary,
  PeriodFilter,
  FinancialStats,
  MonthlyFinancialData,
  GlobalSummary,
  CompleteDashboard,
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

// ========== NUEVOS THUNKS PARA API DASHBOARD ==========

// Cargar dashboard completo usando la nueva API
export const loadCompleteDashboard = createAsyncThunk<
  CompleteDashboard,
  { userId: string; period?: PeriodFilter; monthResetDay?: number },
  { rejectValue: string; state: RootState }
>(
  'dashboard/loadCompleteDashboard',
  async (
    { userId, period = '6m', monthResetDay },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState();
      const resetDay =
        monthResetDay ?? state.configMyMoney.userConfig?.monthResetDay ?? 1;

      const dashboard = await dashboardApiService.getCompleteDashboard(
        userId,
        period,
        resetDay
      );

      return dashboard;
    } catch (error: unknown) {
      console.error('Error en loadCompleteDashboard:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar dashboard completo'
      );
    }
  }
);

// Cargar estadísticas financieras
export const loadFinancialStats = createAsyncThunk<
  FinancialStats,
  { userId: string; period?: PeriodFilter; monthResetDay?: number },
  { rejectValue: string; state: RootState }
>(
  'dashboard/loadFinancialStats',
  async (
    { userId, period = '6m', monthResetDay },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState();
      const resetDay =
        monthResetDay ?? state.configMyMoney.userConfig?.monthResetDay ?? 1;

      const stats = await dashboardApiService.getFinancialStats(
        userId,
        period,
        resetDay
      );

      return stats;
    } catch (error: unknown) {
      console.error('Error en loadFinancialStats:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar estadísticas financieras'
      );
    }
  }
);

// Cargar historial financiero
export const loadFinancialHistory = createAsyncThunk<
  MonthlyFinancialData[],
  { userId: string; months?: number; monthResetDay?: number },
  { rejectValue: string; state: RootState }
>(
  'dashboard/loadFinancialHistory',
  async (
    { userId, months = 12, monthResetDay },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState();
      const resetDay =
        monthResetDay ?? state.configMyMoney.userConfig?.monthResetDay ?? 1;

      const history = await dashboardApiService.getFinancialHistory(
        userId,
        months,
        resetDay
      );

      return history;
    } catch (error: unknown) {
      console.error('Error en loadFinancialHistory:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar historial financiero'
      );
    }
  }
);

// Cargar resumen global
export const loadGlobalSummary = createAsyncThunk<
  GlobalSummary,
  { userId: string; monthResetDay?: number },
  { rejectValue: string; state: RootState }
>(
  'dashboard/loadGlobalSummary',
  async ({ userId, monthResetDay }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const resetDay =
        monthResetDay ?? state.configMyMoney.userConfig?.monthResetDay ?? 1;

      const summary = await dashboardApiService.getGlobalSummary(userId, resetDay);

      return summary;
    } catch (error: unknown) {
      console.error('Error en loadGlobalSummary:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar resumen global'
      );
    }
  }
);
