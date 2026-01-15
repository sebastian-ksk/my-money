import { firestore } from '@/config/firebase-config';
import type { Transaction } from '@/Redux/features/my-month/my-month-models';
import type {
  DashboardStats,
  MonthlyTrendData,
  ExpenseDistribution,
  PeriodSummary,
} from '@/Redux/features/dashboard/dashboard-models';
import { calculateMonthPeriod } from './my-month-service';

// Obtener los últimos N meses como array de periodos usando monthResetDay
const getLastNMonthPeriods = (
  n: number,
  monthResetDay: number = 1
): string[] => {
  const periods: string[] = [];
  const today = new Date();

  for (let i = 0; i < n; i++) {
    // Retroceder i meses desde hoy
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - i,
      today.getDate()
    );
    const period = calculateMonthPeriod(date, monthResetDay);

    // Evitar duplicados
    if (!periods.includes(period)) {
      periods.push(period);
    }
  }

  return periods.reverse();
};

// Nombres de meses en español
const MONTH_NAMES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export const dashboardService = {
  // Obtener todas las transacciones de los últimos N meses
  async getTransactionsForPeriods(
    userId: string,
    periods: string[]
  ): Promise<Transaction[]> {
    if (periods.length === 0) return [];

    const transactionsRef = firestore.collection('transactions');
    const allTransactions: Transaction[] = [];

    // Firestore no permite 'in' con más de 10 elementos, dividir en chunks
    const chunks: string[][] = [];
    for (let i = 0; i < periods.length; i += 10) {
      chunks.push(periods.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const querySnapshot = await transactionsRef
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

  // Obtener estadísticas generales
  async getDashboardStats(
    userId: string,
    monthsBack: number = 1,
    monthResetDay: number = 1
  ): Promise<DashboardStats> {
    const periods = getLastNMonthPeriods(monthsBack + 1, monthResetDay); // +1 para incluir el periodo anterior
    const currentPeriod = periods[periods.length - 1];
    const previousPeriod =
      periods.length > 1 ? periods[periods.length - 2] : null;

    console.log('Dashboard periods:', {
      periods,
      currentPeriod,
      previousPeriod,
      monthResetDay,
    });

    // Obtener transacciones de todos los periodos
    const allTransactions = await this.getTransactionsForPeriods(
      userId,
      periods
    );

    console.log('All transactions:', allTransactions.length);

    // Filtrar transacciones del periodo actual
    const currentTransactions = allTransactions.filter(
      (t) => t.monthPeriod === currentPeriod
    );

    console.log(
      'Current transactions:',
      currentTransactions.length,
      'for period:',
      currentPeriod
    );

    // Calcular totales del periodo actual
    const totalIncomes = currentTransactions
      .filter(
        (t) => t.type === 'expected_income' || t.type === 'unexpected_income'
      )
      .reduce((sum, t) => sum + t.value, 0);

    const totalExpenses = currentTransactions
      .filter((t) => t.type === 'fixed_expense' || t.type === 'regular_expense')
      .reduce((sum, t) => sum + t.value, 0);

    const totalSavings = currentTransactions
      .filter((t) => t.type === 'savings')
      .reduce((sum, t) => sum + t.value, 0);

    const balance = totalIncomes - totalExpenses;

    console.log('Stats calculated:', {
      totalIncomes,
      totalExpenses,
      totalSavings,
      balance,
    });

    // Calcular cambios respecto al periodo anterior
    let incomeChange = 0;
    let expenseChange = 0;
    let savingsChange = 0;
    let balanceChange = 0;

    if (previousPeriod) {
      const previousTransactions = allTransactions.filter(
        (t) => t.monthPeriod === previousPeriod
      );

      const prevIncomes = previousTransactions
        .filter(
          (t) => t.type === 'expected_income' || t.type === 'unexpected_income'
        )
        .reduce((sum, t) => sum + t.value, 0);

      const prevExpenses = previousTransactions
        .filter(
          (t) => t.type === 'fixed_expense' || t.type === 'regular_expense'
        )
        .reduce((sum, t) => sum + t.value, 0);

      const prevSavings = previousTransactions
        .filter((t) => t.type === 'savings')
        .reduce((sum, t) => sum + t.value, 0);

      const prevBalance = prevIncomes - prevExpenses;

      // Calcular porcentaje de cambio
      incomeChange =
        prevIncomes > 0
          ? Math.round(((totalIncomes - prevIncomes) / prevIncomes) * 100)
          : 0;
      expenseChange =
        prevExpenses > 0
          ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100)
          : 0;
      savingsChange =
        prevSavings > 0
          ? Math.round(((totalSavings - prevSavings) / prevSavings) * 100)
          : 0;
      balanceChange =
        prevBalance !== 0
          ? Math.round(((balance - prevBalance) / Math.abs(prevBalance)) * 100)
          : 0;
    }

    return {
      totalBalance: balance,
      totalIncomes,
      totalExpenses,
      totalSavings,
      balanceChange,
      incomeChange,
      expenseChange,
      savingsChange,
      transactionCount: currentTransactions.length,
    };
  },

  // Obtener tendencia mensual
  async getMonthlyTrend(
    userId: string,
    monthsBack: number = 6,
    monthResetDay: number = 1
  ): Promise<MonthlyTrendData[]> {
    const periods = getLastNMonthPeriods(monthsBack, monthResetDay);
    const transactions = await this.getTransactionsForPeriods(userId, periods);

    console.log('Monthly trend periods:', periods);

    // Agrupar por periodo
    const trendData: MonthlyTrendData[] = periods.map((period) => {
      const [, month] = period.split('-').map(Number);
      const periodTransactions = transactions.filter(
        (t) => t.monthPeriod === period
      );

      const ingresos = periodTransactions
        .filter(
          (t) => t.type === 'expected_income' || t.type === 'unexpected_income'
        )
        .reduce((sum, t) => sum + t.value, 0);

      const gastos = periodTransactions
        .filter(
          (t) => t.type === 'fixed_expense' || t.type === 'regular_expense'
        )
        .reduce((sum, t) => sum + t.value, 0);

      return {
        month: MONTH_NAMES[month - 1],
        monthPeriod: period,
        ingresos,
        gastos,
        balance: ingresos - gastos,
      };
    });

    return trendData;
  },

  // Obtener distribución de gastos por categoría
  async getExpenseDistribution(
    userId: string,
    monthsBack: number = 1,
    monthResetDay: number = 1
  ): Promise<ExpenseDistribution[]> {
    const periods = getLastNMonthPeriods(monthsBack, monthResetDay);
    const transactions = await this.getTransactionsForPeriods(userId, periods);

    // Filtrar solo gastos
    const expenses = transactions.filter(
      (t) => t.type === 'fixed_expense' || t.type === 'regular_expense'
    );

    // Agrupar por concepto
    const distributionMap = new Map<string, number>();

    expenses.forEach((expense) => {
      const concept = expense.concept || 'Otros';
      const current = distributionMap.get(concept) || 0;
      distributionMap.set(concept, current + expense.value);
    });

    // Definir colores predefinidos
    const colors = [
      'hsl(160, 84%, 39%)',
      'hsl(43, 96%, 56%)',
      'hsl(217, 91%, 60%)',
      'hsl(280, 70%, 60%)',
      'hsl(340, 80%, 55%)',
      'hsl(200, 50%, 50%)',
      'hsl(100, 60%, 45%)',
      'hsl(30, 80%, 55%)',
    ];

    // Convertir a array y ordenar por valor
    const distribution: ExpenseDistribution[] = Array.from(
      distributionMap.entries()
    )
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);

    return distribution;
  },

  // Obtener resumen del periodo
  async getPeriodSummary(
    userId: string,
    monthsBack: number = 1,
    monthResetDay: number = 1
  ): Promise<PeriodSummary> {
    const periods = getLastNMonthPeriods(monthsBack + 1, monthResetDay);
    const currentPeriod = periods[periods.length - 1];
    const previousPeriod =
      periods.length > 1 ? periods[periods.length - 2] : null;

    const allTransactions = await this.getTransactionsForPeriods(
      userId,
      periods
    );

    const currentTransactions = allTransactions.filter(
      (t) => t.monthPeriod === currentPeriod
    );

    const totalIncomes = currentTransactions
      .filter(
        (t) => t.type === 'expected_income' || t.type === 'unexpected_income'
      )
      .reduce((sum, t) => sum + t.value, 0);

    const totalExpenses = currentTransactions
      .filter((t) => t.type === 'fixed_expense' || t.type === 'regular_expense')
      .reduce((sum, t) => sum + t.value, 0);

    // Tasa de ahorro
    const savingsRate =
      totalIncomes > 0
        ? Math.round(((totalIncomes - totalExpenses) / totalIncomes) * 100)
        : 0;

    // Cambio vs mes anterior
    let changeVsPrevious = 0;
    if (previousPeriod) {
      const prevTransactions = allTransactions.filter(
        (t) => t.monthPeriod === previousPeriod
      );

      const prevIncomes = prevTransactions
        .filter(
          (t) => t.type === 'expected_income' || t.type === 'unexpected_income'
        )
        .reduce((sum, t) => sum + t.value, 0);

      const prevExpenses = prevTransactions
        .filter(
          (t) => t.type === 'fixed_expense' || t.type === 'regular_expense'
        )
        .reduce((sum, t) => sum + t.value, 0);

      const prevBalance = prevIncomes - prevExpenses;
      const currentBalance = totalIncomes - totalExpenses;

      changeVsPrevious =
        prevBalance !== 0
          ? Math.round(
              ((currentBalance - prevBalance) / Math.abs(prevBalance)) * 100
            )
          : 0;
    }

    return {
      transactionCount: currentTransactions.length,
      savingsRate,
      changeVsPrevious,
    };
  },
};
