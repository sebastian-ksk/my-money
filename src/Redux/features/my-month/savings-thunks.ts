import { createAsyncThunk } from '@reduxjs/toolkit';
import { savingsService } from '@/services/Firebase/savings-service';
import type { Transaction } from './my-month-models';
import type { SavingsSource } from '@/Redux/features/config-my-money/config-my-money-models';

interface SavingsTransactionInput {
  userId: string;
  monthPeriod: string;
  savingsSourceId: string;
  originSource: string;
  value: number;
  concept?: string;
  date?: Date;
}

interface SavingsTransactionUpdate {
  transactionId: string;
  value?: number;
  originSource?: string;
  concept?: string;
  date?: Date;
}

interface SavingsResponse {
  transactions: Transaction[];
  totalSavings: number;
}

interface SavingsSourcesResponse {
  sources: SavingsSource[];
  totalBalance: number;
}

// ========== Cargar transacciones de ahorro ==========
export const loadSavingsTransactions = createAsyncThunk<
  SavingsResponse,
  { userId: string; monthPeriod?: string }
>(
  'myMonth/loadSavingsTransactions',
  async ({ userId, monthPeriod }, { rejectWithValue }) => {
    try {
      let transactions: Transaction[];
      let totalSavings: number;

      if (monthPeriod) {
        transactions = await savingsService.getSavingsTransactions(userId, monthPeriod);
        totalSavings = await savingsService.getTotalSavingsForPeriod(userId, monthPeriod);
      } else {
        transactions = await savingsService.getAllSavingsTransactions(userId);
        totalSavings = await savingsService.getTotalSavingsBalance(userId);
      }

      return { transactions, totalSavings };
    } catch (error) {
      console.error('Error al cargar transacciones de ahorro:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar transacciones de ahorro'
      );
    }
  }
);

// ========== Crear transacción de ahorro ==========
export const createSavingsTransaction = createAsyncThunk<
  Transaction,
  SavingsTransactionInput
>(
  'myMonth/createSavingsTransaction',
  async (input, { rejectWithValue }) => {
    try {
      console.log('createSavingsTransaction thunk ejecutado:', input);
      const transaction = await savingsService.createSavingsTransaction(input);
      console.log('transacción de ahorro creada:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error al crear transacción de ahorro:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al crear transacción de ahorro'
      );
    }
  }
);

// ========== Actualizar transacción de ahorro ==========
export const updateSavingsTransaction = createAsyncThunk<
  Transaction,
  SavingsTransactionUpdate
>(
  'myMonth/updateSavingsTransaction',
  async (input, { rejectWithValue }) => {
    try {
      const { transactionId, ...updates } = input;
      const transaction = await savingsService.updateSavingsTransaction(transactionId, updates);
      return transaction;
    } catch (error) {
      console.error('Error al actualizar transacción de ahorro:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al actualizar transacción de ahorro'
      );
    }
  }
);

// ========== Eliminar transacción de ahorro ==========
export const deleteSavingsTransaction = createAsyncThunk<
  string,
  string
>(
  'myMonth/deleteSavingsTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      await savingsService.deleteSavingsTransaction(transactionId);
      return transactionId;
    } catch (error) {
      console.error('Error al eliminar transacción de ahorro:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al eliminar transacción de ahorro'
      );
    }
  }
);

// ========== Cargar fuentes de ahorro con balance ==========
export const loadSavingsSourcesWithBalance = createAsyncThunk<
  SavingsSourcesResponse,
  string
>(
  'myMonth/loadSavingsSourcesWithBalance',
  async (userId, { rejectWithValue }) => {
    try {
      const sources = await savingsService.getSavingsSourcesWithBalance(userId);
      const totalBalance = await savingsService.getTotalSavingsBalance(userId);
      return { sources, totalBalance };
    } catch (error) {
      console.error('Error al cargar fuentes de ahorro:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar fuentes de ahorro'
      );
    }
  }
);

// ========== Recalcular balance de fuente ==========
export const recalculateSavingsSourceBalance = createAsyncThunk<
  SavingsSource,
  string
>(
  'myMonth/recalculateSavingsSourceBalance',
  async (savingsSourceId, { rejectWithValue }) => {
    try {
      const source = await savingsService.recalculateSavingsSourceBalance(savingsSourceId);
      return source;
    } catch (error) {
      console.error('Error al recalcular balance:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al recalcular balance'
      );
    }
  }
);
