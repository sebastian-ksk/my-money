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

export interface DashboardState {
  stats: DashboardStats | null;
  monthlyTrend: MonthlyTrendData[];
  expenseDistribution: ExpenseDistribution[];
  periodSummary: PeriodSummary | null;
  selectedPeriod: PeriodFilter;
  loading: boolean;
  error: string | null;
}
