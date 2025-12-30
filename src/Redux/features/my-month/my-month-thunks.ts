import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  myMonthService,
  getPreviousMonthPeriod,
} from '@/services/Firebase/my-month-service';
import type {
  Transaction,
  MonthlyLiquidityState,
  LiquiditySource,
} from './my-month-models';

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

        // Crear fuente por defecto "Neto"
        const defaultSource: LiquiditySource = {
          userId,
          name: 'Neto',
          expectedAmount: previousBalance,
          realAmount: null,
        };

        liquidity = await myMonthService.createOrUpdateMonthlyLiquidity(
          userId,
          monthPeriod,
          previousBalance,
          null,
          [defaultSource]
        );
      } else if (
        !liquidity.liquiditySources ||
        liquidity.liquiditySources.length === 0
      ) {
        // Si existe pero no tiene fuentes, crear una por defecto
        const defaultSource: LiquiditySource = {
          userId,
          name: 'Neto',
          expectedAmount: liquidity.expectedAmount,
          realAmount: liquidity.realAmount,
        };

        liquidity = await myMonthService.createOrUpdateMonthlyLiquidity(
          userId,
          monthPeriod,
          liquidity.expectedAmount,
          liquidity.realAmount,
          [defaultSource]
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

// ========== Liquidity Sources ==========
export const loadLiquiditySources = createAsyncThunk(
  'myMonth/loadLiquiditySources',
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
      return await myMonthService.getLiquiditySources(userId, monthPeriod);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al cargar fuentes de liquidez'
      );
    }
  }
);

export const createLiquiditySource = createAsyncThunk(
  'myMonth/createLiquiditySource',
  async (
    {
      userId,
      monthPeriod,
      source,
    }: {
      userId: string;
      monthPeriod: string;
      source: Omit<
        LiquiditySource,
        'id' | 'userId' | 'createdAt' | 'updatedAt'
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      const newSource = await myMonthService.createLiquiditySource(
        userId,
        monthPeriod,
        source
      );
      // Recargar el estado de liquidez completo
      const liquidity = await myMonthService.getMonthlyLiquidity(
        userId,
        monthPeriod
      );
      return { source: newSource, liquidity };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al crear fuente de liquidez'
      );
    }
  }
);

export const updateLiquiditySource = createAsyncThunk(
  'myMonth/updateLiquiditySource',
  async (
    {
      userId,
      monthPeriod,
      sourceId,
      source,
    }: {
      userId: string;
      monthPeriod: string;
      sourceId: string;
      source: Partial<
        Omit<LiquiditySource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      const updatedSource = await myMonthService.updateLiquiditySource(
        userId,
        monthPeriod,
        sourceId,
        source
      );
      // Recargar el estado de liquidez completo
      const liquidity = await myMonthService.getMonthlyLiquidity(
        userId,
        monthPeriod
      );
      return { source: updatedSource, liquidity };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al actualizar fuente de liquidez'
      );
    }
  }
);

export const deleteLiquiditySource = createAsyncThunk(
  'myMonth/deleteLiquiditySource',
  async (
    {
      userId,
      monthPeriod,
      sourceId,
    }: {
      userId: string;
      monthPeriod: string;
      sourceId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await myMonthService.deleteLiquiditySource(userId, monthPeriod, sourceId);
      // Recargar el estado de liquidez completo
      const liquidity = await myMonthService.getMonthlyLiquidity(
        userId,
        monthPeriod
      );
      return { sourceId, liquidity };
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al eliminar fuente de liquidez'
      );
    }
  }
);
