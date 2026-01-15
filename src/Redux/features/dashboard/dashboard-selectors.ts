import type { RootState } from '../../store/types';

// Estado completo
export const selectDashboard = (state: RootState) => state.dashboard;

// Estadísticas
export const selectDashboardStats = (state: RootState) => state.dashboard.stats;

// Tendencia mensual
export const selectMonthlyTrend = (state: RootState) =>
  state.dashboard.monthlyTrend;

// Distribución de gastos
export const selectExpenseDistribution = (state: RootState) =>
  state.dashboard.expenseDistribution;

// Resumen del periodo
export const selectPeriodSummary = (state: RootState) =>
  state.dashboard.periodSummary;

// Periodo seleccionado
export const selectSelectedPeriod = (state: RootState) =>
  state.dashboard.selectedPeriod;

// Estado de carga
export const selectDashboardLoading = (state: RootState) =>
  state.dashboard.loading;

// Error
export const selectDashboardError = (state: RootState) => state.dashboard.error;

// Selectores calculados
export const selectTotalBalance = (state: RootState) =>
  state.dashboard.stats?.totalBalance ?? 0;

export const selectTotalIncomes = (state: RootState) =>
  state.dashboard.stats?.totalIncomes ?? 0;

export const selectTotalExpenses = (state: RootState) =>
  state.dashboard.stats?.totalExpenses ?? 0;

export const selectTotalSavings = (state: RootState) =>
  state.dashboard.stats?.totalSavings ?? 0;

export const selectSavingsRate = (state: RootState) =>
  state.dashboard.periodSummary?.savingsRate ?? 0;

export const selectTransactionCount = (state: RootState) =>
  state.dashboard.periodSummary?.transactionCount ?? 0;

export const selectChangeVsPrevious = (state: RootState) =>
  state.dashboard.periodSummary?.changeVsPrevious ?? 0;
