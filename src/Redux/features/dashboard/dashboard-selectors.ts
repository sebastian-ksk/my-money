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

// ========== NUEVOS SELECTORES PARA DATOS AVANZADOS ==========

// Estadísticas financieras completas
export const selectFinancialStats = (state: RootState) =>
  state.dashboard.financialStats;

// Datos financieros mensuales
export const selectMonthlyFinancialData = (state: RootState) =>
  state.dashboard.monthlyFinancialData;

// Resumen global
export const selectGlobalSummary = (state: RootState) =>
  state.dashboard.globalSummary;

// Datos del mes actual
export const selectCurrentMonthData = (state: RootState) =>
  state.dashboard.currentMonthData;

// Selectores calculados para estadísticas avanzadas
export const selectNetBalance = (state: RootState) =>
  state.dashboard.financialStats?.netBalance ?? 0;

export const selectFinalBalance = (state: RootState) =>
  state.dashboard.financialStats?.finalBalance ?? 0;

export const selectAverageMonthlyIncome = (state: RootState) =>
  state.dashboard.financialStats?.averageMonthlyIncome ?? 0;

export const selectAverageMonthlyExpenses = (state: RootState) =>
  state.dashboard.financialStats?.averageMonthlyExpenses ?? 0;

export const selectExpenseRate = (state: RootState) =>
  state.dashboard.financialStats?.expenseRate ?? 0;

export const selectAdvancedSavingsRate = (state: RootState) =>
  state.dashboard.financialStats?.savingsRate ?? 0;

export const selectMonthCount = (state: RootState) =>
  state.dashboard.financialStats?.monthCount ?? 0;

// Selectores para resumen global
export const selectTotalHistoricalIncome = (state: RootState) =>
  state.dashboard.globalSummary?.totalHistoricalIncome ?? 0;

export const selectTotalHistoricalExpenses = (state: RootState) =>
  state.dashboard.globalSummary?.totalHistoricalExpenses ?? 0;

export const selectTotalHistoricalBalance = (state: RootState) =>
  state.dashboard.globalSummary?.totalHistoricalBalance ?? 0;

export const selectBestMonth = (state: RootState) =>
  state.dashboard.globalSummary?.bestMonth ?? null;

export const selectWorstMonth = (state: RootState) =>
  state.dashboard.globalSummary?.worstMonth ?? null;

export const selectIncomeTrend = (state: RootState) =>
  state.dashboard.globalSummary?.incomeTrend ?? 0;

export const selectExpenseTrend = (state: RootState) =>
  state.dashboard.globalSummary?.expenseTrend ?? 0;

export const selectSavingsTrend = (state: RootState) =>
  state.dashboard.globalSummary?.savingsTrend ?? 0;

// Selectores para categorías y métodos de pago
export const selectExpensesByCategory = (state: RootState) =>
  state.dashboard.expensesByCategory;

export const selectIncomesByCategory = (state: RootState) =>
  state.dashboard.incomesByCategory;

export const selectTransactionsByPaymentMethod = (state: RootState) =>
  state.dashboard.transactionsByPaymentMethod;

// Selectores para desglose de gastos e ingresos
export const selectFixedExpensesTotal = (state: RootState) =>
  state.dashboard.financialStats?.fixedExpensesTotal ?? 0;

export const selectRegularExpensesTotal = (state: RootState) =>
  state.dashboard.financialStats?.regularExpensesTotal ?? 0;

export const selectExpectedIncomeTotal = (state: RootState) =>
  state.dashboard.financialStats?.expectedIncomeTotal ?? 0;

export const selectUnexpectedIncomeTotal = (state: RootState) =>
  state.dashboard.financialStats?.unexpectedIncomeTotal ?? 0;

export const selectFixedExpenseRate = (state: RootState) =>
  state.dashboard.financialStats?.fixedExpenseRate ?? 0;

export const selectRegularExpenseRate = (state: RootState) =>
  state.dashboard.financialStats?.regularExpenseRate ?? 0;

// Top categorías del resumen global
export const selectTopExpenseCategories = (state: RootState) =>
  state.dashboard.globalSummary?.topExpenseCategories ?? [];

export const selectTopIncomeCategories = (state: RootState) =>
  state.dashboard.globalSummary?.topIncomeCategories ?? [];

// Selectores para savings_sources (balance acumulado en fuentes de ahorro)
export const selectTotalSavingsBalance = (state: RootState) =>
  state.dashboard.financialStats?.totalSavingsBalance ?? 0;

export const selectSavingsSourcesCount = (state: RootState) =>
  state.dashboard.financialStats?.savingsSourcesCount ?? 0;

export const selectSavingsSources = (state: RootState) =>
  state.dashboard.financialStats?.savingsSources ?? [];

export const selectGlobalSavingsSources = (state: RootState) =>
  state.dashboard.globalSummary?.savingsSources ?? [];
