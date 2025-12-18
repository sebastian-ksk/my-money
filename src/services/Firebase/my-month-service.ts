import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';
import type {
  Transaction,
  MonthlyLiquidityState,
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

  async createOrUpdateMonthlyLiquidity(
    userId: string,
    monthPeriod: string,
    expectedAmount: number,
    realAmount: number | null
  ): Promise<MonthlyLiquidityState> {
    const liquidityRef = firestore.collection('monthlyLiquidity');
    const querySnapshot = await liquidityRef
      .where('userId', '==', userId)
      .where('monthPeriod', '==', monthPeriod)
      .limit(1)
      .get();

    const now = firebase.firestore.Timestamp.now();
    const data = {
      userId,
      monthPeriod,
      expectedAmount,
      realAmount,
      updatedAt: now,
    };

    if (querySnapshot.empty) {
      // Crear nuevo
      const docRef = await liquidityRef.add({
        ...data,
        createdAt: now,
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

  // Calcular el balance final de un mes (para usar como expectedAmount del siguiente)
  async calculateMonthBalance(
    userId: string,
    monthPeriod: string
  ): Promise<number> {
    // Obtener el estado de liquidez del mes
    const liquidity = await this.getMonthlyLiquidity(userId, monthPeriod);
    const initialLiquidity =
      liquidity?.realAmount ?? liquidity?.expectedAmount ?? 0;

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
};
