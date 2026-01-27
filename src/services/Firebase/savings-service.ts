import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';
import type { Transaction } from '@/Redux/features/my-month/my-month-models';
import type { SavingsSource, SavingsDeposit } from '@/Redux/features/config-my-money/config-my-money-models';

// Helper para asegurar número válido (evitar NaN y problemas de precisión)
const safeNumber = (value: number | null | undefined): number => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 0;
  }
  // Redondear para evitar errores de punto flotante
  return Math.round(Number(value));
};

export interface SavingsTransactionInput {
  userId: string;
  monthPeriod: string;
  savingsSourceId: string; // Destino del ahorro
  originSource: string; // De dónde viene (efectivo, cuenta, etc.)
  value: number;
  concept?: string;
  date?: Date;
}

export interface SavingsTransactionUpdate {
  value?: number;
  originSource?: string;
  concept?: string;
  date?: Date;
}

export const savingsService = {
  // ========== Obtener transacciones de ahorro ==========
  async getSavingsTransactions(
    userId: string,
    monthPeriod: string
  ): Promise<Transaction[]> {
    // Query simplificada sin orderBy para evitar índices compuestos
    const querySnapshot = await firestore
      .collection('transactions')
      .where('userId', '==', userId)
      .where('monthPeriod', '==', monthPeriod)
      .where('type', '==', 'savings')
      .get();

    // Ordenar en el cliente
    const transactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    return transactions.sort((a, b) => {
      const dateA = (a.date as firebase.firestore.Timestamp)?.toMillis?.() || 0;
      const dateB = (b.date as firebase.firestore.Timestamp)?.toMillis?.() || 0;
      return dateB - dateA;
    });
  },

  // ========== Obtener todas las transacciones de ahorro de un usuario ==========
  async getAllSavingsTransactions(userId: string): Promise<Transaction[]> {
    // Query simplificada sin orderBy para evitar índices compuestos
    const querySnapshot = await firestore
      .collection('transactions')
      .where('userId', '==', userId)
      .where('type', '==', 'savings')
      .get();

    // Ordenar en el cliente
    const transactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    return transactions.sort((a, b) => {
      const dateA = (a.date as firebase.firestore.Timestamp)?.toMillis?.() || 0;
      const dateB = (b.date as firebase.firestore.Timestamp)?.toMillis?.() || 0;
      return dateB - dateA;
    });
  },

  // ========== Crear transacción de ahorro ==========
  async createSavingsTransaction(
    input: SavingsTransactionInput
  ): Promise<Transaction> {
    const now = firebase.firestore.Timestamp.now();
    const transactionDate = input.date
      ? firebase.firestore.Timestamp.fromDate(input.date)
      : now;

    // Obtener la fuente de ahorro para el nombre
    const savingsSourceDoc = await firestore
      .collection('savings_sources')
      .doc(input.savingsSourceId)
      .get();

    if (!savingsSourceDoc.exists) {
      throw new Error('Fuente de ahorro no encontrada');
    }

    const savingsSourceData = savingsSourceDoc.data();
    if (!savingsSourceData) {
      throw new Error('Datos de fuente de ahorro no válidos');
    }

    const savingsSource: SavingsSource = {
      id: savingsSourceDoc.id,
      userId: savingsSourceData.userId,
      name: savingsSourceData.name,
      amount: safeNumber(savingsSourceData.amount),
      currentBalance: safeNumber(savingsSourceData.currentBalance || savingsSourceData.amount),
      deposits: savingsSourceData.deposits || [],
    };

    // Crear la transacción
    const transactionData: Omit<Transaction, 'id'> = {
      userId: input.userId,
      type: 'savings',
      value: safeNumber(input.value),
      concept: input.concept || `Ahorro a ${savingsSource.name}`,
      paymentMethod: input.originSource,
      date: transactionDate,
      monthPeriod: input.monthPeriod,
      savingsSourceId: input.savingsSourceId,
      originSource: input.originSource,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await firestore.collection('transactions').add(transactionData);
    const transactionId = docRef.id;

    // Actualizar el balance de la fuente de ahorro
    const currentBalance = safeNumber(savingsSource.currentBalance);
    const newBalance = currentBalance + safeNumber(input.value);

    // Crear el depósito (sin Timestamp para evitar problemas de serialización)
    const depositData = {
      id: transactionId,
      date: transactionDate,
      amount: safeNumber(input.value),
      originSource: input.originSource,
      transactionId: transactionId,
      monthPeriod: input.monthPeriod,
    };

    const existingDeposits = savingsSource.deposits || [];

    await firestore.collection('savings_sources').doc(input.savingsSourceId).update({
      currentBalance: newBalance,
      deposits: [...existingDeposits, depositData],
      updatedAt: now,
    });

    return { id: transactionId, ...transactionData };
  },

  // ========== Actualizar transacción de ahorro ==========
  async updateSavingsTransaction(
    transactionId: string,
    updates: SavingsTransactionUpdate
  ): Promise<Transaction> {
    const now = firebase.firestore.Timestamp.now();
    const transactionRef = firestore.collection('transactions').doc(transactionId);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      throw new Error('Transacción no encontrada');
    }

    const existingTransaction = transactionDoc.data() as Transaction;

    if (existingTransaction.type !== 'savings') {
      throw new Error('La transacción no es de tipo ahorro');
    }

    const oldValue = safeNumber(existingTransaction.value);
    const newValue = updates.value !== undefined ? safeNumber(updates.value) : oldValue;
    const valueDiff = newValue - oldValue;

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (updates.value !== undefined) {
      updateData.value = newValue;
    }
    if (updates.originSource !== undefined) {
      updateData.originSource = updates.originSource;
      updateData.paymentMethod = updates.originSource;
    }
    if (updates.concept !== undefined) {
      updateData.concept = updates.concept;
    }
    if (updates.date !== undefined) {
      updateData.date = firebase.firestore.Timestamp.fromDate(updates.date);
    }

    await transactionRef.update(updateData);

    // Actualizar el balance de la fuente de ahorro si cambió el valor
    if (valueDiff !== 0 && existingTransaction.savingsSourceId) {
      const savingsSourceRef = firestore
        .collection('savings_sources')
        .doc(existingTransaction.savingsSourceId);
      const savingsSourceDoc = await savingsSourceRef.get();

      if (savingsSourceDoc.exists) {
        const savingsSource = savingsSourceDoc.data() as SavingsSource;
        const currentBalance = safeNumber(savingsSource.currentBalance);
        const newBalance = currentBalance + valueDiff;

        // Actualizar el depósito correspondiente
        const deposits = savingsSource.deposits || [];
        const depositIndex = deposits.findIndex((d) => d.transactionId === transactionId);
        
        if (depositIndex !== -1) {
          deposits[depositIndex] = {
            ...deposits[depositIndex],
            amount: newValue,
            originSource: updates.originSource || deposits[depositIndex].originSource,
            date: updates.date 
              ? firebase.firestore.Timestamp.fromDate(updates.date)
              : deposits[depositIndex].date,
          };
        }

        await savingsSourceRef.update({
          currentBalance: newBalance,
          deposits,
          updatedAt: now,
        });
      }
    }

    const updatedDoc = await transactionRef.get();
    return { id: transactionId, ...updatedDoc.data() } as Transaction;
  },

  // ========== Eliminar transacción de ahorro ==========
  async deleteSavingsTransaction(transactionId: string): Promise<void> {
    const transactionRef = firestore.collection('transactions').doc(transactionId);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      throw new Error('Transacción no encontrada');
    }

    const transaction = transactionDoc.data() as Transaction;

    if (transaction.type !== 'savings') {
      throw new Error('La transacción no es de tipo ahorro');
    }

    const now = firebase.firestore.Timestamp.now();

    // Revertir el balance de la fuente de ahorro
    if (transaction.savingsSourceId) {
      const savingsSourceRef = firestore
        .collection('savings_sources')
        .doc(transaction.savingsSourceId);
      const savingsSourceDoc = await savingsSourceRef.get();

      if (savingsSourceDoc.exists) {
        const savingsSource = savingsSourceDoc.data() as SavingsSource;
        const currentBalance = safeNumber(savingsSource.currentBalance);
        const newBalance = Math.max(0, currentBalance - safeNumber(transaction.value));

        // Eliminar el depósito correspondiente
        const deposits = (savingsSource.deposits || []).filter(
          (d) => d.transactionId !== transactionId
        );

        await savingsSourceRef.update({
          currentBalance: newBalance,
          deposits,
          updatedAt: now,
        });
      }
    }

    // Eliminar la transacción
    await transactionRef.delete();
  },

  // ========== Obtener fuentes de ahorro con balance ==========
  async getSavingsSourcesWithBalance(userId: string): Promise<SavingsSource[]> {
    const querySnapshot = await firestore
      .collection('savings_sources')
      .where('userId', '==', userId)
      .get();

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      currentBalance: safeNumber(doc.data().currentBalance),
    })) as SavingsSource[];
  },

  // ========== Obtener historial de depósitos de una fuente ==========
  async getSavingsHistory(
    savingsSourceId: string
  ): Promise<SavingsDeposit[]> {
    const docRef = firestore.collection('savings_sources').doc(savingsSourceId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return [];
    }

    const data = doc.data() as SavingsSource;
    return data.deposits || [];
  },

  // ========== Obtener total de ahorros de un período ==========
  async getTotalSavingsForPeriod(
    userId: string,
    monthPeriod: string
  ): Promise<number> {
    const transactions = await this.getSavingsTransactions(userId, monthPeriod);
    return transactions.reduce((sum, t) => sum + safeNumber(t.value), 0);
  },

  // ========== Obtener total acumulado en todas las fuentes ==========
  async getTotalSavingsBalance(userId: string): Promise<number> {
    const sources = await this.getSavingsSourcesWithBalance(userId);
    return sources.reduce((sum, s) => sum + safeNumber(s.currentBalance), 0);
  },

  // ========== Recalcular balance de una fuente basado en transacciones ==========
  async recalculateSavingsSourceBalance(savingsSourceId: string): Promise<SavingsSource> {
    const now = firebase.firestore.Timestamp.now();
    const savingsSourceRef = firestore.collection('savings_sources').doc(savingsSourceId);
    const savingsSourceDoc = await savingsSourceRef.get();

    if (!savingsSourceDoc.exists) {
      throw new Error('Fuente de ahorro no encontrada');
    }

    const savingsSource = savingsSourceDoc.data() as SavingsSource;

    // Obtener todas las transacciones de ahorro hacia esta fuente
    const querySnapshot = await firestore
      .collection('transactions')
      .where('savingsSourceId', '==', savingsSourceId)
      .where('type', '==', 'savings')
      .get();

    const transactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];

    // Recalcular el balance: amount inicial + suma de depósitos
    const depositsTotal = transactions.reduce((sum, t) => sum + safeNumber(t.value), 0);
    const newBalance = safeNumber(savingsSource.amount) + depositsTotal;

    // Reconstruir depósitos
    const deposits: SavingsDeposit[] = transactions.map((t) => ({
      id: t.id,
      date: t.date as firebase.firestore.Timestamp,
      amount: safeNumber(t.value),
      originSource: t.originSource || t.paymentMethod,
      transactionId: t.id!,
      monthPeriod: t.monthPeriod,
    }));

    await savingsSourceRef.update({
      currentBalance: newBalance,
      deposits,
      updatedAt: now,
    });

    return {
      id: savingsSourceId,
      ...savingsSource,
      currentBalance: newBalance,
      deposits,
    };
  },
};
