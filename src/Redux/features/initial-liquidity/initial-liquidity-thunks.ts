import { createAsyncThunk } from '@reduxjs/toolkit';
import { initialLiquidityService } from '@/services/Firebase/initial-liquidity-service';
import type { InitialLiquidity, InitialLiquidityResult } from './initial-liquidity-models';

// ========== Cargar liquidez inicial (obtener o calcular) ==========
export const loadInitialLiquidity = createAsyncThunk(
  'initialLiquidity/load',
  async (
    {
      userId,
      monthPeriod,
      calculate = true,
    }: {
      userId: string;
      monthPeriod: string;
      calculate?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      if (calculate) {
        const result = await initialLiquidityService.getOrCalculateInitialLiquidity(
          userId,
          monthPeriod
        );
        return result;
      } else {
        const liquidity = await initialLiquidityService.getInitialLiquidity(
          userId,
          monthPeriod
        );
        return {
          liquidity,
          calculatedAmount: liquidity?.amount ?? 0,
          wasCalculated: false,
        } as InitialLiquidityResult;
      }
    } catch (error: unknown) {
      console.error('Error en loadInitialLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar liquidez inicial'
      );
    }
  }
);

// ========== Crear o actualizar liquidez inicial ==========
export const saveInitialLiquidity = createAsyncThunk(
  'initialLiquidity/save',
  async (
    {
      userId,
      monthPeriod,
      amount,
      isManual = true,
    }: {
      userId: string;
      monthPeriod: string;
      amount: number;
      isManual?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const liquidity = await initialLiquidityService.createOrUpdateInitialLiquidity(
        userId,
        monthPeriod,
        amount,
        isManual
      );
      return liquidity;
    } catch (error: unknown) {
      console.error('Error en saveInitialLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al guardar liquidez inicial'
      );
    }
  }
);

// ========== Actualizar liquidez inicial ==========
export const updateInitialLiquidity = createAsyncThunk(
  'initialLiquidity/update',
  async (
    {
      userId,
      monthPeriod,
      amount,
    }: {
      userId: string;
      monthPeriod: string;
      amount: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const liquidity = await initialLiquidityService.updateInitialLiquidity(
        userId,
        monthPeriod,
        amount
      );
      return liquidity;
    } catch (error: unknown) {
      console.error('Error en updateInitialLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al actualizar liquidez inicial'
      );
    }
  }
);

// ========== Eliminar liquidez inicial ==========
export const deleteInitialLiquidity = createAsyncThunk(
  'initialLiquidity/delete',
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
      await initialLiquidityService.deleteInitialLiquidity(userId, monthPeriod);
      return { userId, monthPeriod };
    } catch (error: unknown) {
      console.error('Error en deleteInitialLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al eliminar liquidez inicial'
      );
    }
  }
);

// ========== Cargar historial de liquidez inicial ==========
export const loadInitialLiquidityHistory = createAsyncThunk(
  'initialLiquidity/loadHistory',
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
      const history = await initialLiquidityService.getInitialLiquidityHistory(
        userId,
        limit
      );
      return history;
    } catch (error: unknown) {
      console.error('Error en loadInitialLiquidityHistory:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar historial de liquidez inicial'
      );
    }
  }
);

// ========== Recalcular y guardar liquidez inicial ==========
export const recalculateInitialLiquidity = createAsyncThunk(
  'initialLiquidity/recalculate',
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
      const liquidity = await initialLiquidityService.recalculateAndSaveInitialLiquidity(
        userId,
        monthPeriod
      );
      return liquidity;
    } catch (error: unknown) {
      console.error('Error en recalculateInitialLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al recalcular liquidez inicial'
      );
    }
  }
);
