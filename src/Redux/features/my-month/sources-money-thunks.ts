import { createAsyncThunk } from '@reduxjs/toolkit';
import { sourcesMoneyService } from '@/services/Firebase/sources-money-service';
import type { MoneySource } from './my-month-models';

// ========== Money Sources ==========
export const loadSourcesByPeriod = createAsyncThunk(
  'myMonth/loadSourcesByPeriod',
  async (
    {
      userId,
      periodId,
    }: {
      userId: string;
      periodId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await sourcesMoneyService.getSourcesByPeriod(userId, periodId);
    } catch (error: unknown) {
      return rejectWithValue(
        (error as Error).message || 'Error al cargar fuentes de dinero'
      );
    }
  }
);

export const loadAllSources = createAsyncThunk(
  'myMonth/loadAllSources',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await sourcesMoneyService.getAllSources(userId);
    } catch (error: unknown) {
      return rejectWithValue(
        error.message || 'Error al cargar todas las fuentes'
      );
    }
  }
);

export const createMoneySource = createAsyncThunk(
  'myMonth/createMoneySource',
  async (
    {
      source,
    }: {
      source: Omit<MoneySource, 'id' | 'createdAt' | 'updatedAt'>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await sourcesMoneyService.createSource(source);
    } catch (error: unknown) {
      return rejectWithValue(
        error.message || 'Error al crear fuente de dinero'
      );
    }
  }
);

export const updateMoneySource = createAsyncThunk(
  'myMonth/updateMoneySource',
  async (
    {
      sourceId,
      source,
    }: {
      sourceId: string;
      source: Partial<
        Omit<MoneySource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      return await sourcesMoneyService.updateSource(sourceId, source);
    } catch (error: unknown) {
      return rejectWithValue(
        error.message || 'Error al actualizar fuente de dinero'
      );
    }
  }
);

export const deleteMoneySource = createAsyncThunk(
  'myMonth/deleteMoneySource',
  async (sourceId: string, { rejectWithValue }) => {
    try {
      await sourcesMoneyService.deleteSource(sourceId);
      return sourceId;
    } catch (error: unknown) {
      return rejectWithValue(
        error.message || 'Error al eliminar fuente de dinero'
      );
    }
  }
);

export const loadPreviousMonthSources = createAsyncThunk(
  'myMonth/loadPreviousMonthSources',
  async (
    {
      userId,
      currentPeriodId,
    }: {
      userId: string;
      currentPeriodId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await sourcesMoneyService.getPreviousMonthSources(
        userId,
        currentPeriodId
      );
    } catch (error: unknown) {
      return rejectWithValue(
        error.message || 'Error al cargar fuentes del mes anterior'
      );
    }
  }
);

