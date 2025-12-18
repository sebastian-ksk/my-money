import { createAsyncThunk } from '@reduxjs/toolkit';
import { configMyMoneyService } from '@/services/Firebase/config-my-money-service';
import type {
  UserConfig,
  ExpenseCategory,
  FixedExpense,
  ExpectedIncome,
  BalanceSource,
  SavingsSource,
} from './config-my-money-models';

// ========== User Config ==========
export const loadUserConfig = createAsyncThunk(
  'configMyMoney/loadUserConfig',
  async (userId: string, { rejectWithValue }) => {
    try {
      const config = await configMyMoneyService.getUserConfig(userId);
      return (
        config ||
        ({
          userId,
          monthResetDay: 1,
          currency: 'COP',
        } as UserConfig)
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al cargar configuración');
    }
  }
);

export const saveUserConfig = createAsyncThunk(
  'configMyMoney/saveUserConfig',
  async (
    {
      userId,
      config,
    }: {
      userId: string;
      config: Omit<UserConfig, 'userId' | 'createdAt' | 'updatedAt'>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.createOrUpdateUserConfig(
        userId,
        config
      );
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al guardar configuración');
    }
  }
);

// ========== Expense Categories ==========
export const loadExpenseCategories = createAsyncThunk(
  'configMyMoney/loadExpenseCategories',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await configMyMoneyService.getExpenseCategories(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al cargar categorías');
    }
  }
);

export const createExpenseCategory = createAsyncThunk(
  'configMyMoney/createExpenseCategory',
  async (
    { userId, name }: { userId: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.createExpenseCategory(userId, name);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al crear categoría');
    }
  }
);

export const updateExpenseCategory = createAsyncThunk(
  'configMyMoney/updateExpenseCategory',
  async (
    { categoryId, name }: { categoryId: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.updateExpenseCategory(categoryId, name);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al actualizar categoría');
    }
  }
);

export const deleteExpenseCategory = createAsyncThunk(
  'configMyMoney/deleteExpenseCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      await configMyMoneyService.deleteExpenseCategory(categoryId);
      return categoryId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al eliminar categoría');
    }
  }
);

// ========== Fixed Expenses ==========
export const loadFixedExpenses = createAsyncThunk(
  'configMyMoney/loadFixedExpenses',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await configMyMoneyService.getFixedExpenses(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al cargar gastos fijos');
    }
  }
);

export const createFixedExpense = createAsyncThunk(
  'configMyMoney/createFixedExpense',
  async (
    {
      userId,
      expense,
    }: {
      userId: string;
      expense: Omit<FixedExpense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.createFixedExpense(userId, expense);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al crear gasto fijo');
    }
  }
);

export const updateFixedExpense = createAsyncThunk(
  'configMyMoney/updateFixedExpense',
  async (
    {
      expenseId,
      expense,
    }: {
      expenseId: string;
      expense: Partial<
        Omit<FixedExpense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.updateFixedExpense(expenseId, expense);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al actualizar gasto fijo');
    }
  }
);

export const deleteFixedExpense = createAsyncThunk(
  'configMyMoney/deleteFixedExpense',
  async (expenseId: string, { rejectWithValue }) => {
    try {
      await configMyMoneyService.deleteFixedExpense(expenseId);
      return expenseId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al eliminar gasto fijo');
    }
  }
);

// ========== Expected Incomes ==========
export const loadExpectedIncomes = createAsyncThunk(
  'configMyMoney/loadExpectedIncomes',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await configMyMoneyService.getExpectedIncomes(userId);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al cargar ingresos esperados'
      );
    }
  }
);

export const createExpectedIncome = createAsyncThunk(
  'configMyMoney/createExpectedIncome',
  async (
    {
      userId,
      income,
    }: {
      userId: string;
      income: Omit<ExpectedIncome, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.createExpectedIncome(userId, income);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al crear ingreso esperado'
      );
    }
  }
);

export const updateExpectedIncome = createAsyncThunk(
  'configMyMoney/updateExpectedIncome',
  async (
    {
      incomeId,
      income,
    }: {
      incomeId: string;
      income: Partial<
        Omit<ExpectedIncome, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.updateExpectedIncome(incomeId, income);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al actualizar ingreso esperado'
      );
    }
  }
);

export const deleteExpectedIncome = createAsyncThunk(
  'configMyMoney/deleteExpectedIncome',
  async (incomeId: string, { rejectWithValue }) => {
    try {
      await configMyMoneyService.deleteExpectedIncome(incomeId);
      return incomeId;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al eliminar ingreso esperado'
      );
    }
  }
);

// ========== Balance Sources (Líquido) ==========
export const loadBalanceSources = createAsyncThunk(
  'configMyMoney/loadBalanceSources',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await configMyMoneyService.getBalanceSources(userId);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al cargar fuentes de balance'
      );
    }
  }
);

export const createBalanceSource = createAsyncThunk(
  'configMyMoney/createBalanceSource',
  async (
    {
      userId,
      source,
    }: {
      userId: string;
      source: Omit<BalanceSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.createBalanceSource(userId, source);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al crear fuente de balance'
      );
    }
  }
);

export const updateBalanceSource = createAsyncThunk(
  'configMyMoney/updateBalanceSource',
  async (
    {
      sourceId,
      source,
    }: {
      sourceId: string;
      source: Partial<
        Omit<BalanceSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.updateBalanceSource(sourceId, source);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al actualizar fuente de balance'
      );
    }
  }
);

export const deleteBalanceSource = createAsyncThunk(
  'configMyMoney/deleteBalanceSource',
  async (sourceId: string, { rejectWithValue }) => {
    try {
      await configMyMoneyService.deleteBalanceSource(sourceId);
      return sourceId;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al eliminar fuente de balance'
      );
    }
  }
);

// ========== Savings Sources (Ahorro) ==========
export const loadSavingsSources = createAsyncThunk(
  'configMyMoney/loadSavingsSources',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await configMyMoneyService.getSavingsSources(userId);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al cargar fuentes de ahorro'
      );
    }
  }
);

export const createSavingsSource = createAsyncThunk(
  'configMyMoney/createSavingsSource',
  async (
    {
      userId,
      source,
    }: {
      userId: string;
      source: Omit<SavingsSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.createSavingsSource(userId, source);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al crear fuente de ahorro'
      );
    }
  }
);

export const updateSavingsSource = createAsyncThunk(
  'configMyMoney/updateSavingsSource',
  async (
    {
      sourceId,
      source,
    }: {
      sourceId: string;
      source: Partial<
        Omit<SavingsSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
      >;
    },
    { rejectWithValue }
  ) => {
    try {
      return await configMyMoneyService.updateSavingsSource(sourceId, source);
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al actualizar fuente de ahorro'
      );
    }
  }
);

export const deleteSavingsSource = createAsyncThunk(
  'configMyMoney/deleteSavingsSource',
  async (sourceId: string, { rejectWithValue }) => {
    try {
      await configMyMoneyService.deleteSavingsSource(sourceId);
      return sourceId;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al eliminar fuente de ahorro'
      );
    }
  }
);
