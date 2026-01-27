import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  loadTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  loadMonthlyLiquidity,
  loadMonthlyLiquidityByDate,
  updateMonthlyLiquidity,
  updateMonthlyLiquidityWithSources,
  createLiquiditySource,
  updateLiquiditySource,
  deleteLiquiditySource,
} from './my-month-thunks';
import {
  loadMonthlyLiquidityNew,
  updateMonthlyBalances,
  updateMonthlyLiquidityData,
  addLiquiditySourceNew,
  updateLiquiditySourceNew,
  deleteLiquiditySourceNew,
} from './monthly-liquidity-thunks';
import {
  loadSourcesByPeriod,
  loadAllSources,
  createMoneySource,
  updateMoneySource,
  deleteMoneySource,
  loadPreviousMonthSources,
} from './sources-money-thunks';
import {
  loadSavingsTransactions,
  createSavingsTransaction,
  updateSavingsTransaction,
  deleteSavingsTransaction,
  loadSavingsSourcesWithBalance,
} from './savings-thunks';
import { logoutUser } from '../auth/auth-thunks';
import type { MyMonthState } from './my-month-models';

const currentDate = new Date();
const initialState: MyMonthState = {
  transactions: [],
  monthlyLiquidity: null,
  moneySources: [],
  totalSavings: 0,
  totalSavingsBalance: 0,
  loading: false,
  error: null,
  currentMonthPeriod: null,
  selectedMonth: currentDate.getMonth(),
  selectedYear: currentDate.getFullYear(),
  isInitialized: false,
};

const myMonthSlice = createSlice({
  name: 'myMonth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentMonthPeriod: (state, action: PayloadAction<string>) => {
      state.currentMonthPeriod = action.payload;
    },
    setSelectedMonth: (state, action: PayloadAction<number>) => {
      state.selectedMonth = action.payload;
      state.isInitialized = true;
    },
    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
      state.isInitialized = true;
    },
    setSelectedMonthAndYear: (
      state,
      action: PayloadAction<{ month: number; year: number }>
    ) => {
      state.selectedMonth = action.payload.month;
      state.selectedYear = action.payload.year;
      state.isInitialized = true;
    },
    initializeSelectedMonth: (
      state,
      action: PayloadAction<{ month: number; year: number }>
    ) => {
      if (!state.isInitialized) {
        state.selectedMonth = action.payload.month;
        state.selectedYear = action.payload.year;
        state.isInitialized = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Transactions
      .addCase(loadTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(loadTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        // Solo agregar si no existe ya (evitar duplicados)
        const exists = state.transactions.some(
          (t) => t.id === action.payload.id
        );
        if (!exists) {
          state.transactions.push(action.payload);
        }
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      // Delete Transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.meta.arg
        );
      })
      // Load Monthly Liquidity
      .addCase(loadMonthlyLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMonthlyLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyLiquidity = action.payload;
      })
      .addCase(loadMonthlyLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load Monthly Liquidity By Date
      .addCase(loadMonthlyLiquidityByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMonthlyLiquidityByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyLiquidity = action.payload;
      })
      .addCase(loadMonthlyLiquidityByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Monthly Liquidity
      .addCase(updateMonthlyLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMonthlyLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyLiquidity = action.payload;
      })
      .addCase(updateMonthlyLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Monthly Liquidity With Sources
      .addCase(updateMonthlyLiquidityWithSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMonthlyLiquidityWithSources.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyLiquidity = action.payload;
      })
      .addCase(updateMonthlyLiquidityWithSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Liquidity Source
      .addCase(createLiquiditySource.fulfilled, (state, action) => {
        if (action.payload.liquidity) {
          state.monthlyLiquidity = action.payload.liquidity;
        }
      })
      // Update Liquidity Source
      .addCase(updateLiquiditySource.fulfilled, (state, action) => {
        if (action.payload.liquidity) {
          state.monthlyLiquidity = action.payload.liquidity;
        }
      })
      // Delete Liquidity Source
      .addCase(deleteLiquiditySource.fulfilled, (state, action) => {
        if (action.payload.liquidity) {
          state.monthlyLiquidity = action.payload.liquidity;
        }
      })
      // Load Sources By Period
      .addCase(loadSourcesByPeriod.fulfilled, (state, action) => {
        state.moneySources = action.payload;
      })
      // Load All Sources
      .addCase(loadAllSources.fulfilled, (state, action) => {
        state.moneySources = action.payload;
      })
      // Create Money Source
      .addCase(createMoneySource.fulfilled, (state, action) => {
        state.moneySources.push(action.payload);
      })
      // Update Money Source
      .addCase(updateMoneySource.fulfilled, (state, action) => {
        const index = state.moneySources.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.moneySources[index] = action.payload;
        }
      })
      // Delete Money Source
      .addCase(deleteMoneySource.fulfilled, (state, action) => {
        state.moneySources = state.moneySources.filter(
          (s) => s.id !== action.meta.arg
        );
      })
      // Load Previous Month Sources
      .addCase(loadPreviousMonthSources.fulfilled, () => {
        // No actualizar el estado, solo se usa para obtener datos del mes anterior
      })
      // ========== NEW Monthly Liquidity Thunks ==========
      // Load Monthly Liquidity New
      .addCase(loadMonthlyLiquidityNew.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMonthlyLiquidityNew.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyLiquidity = action.payload;
      })
      .addCase(loadMonthlyLiquidityNew.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Monthly Balances
      .addCase(updateMonthlyBalances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMonthlyBalances.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyLiquidity = action.payload;
      })
      .addCase(updateMonthlyBalances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Monthly Liquidity Data
      .addCase(updateMonthlyLiquidityData.fulfilled, (state, action) => {
        state.monthlyLiquidity = action.payload;
      })
      // Add Liquidity Source New
      .addCase(addLiquiditySourceNew.fulfilled, (state, action) => {
        state.monthlyLiquidity = action.payload;
      })
      // Update Liquidity Source New
      .addCase(updateLiquiditySourceNew.fulfilled, (state, action) => {
        state.monthlyLiquidity = action.payload;
      })
      // Delete Liquidity Source New
      .addCase(deleteLiquiditySourceNew.fulfilled, (state, action) => {
        state.monthlyLiquidity = action.payload;
      })
      // ========== Savings Thunks ==========
      // Load Savings Transactions
      .addCase(loadSavingsTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSavingsTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.totalSavings = action.payload.totalSavings;
      })
      .addCase(loadSavingsTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error al cargar ahorros';
      })
      // Create Savings Transaction
      .addCase(createSavingsTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSavingsTransaction.fulfilled, (state, action) => {
        state.loading = false;
        // Agregar la transacción a la lista si no existe
        const exists = state.transactions.some(
          (t) => t.id === action.payload.id
        );
        if (!exists) {
          state.transactions.push(action.payload);
        }
        // Actualizar total de ahorros
        state.totalSavings += action.payload.value;
      })
      .addCase(createSavingsTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error al crear ahorro';
      })
      // Update Savings Transaction
      .addCase(updateSavingsTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          // Ajustar el total de ahorros
          const oldValue = state.transactions[index].value;
          state.totalSavings = state.totalSavings - oldValue + action.payload.value;
          state.transactions[index] = action.payload;
        }
      })
      // Delete Savings Transaction
      .addCase(deleteSavingsTransaction.fulfilled, (state, action) => {
        const transaction = state.transactions.find(
          (t) => t.id === action.payload
        );
        if (transaction) {
          state.totalSavings -= transaction.value;
        }
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.payload
        );
      })
      // Load Savings Sources With Balance
      .addCase(loadSavingsSourcesWithBalance.fulfilled, (state, action) => {
        state.totalSavingsBalance = action.payload.totalBalance;
      })
      // Reset on logout
      .addCase(logoutUser.fulfilled, () => {
        const currentDate = new Date();
        return {
          transactions: [],
          monthlyLiquidity: null,
          moneySources: [],
          totalSavings: 0,
          totalSavingsBalance: 0,
          loading: false,
          error: null,
          currentMonthPeriod: null,
          selectedMonth: currentDate.getMonth(),
          selectedYear: currentDate.getFullYear(),
          isInitialized: false,
        };
      });
  },
});

export const {
  clearError,
  setCurrentMonthPeriod,
  setSelectedMonth,
  setSelectedYear,
  setSelectedMonthAndYear,
  initializeSelectedMonth,
} = myMonthSlice.actions;
export const myMonthReducer = myMonthSlice.reducer;
