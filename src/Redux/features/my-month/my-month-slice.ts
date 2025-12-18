import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  loadTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  loadMonthlyLiquidity,
  updateMonthlyLiquidity,
} from './my-month-thunks';
import type { MyMonthState, Transaction } from './my-month-models';

const initialState: MyMonthState = {
  transactions: [],
  monthlyLiquidity: null,
  loading: false,
  error: null,
  currentMonthPeriod: null,
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
      });
  },
});

export const { clearError, setCurrentMonthPeriod } = myMonthSlice.actions;
export const myMonthReducer = myMonthSlice.reducer;
