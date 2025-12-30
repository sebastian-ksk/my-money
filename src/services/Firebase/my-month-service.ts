import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';
import type {
  Transaction,
  MonthlyLiquidityState,
  LiquiditySource,
} from '@/Redux/features/my-month/my-month-models';

// Función auxiliar para calcular el periodo del mes basado en fecha de corte
export const calculateMonthPeriod = (
  date: Date,
  monthResetDay: number
): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() retorna 0-11
  const day = date.getDate();

  // Si el día actual es menor al día de corte, el periodo pertenece al mes anterior
  if (day < monthResetDay) {
    let periodMonth = month - 1;
    let periodYear = year;

    if (periodMonth === 0) {
      periodMonth = 12;
      periodYear = year - 1;
    }

    return `${periodYear}-${String(periodMonth).padStart(2, '0')}`;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
};

// Función auxiliar para calcular el mes y año a mostrar basado en monthResetDay
// Si ya pasó el monthResetDay del mes actual, muestra el mes siguiente
export const getCurrentDisplayMonth = (
  monthResetDay: number
): { month: number; year: number } => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11
  const day = today.getDate();

  // Si el día actual es mayor o igual al día de corte, mostrar el mes siguiente
  if (day >= monthResetDay) {
    let displayMonth = month + 1;
    let displayYear = year;

    if (displayMonth === 12) {
      displayMonth = 0;
      displayYear = year + 1;
    }

    return { month: displayMonth, year: displayYear };
  }

  // Si aún no ha pasado el día de corte, mostrar el mes actual
  return { month, year };
};

// Función auxiliar para obtener el periodo del mes anterior
export const getPreviousMonthPeriod = (monthPeriod: string): string => {
  const [year, month] = monthPeriod.split('-').map(Number);
  let prevMonth = month - 1;
  let prevYear = year;

  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
};

// Función auxiliar para obtener el rango de fechas de un periodo
export const getPeriodDateRange = (
  monthPeriod: string,
  monthResetDay: number
): { start: Date; end: Date } => {
  const [year, month] = monthPeriod.split('-').map(Number);
  const start = new Date(year, month - 1, monthResetDay, 0, 0, 0);
  let end: Date;

  if (month === 12) {
    end = new Date(year + 1, 0, monthResetDay, 23, 59, 59);
  } else {
    end = new Date(year, month, monthResetDay, 23, 59, 59);
  }

  // Ajustar para que el último segundo sea antes del día de corte del siguiente mes
  end.setSeconds(end.getSeconds() - 1);

  return { start, end };
};

// Función para calcular el rango de fechas de un periodo basado en dayOfMonth
export const calculatePeriodDateRange = (
  year: number,
  month: number, // 1-12
  dayOfMonth: number
): { start: Date; end: Date } => {
  // Fecha de inicio: día de corte del mes actual
  const start = new Date(year, month - 1, dayOfMonth, 0, 0, 0);

  // Fecha de fin: día de corte del siguiente mes - 1 segundo
  let endYear = year;
  let endMonth = month + 1;

  if (endMonth > 12) {
    endMonth = 1;
    endYear = year + 1;
  }

  const end = new Date(endYear, endMonth - 1, dayOfMonth, 23, 59, 59);
  end.setSeconds(end.getSeconds() - 1);

  return { start, end };
};

// Función para encontrar el periodo actual basado en una fecha
export const findCurrentPeriod = async (
  userId: string,
  date: Date,
  dayOfMonth: number
): Promise<MonthlyLiquidityState | null> => {
  const liquidityRef = firestore.collection('monthlyLiquidity');
  const dateTimestamp = firebase.firestore.Timestamp.fromDate(date);

  // Calcular el periodo basado en la fecha
  const monthPeriod = calculateMonthPeriod(date, dayOfMonth);

  // Primero buscar por monthPeriod (más eficiente)
  let querySnapshot = await liquidityRef
    .where('userId', '==', userId)
    .where('monthPeriod', '==', monthPeriod)
    .limit(1)
    .get();

  // Si no se encuentra por monthPeriod, buscar por rango de fechas
  // Nota: Firestore no permite dos desigualdades en diferentes campos,
  // así que buscamos solo por startDate <= fecha
  if (querySnapshot.empty) {
    querySnapshot = await liquidityRef
      .where('userId', '==', userId)
      .where('startDate', '<=', dateTimestamp)
      .orderBy('startDate', 'desc')
      .limit(10)
      .get();

    // Filtrar manualmente los que también cumplen endDate >= fecha
    const matchingDocs = querySnapshot.docs.filter((doc) => {
      const data = doc.data();
      const endDate = data.endDate as firebase.firestore.Timestamp;
      return endDate && endDate >= dateTimestamp;
    });

    if (matchingDocs.length > 0) {
      const doc = matchingDocs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as MonthlyLiquidityState;
    }

    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as MonthlyLiquidityState;
};

export const myMonthService = {
  // ========== Transactions ==========
  async getTransactions(
    userId: string,
    monthPeriod: string
  ): Promise<Transaction[]> {
    const transactionsRef = firestore.collection('transactions');
    const querySnapshot = await transactionsRef
      .where('userId', '==', userId)
      .where('monthPeriod', '==', monthPeriod)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
  },

  async createTransaction(
    userId: string,
    transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    const transactionsRef = firestore.collection('transactions');
    const now = firebase.firestore.Timestamp.now();

    const transactionData: Transaction = {
      userId,
      ...transaction,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await transactionsRef.add(transactionData);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Transaction;
  },

  async updateTransaction(
    transactionId: string,
    transaction: Partial<
      Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<Transaction> {
    const transactionRef = firestore
      .collection('transactions')
      .doc(transactionId);
    const now = firebase.firestore.Timestamp.now();

    await transactionRef.update({
      ...transaction,
      updatedAt: now,
    });

    const doc = await transactionRef.get();
    return { id: doc.id, ...doc.data() } as Transaction;
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    await firestore.collection('transactions').doc(transactionId).delete();
  },

  // ========== Monthly Liquidity States ==========
  async getMonthlyLiquidity(
    userId: string,
    monthPeriod: string
  ): Promise<MonthlyLiquidityState | null> {
    const liquidityRef = firestore.collection('monthlyLiquidity');
    const querySnapshot = await liquidityRef
      .where('userId', '==', userId)
      .where('monthPeriod', '==', monthPeriod)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as MonthlyLiquidityState;
  },

  // Buscar periodo por fecha actual
  async getMonthlyLiquidityByDate(
    userId: string,
    date: Date,
    dayOfMonth: number
  ): Promise<MonthlyLiquidityState | null> {
    return findCurrentPeriod(userId, date, dayOfMonth);
  },

  async createOrUpdateMonthlyLiquidity(
    userId: string,
    monthPeriod: string,
    expectedAmount: number,
    realAmount: number | null,
    liquiditySources?: LiquiditySource[],
    startDate?: Date,
    endDate?: Date,
    dayOfMonth?: number,
    totalExpenses?: number,
    totalIncomes?: number,
    finalBalance?: number
  ): Promise<MonthlyLiquidityState> {
    const liquidityRef = firestore.collection('monthlyLiquidity');

    // Si no se proporcionan fechas, calcularlas
    let finalStartDate: Date;
    let finalEndDate: Date;

    if (startDate && endDate) {
      finalStartDate = startDate;
      finalEndDate = endDate;
    } else if (dayOfMonth) {
      const [year, month] = monthPeriod.split('-').map(Number);
      const range = calculatePeriodDateRange(year, month, dayOfMonth);
      finalStartDate = range.start;
      finalEndDate = range.end;
    } else {
      // Fallback: usar el mes actual
      const [year, month] = monthPeriod.split('-').map(Number);
      finalStartDate = new Date(year, month - 1, 1);
      finalEndDate = new Date(year, month, 0, 23, 59, 59);
    }

    const startTimestamp =
      firebase.firestore.Timestamp.fromDate(finalStartDate);

    // Buscar primero por monthPeriod (más eficiente y evita problemas con desigualdades)
    let querySnapshot = await liquidityRef
      .where('userId', '==', userId)
      .where('monthPeriod', '==', monthPeriod)
      .limit(1)
      .get();

    // Si no se encuentra por monthPeriod, buscar por startDate exacto
    if (querySnapshot.empty) {
      querySnapshot = await liquidityRef
        .where('userId', '==', userId)
        .where('startDate', '==', startTimestamp)
        .limit(1)
        .get();
    }

    const now = firebase.firestore.Timestamp.now();
    const data: Partial<MonthlyLiquidityState> = {
      userId,
      monthPeriod,
      startDate: firebase.firestore.Timestamp.fromDate(finalStartDate),
      endDate: firebase.firestore.Timestamp.fromDate(finalEndDate),
      expectedAmount,
      realAmount,
      updatedAt: now,
    };

    if (liquiditySources !== undefined) {
      data.liquiditySources = liquiditySources;
    }

    // Agregar balances si se proporcionan
    if (totalExpenses !== undefined) {
      data.totalExpenses = totalExpenses;
    }
    if (totalIncomes !== undefined) {
      data.totalIncomes = totalIncomes;
    }
    if (finalBalance !== undefined) {
      data.finalBalance = finalBalance;
    }

    if (querySnapshot.empty) {
      // Crear nuevo
      const docRef = await liquidityRef.add({
        ...data,
        createdAt: now,
        liquiditySources: liquiditySources || [],
      });
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as MonthlyLiquidityState;
    } else {
      // Actualizar existente
      const docRef = querySnapshot.docs[0].ref;
      await docRef.update(data);
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as MonthlyLiquidityState;
    }
  },

  // Calcular y actualizar balances del mes
  async updateMonthBalances(
    userId: string,
    monthPeriod: string,
    dayOfMonth?: number
  ): Promise<MonthlyLiquidityState> {
    // Primero buscar por fecha actual si tenemos dayOfMonth
    let liquidity: MonthlyLiquidityState | null = null;
    if (dayOfMonth) {
      const today = new Date();
      liquidity = await this.getMonthlyLiquidityByDate(
        userId,
        today,
        dayOfMonth
      );
    }

    // Si no se encuentra por fecha, buscar por monthPeriod
    if (!liquidity) {
      liquidity = await this.getMonthlyLiquidity(userId, monthPeriod);
    }

    // Si no existe, crear uno con el expectedAmount del mes anterior
    if (!liquidity) {
      const previousPeriod = getPreviousMonthPeriod(monthPeriod);
      const previousBalance = await this.calculateMonthBalance(
        userId,
        previousPeriod
      );

      liquidity = await this.createOrUpdateMonthlyLiquidity(
        userId,
        monthPeriod,
        previousBalance,
        null,
        [],
        undefined,
        undefined,
        dayOfMonth
      );
    }

    // Obtener todas las transacciones del mes
    const transactions = await this.getTransactions(userId, monthPeriod);

    // Calcular ingresos (expected_income + unexpected_income)
    const totalIncomes = transactions
      .filter(
        (t) => t.type === 'expected_income' || t.type === 'unexpected_income'
      )
      .reduce((sum, t) => sum + t.value, 0);

    // Calcular gastos (fixed_expense + regular_expense)
    const totalExpenses = transactions
      .filter((t) => t.type === 'fixed_expense' || t.type === 'regular_expense')
      .reduce((sum, t) => sum + t.value, 0);

    // Calcular liquidez inicial (suma de fuentes reales o expectedAmount)
    const initialLiquidity =
      liquidity.realAmount ??
      (liquidity.liquiditySources.reduce(
        (sum, s) => sum + (s.realAmount ?? 0),
        0
      ) ||
        liquidity.expectedAmount ||
        0);

    // Calcular balance final
    const finalBalance = initialLiquidity + totalIncomes - totalExpenses;

    // Actualizar el documento con los balances
    return await this.createOrUpdateMonthlyLiquidity(
      userId,
      monthPeriod,
      liquidity.expectedAmount,
      liquidity.realAmount,
      liquidity.liquiditySources,
      liquidity.startDate?.toDate(),
      liquidity.endDate?.toDate(),
      dayOfMonth,
      totalExpenses,
      totalIncomes,
      finalBalance
    );
  },

  // Calcular el balance final de un mes (para usar como expectedAmount del siguiente)
  async calculateMonthBalance(
    userId: string,
    monthPeriod: string
  ): Promise<number> {
    // Obtener el estado de liquidez del mes
    const liquidity = await this.getMonthlyLiquidity(userId, monthPeriod);
    const initialLiquidity =
      liquidity?.realAmount ??
      (liquidity?.liquiditySources.reduce(
        (sum, s) => sum + (s.realAmount ?? 0),
        0
      ) ||
        liquidity?.expectedAmount ||
        0);

    // Obtener todas las transacciones del mes
    const transactions = await this.getTransactions(userId, monthPeriod);

    // Calcular ingresos y gastos
    const incomes = transactions
      .filter(
        (t) => t.type === 'expected_income' || t.type === 'unexpected_income'
      )
      .reduce((sum, t) => sum + t.value, 0);

    const expenses = transactions
      .filter((t) => t.type === 'fixed_expense' || t.type === 'regular_expense')
      .reduce((sum, t) => sum + t.value, 0);

    return initialLiquidity + incomes - expenses;
  },

  // ========== Liquidity Sources ==========
  async getLiquiditySources(
    userId: string,
    monthPeriod: string
  ): Promise<LiquiditySource[]> {
    const liquidity = await this.getMonthlyLiquidity(userId, monthPeriod);
    return liquidity?.liquiditySources || [];
  },

  async getPreviousMonthLiquiditySources(
    userId: string,
    monthPeriod: string
  ): Promise<LiquiditySource[]> {
    const previousPeriod = getPreviousMonthPeriod(monthPeriod);
    const liquidity = await this.getMonthlyLiquidity(userId, previousPeriod);
    return liquidity?.liquiditySources || [];
  },

  async createLiquiditySource(
    userId: string,
    monthPeriod: string,
    source: Omit<LiquiditySource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<LiquiditySource> {
    const liquidity = await this.getMonthlyLiquidity(userId, monthPeriod);
    const now = firebase.firestore.Timestamp.now();

    // Generar un ID único para la fuente
    const sourceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newSource: LiquiditySource = {
      id: sourceId,
      userId,
      ...source,
      createdAt: now,
      updatedAt: now,
    };

    const sources = liquidity?.liquiditySources || [];
    const updatedSources = [...sources, newSource];

    // El expectedAmount del MonthlyLiquidityState debe ser el valor calculado del mes anterior
    // No se actualiza aquí, se mantiene el valor existente
    const currentExpectedAmount = liquidity?.expectedAmount ?? 0;

    // El realAmount es la suma de los valores reales de las fuentes
    const realAmount = updatedSources.reduce((sum, s) => {
      return sum + (s.realAmount ?? 0);
    }, 0);

    await this.createOrUpdateMonthlyLiquidity(
      userId,
      monthPeriod,
      currentExpectedAmount,
      realAmount > 0 ? realAmount : null,
      updatedSources
    );

    return newSource;
  },

  async updateLiquiditySource(
    userId: string,
    monthPeriod: string,
    sourceId: string,
    source: Partial<
      Omit<LiquiditySource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<LiquiditySource> {
    const liquidity = await this.getMonthlyLiquidity(userId, monthPeriod);
    if (!liquidity) {
      throw new Error('Liquidity state not found');
    }

    const sources = liquidity.liquiditySources || [];
    // Buscar por ID primero
    let sourceIndex = sources.findIndex((s) => s.id === sourceId);

    // Si no se encuentra por ID y el sourceId parece ser un índice temporal (source-X),
    // intentar extraer el índice
    if (sourceIndex === -1 && sourceId.startsWith('source-')) {
      const indexMatch = sourceId.match(/source-(\d+)/);
      if (indexMatch) {
        const idx = parseInt(indexMatch[1], 10);
        if (idx >= 0 && idx < sources.length) {
          sourceIndex = idx;
        }
      }
    }

    // Si aún no se encuentra, buscar por nombre (fallback para fuentes sin ID)
    if (sourceIndex === -1 && source.name) {
      sourceIndex = sources.findIndex((s) => s.name === source.name);
    }

    if (sourceIndex === -1) {
      throw new Error('Liquidity source not found');
    }

    const now = firebase.firestore.Timestamp.now();
    // Asegurar que la fuente tenga un ID
    const existingSource = sources[sourceIndex];
    const sourceIdToUse =
      existingSource.id ||
      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const updatedSource: LiquiditySource = {
      ...existingSource,
      id: sourceIdToUse,
      ...source,
      updatedAt: now,
    };

    const updatedSources = [...sources];
    updatedSources[sourceIndex] = updatedSource;

    // El expectedAmount del MonthlyLiquidityState debe ser el valor calculado del mes anterior
    // No se actualiza aquí, se mantiene el valor existente
    const currentExpectedAmount = liquidity.expectedAmount;

    // El realAmount es la suma de los valores reales de las fuentes
    const realAmount = updatedSources.reduce((sum, s) => {
      return sum + (s.realAmount ?? 0);
    }, 0);

    await this.createOrUpdateMonthlyLiquidity(
      userId,
      monthPeriod,
      currentExpectedAmount,
      realAmount > 0 ? realAmount : null,
      updatedSources
    );

    return updatedSource;
  },

  async deleteLiquiditySource(
    userId: string,
    monthPeriod: string,
    sourceId: string
  ): Promise<void> {
    const liquidity = await this.getMonthlyLiquidity(userId, monthPeriod);
    if (!liquidity) {
      throw new Error('Liquidity state not found');
    }

    const sources = liquidity.liquiditySources || [];
    // Buscar por ID primero
    let sourceIndex = sources.findIndex((s) => s.id === sourceId);

    // Si no se encuentra por ID y el sourceId parece ser un índice temporal (source-X),
    // intentar extraer el índice
    if (sourceIndex === -1 && sourceId.startsWith('source-')) {
      const indexMatch = sourceId.match(/source-(\d+)/);
      if (indexMatch) {
        const idx = parseInt(indexMatch[1], 10);
        if (idx >= 0 && idx < sources.length) {
          sourceIndex = idx;
        }
      }
    }

    // Filtrar por ID o por índice
    const updatedSources =
      sourceIndex >= 0
        ? sources.filter((_, idx) => idx !== sourceIndex)
        : sources.filter((s) => s.id !== sourceId);

    // El expectedAmount del MonthlyLiquidityState debe ser el valor calculado del mes anterior
    // No se actualiza aquí, se mantiene el valor existente
    const currentExpectedAmount = liquidity.expectedAmount;

    // El realAmount es la suma de los valores reales de las fuentes
    const realAmount = updatedSources.reduce((sum, s) => {
      return sum + (s.realAmount ?? 0);
    }, 0);

    await this.createOrUpdateMonthlyLiquidity(
      userId,
      monthPeriod,
      currentExpectedAmount,
      realAmount > 0 ? realAmount : null,
      updatedSources
    );
  },
};
