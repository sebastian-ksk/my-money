import { createAsyncThunk } from '@reduxjs/toolkit';
import { monthlyLiquidityService } from '@/services/Firebase/monthly-liquidity-service';
import { initialLiquidityService } from '@/services/Firebase/initial-liquidity-service';
import { myMonthService } from '@/services/Firebase/my-month-service';
import type { LiquiditySource, MonthlyLiquidityState } from './my-month-models';

// ========== Cargar liquidez mensual ==========
export const loadMonthlyLiquidityNew = createAsyncThunk(
  'myMonth/loadMonthlyLiquidityNew',
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
      let liquidity = await monthlyLiquidityService.getMonthlyLiquidity(
        userId,
        monthPeriod
      );

      // Si no existe, crear con valores iniciales
      if (!liquidity) {
        liquidity = await monthlyLiquidityService.createOrUpdateMonthlyLiquidity(
          userId,
          monthPeriod,
          {
            expectedAmount: 0,
            realAmount: null,
            liquiditySources: [],
            totalExpenses: 0,
            totalIncomes: 0,
            finalBalance: 0,
            dayOfMonth,
          }
        );
      }

      return liquidity;
    } catch (error: unknown) {
      console.error('Error en loadMonthlyLiquidityNew:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar liquidez mensual'
      );
    }
  }
);

// ========== Actualizar balances del mes ==========
export const updateMonthlyBalances = createAsyncThunk(
  'myMonth/updateMonthlyBalances',
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
      // Obtener liquidez inicial
      const initialResult = await initialLiquidityService.getOrCalculateInitialLiquidity(
        userId,
        monthPeriod
      );
      const initialLiquidity = initialResult.effectiveAmount;

      // Obtener transacciones del mes
      const transactions = await myMonthService.getTransactions(userId, monthPeriod);

      // Actualizar balances
      const liquidity = await monthlyLiquidityService.updateBalances(
        userId,
        monthPeriod,
        initialLiquidity,
        transactions.map((t) => ({ type: t.type, value: t.value }))
      );

      return liquidity;
    } catch (error: unknown) {
      console.error('Error en updateMonthlyBalances:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al actualizar balances'
      );
    }
  }
);

// ========== Actualizar liquidez mensual con data ==========
export const updateMonthlyLiquidityData = createAsyncThunk(
  'myMonth/updateMonthlyLiquidityData',
  async (
    {
      userId,
      monthPeriod,
      data,
    }: {
      userId: string;
      monthPeriod: string;
      data: {
        expectedAmount?: number;
        realAmount?: number | null;
        totalExpenses?: number;
        totalIncomes?: number;
        finalBalance?: number;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const liquidity = await monthlyLiquidityService.createOrUpdateMonthlyLiquidity(
        userId,
        monthPeriod,
        data
      );
      return liquidity;
    } catch (error: unknown) {
      console.error('Error en updateMonthlyLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al actualizar liquidez mensual'
      );
    }
  }
);

// ========== Agregar fuente de liquidez ==========
export const addLiquiditySourceNew = createAsyncThunk(
  'myMonth/addLiquiditySourceNew',
  async (
    {
      userId,
      monthPeriod,
      source,
    }: {
      userId: string;
      monthPeriod: string;
      source: Omit<LiquiditySource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
    },
    { rejectWithValue }
  ) => {
    try {
      const liquidity = await monthlyLiquidityService.addLiquiditySource(
        userId,
        monthPeriod,
        source
      );
      return liquidity;
    } catch (error: unknown) {
      console.error('Error en addLiquiditySourceNew:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al agregar fuente de liquidez'
      );
    }
  }
);

// ========== Actualizar fuente de liquidez ==========
export const updateLiquiditySourceNew = createAsyncThunk(
  'myMonth/updateLiquiditySourceNew',
  async (
    {
      userId,
      monthPeriod,
      sourceId,
      updates,
    }: {
      userId: string;
      monthPeriod: string;
      sourceId: string;
      updates: Partial<Omit<LiquiditySource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
    },
    { rejectWithValue }
  ) => {
    try {
      const liquidity = await monthlyLiquidityService.updateLiquiditySource(
        userId,
        monthPeriod,
        sourceId,
        updates
      );
      return liquidity;
    } catch (error: unknown) {
      console.error('Error en updateLiquiditySourceNew:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al actualizar fuente de liquidez'
      );
    }
  }
);

// ========== Eliminar fuente de liquidez ==========
export const deleteLiquiditySourceNew = createAsyncThunk(
  'myMonth/deleteLiquiditySourceNew',
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
      const liquidity = await monthlyLiquidityService.deleteLiquiditySource(
        userId,
        monthPeriod,
        sourceId
      );
      return liquidity;
    } catch (error: unknown) {
      console.error('Error en deleteLiquiditySourceNew:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al eliminar fuente de liquidez'
      );
    }
  }
);

// ========== Cargar historial ==========
export const loadMonthlyLiquidityHistory = createAsyncThunk(
  'myMonth/loadMonthlyLiquidityHistory',
  async (
    {
      userId,
      limit = 12,
    }: {
      userId: string;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const history = await monthlyLiquidityService.getHistory(userId, limit);
      return history;
    } catch (error: unknown) {
      console.error('Error en loadMonthlyLiquidityHistory:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar historial'
      );
    }
  }
);
