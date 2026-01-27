import { firestore } from '@/config/firebase-config';
import type { MonthlyLiquidityState, Transaction } from '@/Redux/features/my-month/my-month-models';
import { calculateMonthPeriod } from './my-month-service';

// Tipo para fuentes de ahorro
export interface SavingsSourceData {
  id: string;
  name: string;
  amount: number; // Valor inicial
  currentBalance: number; // Balance actual (currentBalance si existe, sino amount)
}

// Tipos para el dashboard
export interface FinancialStats {
  // Totales del periodo seleccionado
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  netBalance: number; // ingresos - gastos
  finalBalance: number; // balance final incluyendo liquidez inicial

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
  savingsRate: number; // % de ingresos ahorrados
  expenseRate: number; // % de ingresos gastados
  fixedExpenseRate: number; // % de gastos fijos
  regularExpenseRate: number; // % de gastos variables

  // Comparación con periodo anterior
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

  // Datos de savings_sources
  totalSavingsBalance: number; // Suma de currentBalance de todas las fuentes
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
  netBalance: number; // ingresos - gastos
  availableBalance: number; // ingresos - gastos - ahorros
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
  bestMonth: {
    period: string;
    balance: number;
  } | null;
  worstMonth: {
    period: string;
    balance: number;
  } | null;

  // Mes con más ingresos y más gastos
  highestIncomeMonth: {
    period: string;
    amount: number;
  } | null;
  highestExpenseMonth: {
    period: string;
    amount: number;
  } | null;

  // Promedios históricos
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  averageMonthlySavings: number;
  averageSavingsRate: number;

  // Tendencias (últimos 3 meses vs 3 anteriores)
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

  // Datos de savings_sources (total acumulado en fuentes de ahorro)
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

// Nombres de meses en español
const MONTH_NAMES_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Convertir periodo a meses
const periodToMonths = (period: '1m' | '3m' | '6m' | '1y'): number => {
  switch (period) {
    case '1m': return 1;
    case '3m': return 3;
    case '6m': return 6;
    case '1y': return 12;
    default: return 6;
  }
};

// Obtener periodos de los últimos N meses (genera exactamente N periodos únicos)
const getLastNMonthPeriods = (n: number, monthResetDay: number = 1): string[] => {
  const periods: string[] = [];
  const today = new Date();
  let monthsBack = 0;

  // Generar hasta que tengamos N periodos únicos
  while (periods.length < n && monthsBack < n * 2) {
    const date = new Date(today.getFullYear(), today.getMonth() - monthsBack, 15); // Usar día 15 para evitar problemas de días
    const period = calculateMonthPeriod(date, monthResetDay);
    if (!periods.includes(period)) {
      periods.push(period);
    }
    monthsBack++;
  }

  return periods.sort(); // Ordenar cronológicamente (más antiguo primero)
};

// Helper para calcular porcentaje de cambio
const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
};

// Helper para calcular totales desde transacciones
const calculateTransactionTotals = (transactions: Transaction[]) => {
  const expectedIncomes = transactions.filter(t => t.type === 'expected_income');
  const unexpectedIncomes = transactions.filter(t => t.type === 'unexpected_income');
  const fixedExpenses = transactions.filter(t => t.type === 'fixed_expense');
  const regularExpenses = transactions.filter(t => t.type === 'regular_expense');
  const savings = transactions.filter(t => t.type === 'savings');

  return {
    expectedIncomeTotal: expectedIncomes.reduce((sum, t) => sum + t.value, 0),
    unexpectedIncomeTotal: unexpectedIncomes.reduce((sum, t) => sum + t.value, 0),
    fixedExpensesTotal: fixedExpenses.reduce((sum, t) => sum + t.value, 0),
    regularExpensesTotal: regularExpenses.reduce((sum, t) => sum + t.value, 0),
    savingsTotal: savings.reduce((sum, t) => sum + t.value, 0),
    totalIncome: expectedIncomes.reduce((sum, t) => sum + t.value, 0) + unexpectedIncomes.reduce((sum, t) => sum + t.value, 0),
    totalExpenses: fixedExpenses.reduce((sum, t) => sum + t.value, 0) + regularExpenses.reduce((sum, t) => sum + t.value, 0),
    incomeCount: expectedIncomes.length + unexpectedIncomes.length,
    expenseCount: fixedExpenses.length + regularExpenses.length,
    savingsCount: savings.length,
  };
};

// Helper para agrupar por categoría (concept)
const groupByCategory = (
  transactions: Transaction[],
  type: 'income' | 'expense' | 'savings'
): TransactionsByCategory[] => {
  const typeFilters = {
    income: ['expected_income', 'unexpected_income'],
    expense: ['fixed_expense', 'regular_expense'],
    savings: ['savings'],
  };

  const filtered = transactions.filter(t => typeFilters[type].includes(t.type));
  const total = filtered.reduce((sum, t) => sum + t.value, 0);

  const grouped = new Map<string, { total: number; count: number }>();
  filtered.forEach(t => {
    const concept = t.concept || 'Sin categoría';
    const current = grouped.get(concept) || { total: 0, count: 0 };
    grouped.set(concept, {
      total: current.total + t.value,
      count: current.count + 1,
    });
  });

  return Array.from(grouped.entries())
    .map(([concept, data]) => ({
      concept,
      total: data.total,
      count: data.count,
      type,
      percentage: total > 0 ? Math.round((data.total / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

// Helper para agrupar por método de pago
const groupByPaymentMethod = (transactions: Transaction[]): TransactionsByPaymentMethod[] => {
  const total = transactions.reduce((sum, t) => sum + t.value, 0);
  const grouped = new Map<string, { total: number; count: number }>();

  transactions.forEach(t => {
    const method = t.paymentMethod || 'Sin especificar';
    const current = grouped.get(method) || { total: 0, count: 0 };
    grouped.set(method, {
      total: current.total + t.value,
      count: current.count + 1,
    });
  });

  return Array.from(grouped.entries())
    .map(([paymentMethod, data]) => ({
      paymentMethod,
      total: data.total,
      count: data.count,
      percentage: total > 0 ? Math.round((data.total / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

export const dashboardApiService = {
  // ========== Obtener fuentes de ahorro con balances ==========
  async getSavingsSources(userId: string): Promise<SavingsSourceData[]> {
    const querySnapshot = await firestore
      .collection('savings_sources')
      .where('userId', '==', userId)
      .get();

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Sin nombre',
        amount: data.amount || 0,
        // Usar currentBalance si existe, sino usar amount
        currentBalance: data.currentBalance ?? data.amount ?? 0,
      };
    });
  },

  // ========== Obtener total de savings balance ==========
  async getTotalSavingsBalance(userId: string): Promise<{
    total: number;
    count: number;
    sources: SavingsSourceData[];
  }> {
    const sources = await this.getSavingsSources(userId);
    const total = sources.reduce((sum, s) => sum + s.currentBalance, 0);
    return {
      total,
      count: sources.length,
      sources,
    };
  },

  // ========== Obtener datos de monthlyLiquidity para periodos ==========
  async getMonthlyLiquidityData(
    userId: string,
    periods: string[]
  ): Promise<MonthlyLiquidityState[]> {
    if (periods.length === 0) return [];

    const allData: MonthlyLiquidityState[] = [];

    // Firestore no permite 'in' con más de 10 elementos
    const chunks: string[][] = [];
    for (let i = 0; i < periods.length; i += 10) {
      chunks.push(periods.slice(i, i + 10));
    }

    console.log('[Dashboard API] Querying monthlyLiquidity:', { userId, periods, chunks });

    for (const chunk of chunks) {
      const querySnapshot = await firestore
        .collection('monthlyLiquidity')
        .where('userId', '==', userId)
        .where('monthPeriod', 'in', chunk)
        .get();

      console.log('[Dashboard API] monthlyLiquidity chunk result:', {
        chunk,
        docsFound: querySnapshot.docs.length,
      });

      querySnapshot.docs.forEach((doc) => {
        allData.push({
          id: doc.id,
          ...doc.data(),
        } as MonthlyLiquidityState);
      });
    }

    return allData.sort((a, b) => a.monthPeriod.localeCompare(b.monthPeriod));
  },

  // ========== Obtener transacciones para periodos ==========
  async getTransactionsForPeriods(
    userId: string,
    periods: string[]
  ): Promise<Transaction[]> {
    if (periods.length === 0) return [];

    const allTransactions: Transaction[] = [];

    const chunks: string[][] = [];
    for (let i = 0; i < periods.length; i += 10) {
      chunks.push(periods.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const querySnapshot = await firestore
        .collection('transactions')
        .where('userId', '==', userId)
        .where('monthPeriod', 'in', chunk)
        .get();

      querySnapshot.docs.forEach((doc) => {
        allTransactions.push({
          id: doc.id,
          ...doc.data(),
        } as Transaction);
      });
    }

    return allTransactions;
  },

  // ========== Calcular estadísticas financieras ==========
  async getFinancialStats(
    userId: string,
    period: '1m' | '3m' | '6m' | '1y' = '6m',
    monthResetDay: number = 1
  ): Promise<FinancialStats> {
    const months = periodToMonths(period);
    const allPeriods = getLastNMonthPeriods(months * 2, monthResetDay); // Doble para comparación
    
    // Dividir en periodos actuales (más recientes) y anteriores
    const midPoint = Math.max(0, allPeriods.length - months);
    const currentPeriods = allPeriods.slice(midPoint); // Últimos N meses
    const previousPeriods = allPeriods.slice(Math.max(0, midPoint - months), midPoint); // N meses anteriores

    console.log('[Dashboard API] getFinancialStats:', {
      userId,
      period,
      monthResetDay,
      allPeriods,
      currentPeriods,
      previousPeriods,
    });

    // Obtener datos de monthlyLiquidity, transacciones y savings_sources
    const [liquidityData, transactions, savingsData] = await Promise.all([
      this.getMonthlyLiquidityData(userId, allPeriods),
      this.getTransactionsForPeriods(userId, allPeriods),
      this.getTotalSavingsBalance(userId),
    ]);

    console.log('[Dashboard API] Data fetched:', {
      liquidityCount: liquidityData.length,
      transactionsCount: transactions.length,
      liquidityPeriods: liquidityData.map(l => l.monthPeriod),
      transactionPeriods: [...new Set(transactions.map(t => t.monthPeriod))],
    });

    // Filtrar por periodos
    const currentTransactions = transactions.filter(t => currentPeriods.includes(t.monthPeriod));
    const previousTransactions = transactions.filter(t => previousPeriods.includes(t.monthPeriod));
    const currentLiquidity = liquidityData.filter(l => currentPeriods.includes(l.monthPeriod));

    console.log('[Dashboard API] Filtered:', {
      currentTransactions: currentTransactions.length,
      previousTransactions: previousTransactions.length,
      currentLiquidity: currentLiquidity.length,
    });

    // Calcular totales del periodo actual desde transacciones
    const currentTotals = calculateTransactionTotals(currentTransactions);
    const previousTotals = calculateTransactionTotals(previousTransactions);

    // Usar datos de monthlyLiquidity si están disponibles, sino calcular desde transacciones
    const totalIncome = currentLiquidity.length > 0
      ? currentLiquidity.reduce((sum, l) => sum + (l.totalIncomes || 0), 0)
      : currentTotals.totalIncome;

    const totalExpenses = currentLiquidity.length > 0
      ? currentLiquidity.reduce((sum, l) => sum + (l.totalExpenses || 0), 0)
      : currentTotals.totalExpenses;

    const totalSavings = currentTotals.savingsTotal;
    const netBalance = totalIncome - totalExpenses;
    const lastMonth = currentLiquidity[currentLiquidity.length - 1];
    const finalBalance = lastMonth?.finalBalance || (netBalance - totalSavings);

    // Promedios
    const monthCount = currentPeriods.length || 1;
    const averageMonthlyIncome = totalIncome / monthCount;
    const averageMonthlyExpenses = totalExpenses / monthCount;
    const averageMonthlyBalance = netBalance / monthCount;
    const averageMonthlySavings = totalSavings / monthCount;

    // Tasas
    const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;
    const expenseRate = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;
    const fixedExpenseRate = totalExpenses > 0 ? Math.round((currentTotals.fixedExpensesTotal / totalExpenses) * 100) : 0;
    const regularExpenseRate = totalExpenses > 0 ? Math.round((currentTotals.regularExpensesTotal / totalExpenses) * 100) : 0;

    // Cambios vs periodo anterior
    const prevTotalIncome = previousTotals.totalIncome;
    const prevTotalExpenses = previousTotals.totalExpenses;
    const prevTotalSavings = previousTotals.savingsTotal;
    const prevNetBalance = prevTotalIncome - prevTotalExpenses;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      netBalance,
      finalBalance,
      expectedIncomeTotal: currentTotals.expectedIncomeTotal,
      unexpectedIncomeTotal: currentTotals.unexpectedIncomeTotal,
      fixedExpensesTotal: currentTotals.fixedExpensesTotal,
      regularExpensesTotal: currentTotals.regularExpensesTotal,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      averageMonthlyBalance,
      averageMonthlySavings,
      savingsRate,
      expenseRate,
      fixedExpenseRate,
      regularExpenseRate,
      incomeChange: calculateChange(totalIncome, prevTotalIncome),
      expenseChange: calculateChange(totalExpenses, prevTotalExpenses),
      savingsChange: calculateChange(totalSavings, prevTotalSavings),
      balanceChange: calculateChange(netBalance, prevNetBalance),
      transactionCount: currentTransactions.length,
      incomeTransactionCount: currentTotals.incomeCount,
      expenseTransactionCount: currentTotals.expenseCount,
      savingsTransactionCount: currentTotals.savingsCount,
      monthCount,
      // Datos de savings_sources
      totalSavingsBalance: savingsData.total,
      savingsSourcesCount: savingsData.count,
      savingsSources: savingsData.sources,
    };
  },

  // ========== Obtener historial financiero por meses ==========
  async getFinancialHistory(
    userId: string,
    months: number = 12,
    monthResetDay: number = 1
  ): Promise<MonthlyFinancialData[]> {
    const periods = getLastNMonthPeriods(months, monthResetDay);

    const [liquidityData, transactions] = await Promise.all([
      this.getMonthlyLiquidityData(userId, periods),
      this.getTransactionsForPeriods(userId, periods),
    ]);

    // Crear mapa de liquidez por periodo
    const liquidityMap = new Map(liquidityData.map(l => [l.monthPeriod, l]));
    const transactionsByPeriod = new Map<string, Transaction[]>();

    transactions.forEach(t => {
      const current = transactionsByPeriod.get(t.monthPeriod) || [];
      current.push(t);
      transactionsByPeriod.set(t.monthPeriod, current);
    });

    // Generar datos para cada periodo
    return periods.map(period => {
      const [year, month] = period.split('-').map(Number);
      const liquidity = liquidityMap.get(period);
      const periodTransactions = transactionsByPeriod.get(period) || [];
      const totals = calculateTransactionTotals(periodTransactions);

      // Usar datos de monthlyLiquidity si existen, sino calcular desde transacciones
      const totalIncomes = liquidity?.totalIncomes ?? totals.totalIncome;
      const totalExpenses = liquidity?.totalExpenses ?? totals.totalExpenses;
      const totalSavings = totals.savingsTotal;

      const netBalance = totalIncomes - totalExpenses;
      const availableBalance = netBalance - totalSavings;
      const savingsRate = totalIncomes > 0 ? Math.round((totalSavings / totalIncomes) * 100) : 0;

      return {
        monthPeriod: period,
        monthName: MONTH_NAMES_SHORT[month - 1],
        year,
        month,
        expectedLiquidity: liquidity?.expectedAmount || 0,
        realLiquidity: liquidity?.realAmount ?? null,
        totalIncomes,
        expectedIncomes: totals.expectedIncomeTotal,
        unexpectedIncomes: totals.unexpectedIncomeTotal,
        totalExpenses,
        fixedExpenses: totals.fixedExpensesTotal,
        regularExpenses: totals.regularExpensesTotal,
        totalSavings,
        finalBalance: liquidity?.finalBalance || availableBalance,
        netBalance,
        availableBalance,
        savingsRate,
        transactionCount: periodTransactions.length,
        incomeCount: totals.incomeCount,
        expenseCount: totals.expenseCount,
        savingsCount: totals.savingsCount,
      };
    });
  },

  // ========== Obtener resumen global ==========
  async getGlobalSummary(
    userId: string,
    monthResetDay: number = 1
  ): Promise<GlobalSummary> {
    // Obtener toda la historia (hasta 36 meses)
    const periods = getLastNMonthPeriods(36, monthResetDay);

    const [liquidityData, transactions, savingsData] = await Promise.all([
      this.getMonthlyLiquidityData(userId, periods),
      this.getTransactionsForPeriods(userId, periods),
      this.getTotalSavingsBalance(userId),
    ]);

    if (transactions.length === 0 && liquidityData.length === 0) {
      return {
        totalHistoricalIncome: 0,
        totalHistoricalExpenses: 0,
        totalHistoricalSavings: 0,
        totalHistoricalBalance: 0,
        totalHistoricalFixedExpenses: 0,
        totalHistoricalRegularExpenses: 0,
        totalHistoricalExpectedIncome: 0,
        totalHistoricalUnexpectedIncome: 0,
        bestMonth: null,
        worstMonth: null,
        highestIncomeMonth: null,
        highestExpenseMonth: null,
        averageMonthlyIncome: 0,
        averageMonthlyExpenses: 0,
        averageMonthlySavings: 0,
        averageSavingsRate: 0,
        incomeTrend: 0,
        expenseTrend: 0,
        savingsTrend: 0,
        topExpenseCategories: [],
        topIncomeCategories: [],
        firstMonth: null,
        lastMonth: null,
        totalMonths: 0,
        totalTransactions: 0,
        // Datos de savings_sources
        totalSavingsBalance: savingsData.total,
        savingsSourcesCount: savingsData.count,
        savingsSources: savingsData.sources,
      };
    }

    // Calcular totales históricos desde transacciones
    const allTotals = calculateTransactionTotals(transactions);

    const totalHistoricalIncome = allTotals.totalIncome;
    const totalHistoricalExpenses = allTotals.totalExpenses;
    const totalHistoricalSavings = allTotals.savingsTotal;
    const totalHistoricalBalance = totalHistoricalIncome - totalHistoricalExpenses;

    // Agrupar transacciones por periodo para estadísticas mensuales
    const transactionsByPeriod = new Map<string, Transaction[]>();
    transactions.forEach(t => {
      const current = transactionsByPeriod.get(t.monthPeriod) || [];
      current.push(t);
      transactionsByPeriod.set(t.monthPeriod, current);
    });

    // Calcular estadísticas por mes
    const monthlyStats = Array.from(transactionsByPeriod.entries()).map(([period, txs]) => {
      const totals = calculateTransactionTotals(txs);
      return {
        period,
        income: totals.totalIncome,
        expenses: totals.totalExpenses,
        savings: totals.savingsTotal,
        balance: totals.totalIncome - totals.totalExpenses,
      };
    }).sort((a, b) => a.period.localeCompare(b.period));

    // Mejor y peor mes
    const bestMonth = monthlyStats.length > 0
      ? monthlyStats.reduce((best, current) => current.balance > best.balance ? current : best)
      : null;

    const worstMonth = monthlyStats.length > 0
      ? monthlyStats.reduce((worst, current) => current.balance < worst.balance ? current : worst)
      : null;

    // Mes con más ingresos y gastos
    const highestIncomeMonth = monthlyStats.length > 0
      ? monthlyStats.reduce((highest, current) => current.income > highest.income ? current : highest)
      : null;

    const highestExpenseMonth = monthlyStats.length > 0
      ? monthlyStats.reduce((highest, current) => current.expenses > highest.expenses ? current : highest)
      : null;

    // Promedios
    const totalMonths = monthlyStats.length || 1;
    const averageMonthlyIncome = totalHistoricalIncome / totalMonths;
    const averageMonthlyExpenses = totalHistoricalExpenses / totalMonths;
    const averageMonthlySavings = totalHistoricalSavings / totalMonths;
    const averageSavingsRate = totalHistoricalIncome > 0 
      ? Math.round((totalHistoricalSavings / totalHistoricalIncome) * 100) 
      : 0;

    // Tendencias (últimos 3 meses vs 3 anteriores)
    const sortedStats = [...monthlyStats].sort((a, b) => b.period.localeCompare(a.period));
    const recent3 = sortedStats.slice(0, 3);
    const previous3 = sortedStats.slice(3, 6);

    const recentIncomeAvg = recent3.length > 0 
      ? recent3.reduce((sum, m) => sum + m.income, 0) / recent3.length 
      : 0;
    const previousIncomeAvg = previous3.length > 0 
      ? previous3.reduce((sum, m) => sum + m.income, 0) / previous3.length 
      : 0;

    const recentExpenseAvg = recent3.length > 0 
      ? recent3.reduce((sum, m) => sum + m.expenses, 0) / recent3.length 
      : 0;
    const previousExpenseAvg = previous3.length > 0 
      ? previous3.reduce((sum, m) => sum + m.expenses, 0) / previous3.length 
      : 0;

    const recentSavingsAvg = recent3.length > 0 
      ? recent3.reduce((sum, m) => sum + m.savings, 0) / recent3.length 
      : 0;
    const previousSavingsAvg = previous3.length > 0 
      ? previous3.reduce((sum, m) => sum + m.savings, 0) / previous3.length 
      : 0;

    // Top categorías
    const topExpenseCategories = groupByCategory(transactions, 'expense').slice(0, 5);
    const topIncomeCategories = groupByCategory(transactions, 'income').slice(0, 5);

    return {
      totalHistoricalIncome,
      totalHistoricalExpenses,
      totalHistoricalSavings,
      totalHistoricalBalance,
      totalHistoricalFixedExpenses: allTotals.fixedExpensesTotal,
      totalHistoricalRegularExpenses: allTotals.regularExpensesTotal,
      totalHistoricalExpectedIncome: allTotals.expectedIncomeTotal,
      totalHistoricalUnexpectedIncome: allTotals.unexpectedIncomeTotal,
      bestMonth: bestMonth ? { period: bestMonth.period, balance: bestMonth.balance } : null,
      worstMonth: worstMonth ? { period: worstMonth.period, balance: worstMonth.balance } : null,
      highestIncomeMonth: highestIncomeMonth ? { period: highestIncomeMonth.period, amount: highestIncomeMonth.income } : null,
      highestExpenseMonth: highestExpenseMonth ? { period: highestExpenseMonth.period, amount: highestExpenseMonth.expenses } : null,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      averageMonthlySavings,
      averageSavingsRate,
      incomeTrend: calculateChange(recentIncomeAvg, previousIncomeAvg),
      expenseTrend: calculateChange(recentExpenseAvg, previousExpenseAvg),
      savingsTrend: calculateChange(recentSavingsAvg, previousSavingsAvg),
      topExpenseCategories,
      topIncomeCategories,
      firstMonth: monthlyStats[0]?.period || null,
      lastMonth: monthlyStats[monthlyStats.length - 1]?.period || null,
      totalMonths,
      totalTransactions: transactions.length,
      // Datos de savings_sources
      totalSavingsBalance: savingsData.total,
      savingsSourcesCount: savingsData.count,
      savingsSources: savingsData.sources,
    };
  },

  // ========== Dashboard completo ==========
  async getCompleteDashboard(
    userId: string,
    period: '1m' | '3m' | '6m' | '1y' = '6m',
    monthResetDay: number = 1
  ): Promise<CompleteDashboard> {
    const months = periodToMonths(period);
    const periods = getLastNMonthPeriods(months, monthResetDay);

    const [stats, monthlyData, summary, transactions] = await Promise.all([
      this.getFinancialStats(userId, period, monthResetDay),
      this.getFinancialHistory(userId, months, monthResetDay),
      this.getGlobalSummary(userId, monthResetDay),
      this.getTransactionsForPeriods(userId, periods),
    ]);

    // Obtener el mes actual
    const today = new Date();
    const currentPeriod = calculateMonthPeriod(today, monthResetDay);
    const currentMonth = monthlyData.find(m => m.monthPeriod === currentPeriod) || null;

    // Agrupar por categoría y método de pago
    const expensesByCategory = groupByCategory(transactions, 'expense');
    const incomesByCategory = groupByCategory(transactions, 'income');
    const transactionsByPaymentMethod = groupByPaymentMethod(transactions);

    return {
      stats,
      monthlyData,
      currentMonth,
      summary,
      expensesByCategory,
      incomesByCategory,
      transactionsByPaymentMethod,
    };
  },
};
