import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  myMonthService,
  getPreviousMonthPeriod,
} from '@/services/Firebase/my-month-service';
import type { Transaction, MonthlyLiquidityState } from './my-month-models';

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

// ========== Monthly Liquidity States ==========
export const loadMonthlyLiquidity = createAsyncThunk(
  'myMonth/loadMonthlyLiquidity',
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
      let liquidity = await myMonthService.getMonthlyLiquidity(
        userId,
        monthPeriod
      );

      // Si no existe, crear uno con el expectedAmount del mes anterior
      if (!liquidity) {
        const previousPeriod = getPreviousMonthPeriod(monthPeriod);
        const previousBalance = await myMonthService.calculateMonthBalance(
          userId,
          previousPeriod
        );

        liquidity = await myMonthService.createOrUpdateMonthlyLiquidity(
          userId,
          monthPeriod,
          previousBalance,
          null
        );
      }

      return liquidity;
    } catch (error: any) {
      console.error('Error en loadMonthlyLiquidity:', error);
      return rejectWithValue(
        error.message || 'Error al cargar estado de liquidez'
      );
    }
  }
);

export const updateMonthlyLiquidity = createAsyncThunk(
  'myMonth/updateMonthlyLiquidity',
  async (
    {
      userId,
      monthPeriod,
      realAmount,
    }: {
      userId: string;
      monthPeriod: string;
      realAmount: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const liquidity = await myMonthService.getMonthlyLiquidity(
        userId,
        monthPeriod
      );

      if (!liquidity) {
        // Si no existe, crear uno
        const previousPeriod = getPreviousMonthPeriod(monthPeriod);
        const previousBalance = await myMonthService.calculateMonthBalance(
          userId,
          previousPeriod
        );

        return await myMonthService.createOrUpdateMonthlyLiquidity(
          userId,
          monthPeriod,
          previousBalance,
          realAmount
        );
      }

      return await myMonthService.createOrUpdateMonthlyLiquidity(
        userId,
        monthPeriod,
        liquidity.expectedAmount,
        realAmount
      );
    } catch (error: any) {
      console.error('Error en updateMonthlyLiquidity:', error);
      return rejectWithValue(
        error.message || 'Error al actualizar estado de liquidez'
      );
    }
  }
);
