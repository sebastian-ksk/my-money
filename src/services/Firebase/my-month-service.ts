import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';
import type { Transaction } from '@/Redux/features/my-month/my-month-models';

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
};
