import { createAsyncThunk } from '@reduxjs/toolkit';
import { myMonthService } from '@/services/Firebase/my-month-service';
import type { Transaction } from './my-month-models';

// ========== Transactions ==========
export const loadTransactions = createAsyncThunk(
  'myMonth/loadTransactions',
  async (
    {
      userId,
      monthPeriod,
    }: {
      userId: string;
      monthPeriod: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('loadTransactions thunk ejecutado:', { userId, monthPeriod });
      const transactions = await myMonthService.getTransactions(
        userId,
        monthPeriod
      );
      console.log('transactions cargadas:', transactions);
      return transactions;
    } catch (error: any) {
      console.error('Error en loadTransactions:', error);
      return rejectWithValue(error.message || 'Error al cargar transacciones');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'myMonth/createTransaction',
  async (
    {
      userId,
      transaction,
    }: {
      userId: string;
      transaction: Omit<
        Transaction,
        'id' | 'userId' | 'createdAt' | 'updatedAt'
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('createTransaction thunk ejecutado:', {
        userId,
        transaction,
      });
      const result = await myMonthService.createTransaction(
        userId,
        transaction
      );
      console.log('transacción creada:', result);
      return result;
    } catch (error: any) {
      console.error('Error en createTransaction:', error);
      return rejectWithValue(error.message || 'Error al crear transacción');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'myMonth/updateTransaction',
  async (
    {
      transactionId,
      transaction,
    }: {
      transactionId: string;
      transaction: Partial<
        Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      return await myMonthService.updateTransaction(transactionId, transaction);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al actualizar transacción'
      );
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'myMonth/deleteTransaction',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      await myMonthService.deleteTransaction(transactionId);
      return transactionId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al eliminar transacción');
    }
  }
);
