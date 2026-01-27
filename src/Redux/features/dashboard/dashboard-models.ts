// Tipo para fuentes de ahorro
export interface SavingsSourceData {
  id: string;
  name: string;
  amount: number; // Valor inicial
  currentBalance: number; // Balance actual
}

export interface DashboardStats {
  totalBalance: number;
  totalIncomes: number;
  totalExpenses: number;
  totalSavings: number;
  balanceChange: number; // Porcentaje de cambio vs periodo anterior
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
  transactionCount: number;
}

export interface MonthlyTrendData {
  month: string; // Nombre del mes (ej: "Ene", "Feb")
  monthPeriod: string; // Formato: "YYYY-MM"
  ingresos: number;
  gastos: number;
  balance: number;
}

export interface ExpenseDistribution {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface PeriodSummary {
  transactionCount: number;
  savingsRate: number; // Porcentaje
  changeVsPrevious: number; // Porcentaje
}

export type PeriodFilter = '1m' | '3m' | '6m' | '1y';

// ========== Tipos para estadísticas avanzadas ==========

export interface FinancialStats {
  // Totales del periodo
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  netBalance: number;
  finalBalance: number;

  // Desglose de ingresos
  expectedIncomeTotal: number;
  unexpectedIncomeTotal: number;

  // Desglose de gastos
  fixedExpensesTotal: number;
  regularExpensesTotal: number;

  // Promedios mensuales
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  averageMonthlyBalance: number;
  averageMonthlySavings: number;

  // Tasas y porcentajes
  savingsRate: number;
  expenseRate: number;
  fixedExpenseRate: number;
  regularExpenseRate: number;

  // Cambios vs periodo anterior
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
  balanceChange: number;

  // Conteo
  transactionCount: number;
  incomeTransactionCount: number;
  expenseTransactionCount: number;
  savingsTransactionCount: number;
  monthCount: number;

  // Datos de savings_sources (balance acumulado)
  totalSavingsBalance: number;
  savingsSourcesCount: number;
  savingsSources: SavingsSourceData[];
}

export interface MonthlyFinancialData {
  monthPeriod: string;
  monthName: string;
  year: number;
  month: number;
  // Datos de monthlyLiquidity
  expectedLiquidity: number;
  realLiquidity: number | null;
  // Ingresos
  totalIncomes: number;
  expectedIncomes: number;
  unexpectedIncomes: number;
  // Gastos
  totalExpenses: number;
  fixedExpenses: number;
  regularExpenses: number;
  // Ahorros
  totalSavings: number;
  // Balance
  finalBalance: number;
  netBalance: number;
  availableBalance: number;
  savingsRate: number;
  // Conteo de transacciones
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  savingsCount: number;
}

export interface TransactionsByCategory {
  concept: string;
  total: number;
  count: number;
  type: 'income' | 'expense' | 'savings';
  percentage: number;
}

export interface TransactionsByPaymentMethod {
  paymentMethod: string;
  total: number;
  count: number;
  percentage: number;
}

export interface GlobalSummary {
  // Totales históricos
  totalHistoricalIncome: number;
  totalHistoricalExpenses: number;
  totalHistoricalSavings: number;
  totalHistoricalBalance: number;

  // Desglose histórico
  totalHistoricalFixedExpenses: number;
  totalHistoricalRegularExpenses: number;
  totalHistoricalExpectedIncome: number;
  totalHistoricalUnexpectedIncome: number;

  // Mejor y peor mes
  bestMonth: { period: string; balance: number } | null;
  worstMonth: { period: string; balance: number } | null;

  // Mes con más ingresos y gastos
  highestIncomeMonth: { period: string; amount: number } | null;
  highestExpenseMonth: { period: string; amount: number } | null;

  // Promedios históricos
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  averageMonthlySavings: number;
  averageSavingsRate: number;

  // Tendencias
  incomeTrend: number;
  expenseTrend: number;
  savingsTrend: number;

  // Top categorías
  topExpenseCategories: TransactionsByCategory[];
  topIncomeCategories: TransactionsByCategory[];

  // Meta información
  firstMonth: string | null;
  lastMonth: string | null;
  totalMonths: number;
  totalTransactions: number;

  // Datos de savings_sources (balance acumulado)
  totalSavingsBalance: number;
  savingsSourcesCount: number;
  savingsSources: SavingsSourceData[];
}

export interface CompleteDashboard {
  stats: FinancialStats;
  monthlyData: MonthlyFinancialData[];
  currentMonth: MonthlyFinancialData | null;
  summary: GlobalSummary;
  expensesByCategory: TransactionsByCategory[];
  incomesByCategory: TransactionsByCategory[];
  transactionsByPaymentMethod: TransactionsByPaymentMethod[];
}

export interface DashboardState {
  stats: DashboardStats | null;
  monthlyTrend: MonthlyTrendData[];
  expenseDistribution: ExpenseDistribution[];
  periodSummary: PeriodSummary | null;
  selectedPeriod: PeriodFilter;
  loading: boolean;
  error: string | null;
  // Estados para datos avanzados
  financialStats: FinancialStats | null;
  monthlyFinancialData: MonthlyFinancialData[];
  globalSummary: GlobalSummary | null;
  currentMonthData: MonthlyFinancialData | null;
  expensesByCategory: TransactionsByCategory[];
  incomesByCategory: TransactionsByCategory[];
  transactionsByPaymentMethod: TransactionsByPaymentMethod[];
}
