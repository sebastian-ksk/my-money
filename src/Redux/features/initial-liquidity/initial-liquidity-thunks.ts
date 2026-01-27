import { createAsyncThunk } from '@reduxjs/toolkit';
import { initialLiquidityService } from '@/services/Firebase/initial-liquidity-service';
import type { InitialLiquidityResult } from './initial-liquidity-models';

// ========== Cargar liquidez inicial (obtener o calcular) ==========
export const loadInitialLiquidity = createAsyncThunk(
  'initialLiquidity/load',
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
      const result = await initialLiquidityService.getOrCalculateInitialLiquidity(
        userId,
        monthPeriod
      );
      return result;
    } catch (error: unknown) {
      console.error('Error en loadInitialLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al cargar liquidez inicial'
      );
    }
  }
);

// ========== Guardar realAmount (valor manual del usuario) ==========
export const saveInitialLiquidity = createAsyncThunk(
  'initialLiquidity/save',
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
      const liquidity = await initialLiquidityService.updateRealAmount(
        userId,
        monthPeriod,
        amount
      );
      return {
        liquidity,
        effectiveAmount: amount,
        wasCalculated: false,
      } as InitialLiquidityResult;
    } catch (error: unknown) {
      console.error('Error en saveInitialLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al guardar liquidez inicial'
      );
    }
  }
);

// ========== Limpiar realAmount (volver a usar calculado) ==========
export const clearInitialLiquidity = createAsyncThunk(
  'initialLiquidity/clear',
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
      const liquidity = await initialLiquidityService.clearRealAmount(
        userId,
        monthPeriod
      );
      return {
        liquidity,
        effectiveAmount: liquidity.calculatedAmount,
        wasCalculated: true,
      } as InitialLiquidityResult;
    } catch (error: unknown) {
      console.error('Error en clearInitialLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al limpiar liquidez inicial'
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

// ========== Recalcular el calculatedAmount ==========
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
      const liquidity = await initialLiquidityService.recalculateInitialLiquidity(
        userId,
        monthPeriod
      );
      const effectiveAmount = liquidity.realAmount ?? liquidity.calculatedAmount;
      return {
        liquidity,
        effectiveAmount,
        wasCalculated: liquidity.realAmount === null,
      } as InitialLiquidityResult;
    } catch (error: unknown) {
      console.error('Error en recalculateInitialLiquidity:', error);
      return rejectWithValue(
        (error as Error).message || 'Error al recalcular liquidez inicial'
      );
    }
  }
);
