import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  myMonthService,
  getPreviousMonthPeriod,
} from '@/services/Firebase/my-month-service';
import type { Transaction, LiquiditySource } from './my-month-models';

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
    } catch (error: unknown) {
      console.error('Error en loadTransactions:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar transacciones'
      );
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
    } catch (error: unknown) {
      console.error('Error en createTransaction:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al crear transacción'
      );
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
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || 'Error al actualizar transacción'
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
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || 'Error al eliminar transacción'
      );
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
      dayOfMonth,
    }: {
      userId: string;
      monthPeriod: string;
      dayOfMonth?: number;
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

        // Crear sin fuentes, el usuario las agregará
        liquidity = await myMonthService.createOrUpdateMonthlyLiquidity(
          userId,
          monthPeriod,
          previousBalance,
          null,
          [],
          undefined,
          undefined,
          dayOfMonth
        );
      } else if (
        !liquidity.liquiditySources ||
        liquidity.liquiditySources.length === 0
      ) {
        // Si existe pero no tiene fuentes, mantener el expectedAmount del mes anterior
        // No crear fuente "Neto", el usuario agregará sus propias fuentes
        const previousPeriod = getPreviousMonthPeriod(monthPeriod);
        const previousBalance = await myMonthService.calculateMonthBalance(
          userId,
          previousPeriod
        );

        liquidity = await myMonthService.createOrUpdateMonthlyLiquidity(
          userId,
          monthPeriod,
          previousBalance,
          null,
          [],
          undefined,
          undefined,
          dayOfMonth
        );
      } else {
        // Si ya tiene fuentes, verificar si alguna tiene valor real
        // Si todas las fuentes tienen valor real, no actualizar desde el mes anterior
        const hasAnyRealAmount = liquidity.liquiditySources.some(
          (s) => s.realAmount !== null
        );

        // Si no hay valores reales y el expectedAmount coincide con el mes anterior, actualizar
        if (!hasAnyRealAmount) {
          const previousPeriod = getPreviousMonthPeriod(monthPeriod);
          const previousBalance = await myMonthService.calculateMonthBalance(
            userId,
            previousPeriod
          );

          // Solo actualizar si el expectedAmount actual es igual al del mes anterior
          // (significa que aún no ha sido modificado por el usuario)
          if (liquidity.expectedAmount === previousBalance) {
            // Actualizar las fuentes con el nuevo valor del mes anterior
            const updatedSources = liquidity.liquiditySources.map((s) => ({
              ...s,
              expectedAmount: previousBalance,
            }));

            liquidity = await myMonthService.createOrUpdateMonthlyLiquidity(
              userId,
              monthPeriod,
              previousBalance,
              null,
              updatedSources,
              undefined,
              undefined,
              dayOfMonth
            );
          }
        }
        // Si hay valores reales, no hacer nada - respetar lo que el usuario ingresó
      }

      // Actualizar balances después de cargar
      if (liquidity && dayOfMonth) {
        liquidity = await myMonthService.updateMonthBalances(
          userId,
          monthPeriod,
          dayOfMonth
        );
      }

      return liquidity;
    } catch (error: unknown) {
      console.error('Error en loadMonthlyLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar estado de liquidez'
      );
    }
  }
);

// Thunk para actualizar balances del mes
export const updateMonthBalances = createAsyncThunk(
  'myMonth/updateMonthBalances',
  async (
    {
      userId,
      monthPeriod,
      dayOfMonth,
    }: {
      userId: string;
      monthPeriod: string;
      dayOfMonth?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const liquidity = await myMonthService.updateMonthBalances(
        userId,
        monthPeriod,
        dayOfMonth
      );
      return liquidity;
    } catch (error: unknown) {
      console.error('Error en updateMonthBalances:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al actualizar balances del mes'
      );
    }
  }
);

// Cargar periodo por fecha actual
export const loadMonthlyLiquidityByDate = createAsyncThunk(
  'myMonth/loadMonthlyLiquidityByDate',
  async (
    {
      userId,
      dayOfMonth,
    }: {
      userId: string;
      dayOfMonth: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const today = new Date();
      let liquidity = await myMonthService.getMonthlyLiquidityByDate(
        userId,
        today,
        dayOfMonth
      );

      // Si no existe, crear uno
      if (!liquidity) {
        // Calcular el periodo actual
        const [year, month] = [today.getFullYear(), today.getMonth() + 1];
        const monthPeriod = `${year}-${String(month).padStart(2, '0')}`;
        const previousPeriod = getPreviousMonthPeriod(monthPeriod);
        const previousBalance = await myMonthService.calculateMonthBalance(
          userId,
          previousPeriod
        );

        liquidity = await myMonthService.createOrUpdateMonthlyLiquidity(
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

      return liquidity;
    } catch (error: unknown) {
      console.error('Error en loadMonthlyLiquidityByDate:', error);
      return rejectWithValue(
        (error as Error).message ||
          'Error al cargar estado de liquidez por fecha'
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

      // Usar el ID existente para actualizar
      return await myMonthService.createOrUpdateMonthlyLiquidity(
        userId,
        monthPeriod,
        liquidity.expectedAmount,
        realAmount,
        liquidity.liquiditySources // Mantener las fuentes existentes
      );
    } catch (error: unknown) {
      console.error('Error en updateMonthlyLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al actualizar estado de liquidez'
      );
    }
  }
);

export const updateMonthlyLiquidityWithSources = createAsyncThunk(
  'myMonth/updateMonthlyLiquidityWithSources',
  async (
    {
      userId,
      monthPeriod,
      realAmount,
      liquiditySources,
    }: {
      userId: string;
      monthPeriod: string;
      realAmount: number | null;
      liquiditySources: LiquiditySource[];
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
          realAmount,
          liquiditySources
        );
      }

      // Usar el ID existente para actualizar
      return await myMonthService.createOrUpdateMonthlyLiquidity(
        userId,
        monthPeriod,
        liquidity.expectedAmount, // Mantener el expectedAmount calculado
        realAmount,
        liquiditySources
      );
    } catch (error: unknown) {
      console.error('Error en updateMonthlyLiquidityWithSources:', error);
      return rejectWithValue(
        (error as Error).message ||
          'Error al actualizar estado de liquidez con fuentes'
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
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || 'Error al cargar fuentes de liquidez'
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
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || 'Error al crear fuente de liquidez'
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
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || 'Error al actualizar fuente de liquidez'
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
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || 'Error al eliminar fuente de liquidez'
      );
    }
  }
);
