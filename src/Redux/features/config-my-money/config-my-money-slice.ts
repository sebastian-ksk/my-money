import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  loadUserConfig,
  loadExpenseCategories,
  loadFixedExpenses,
  loadExpectedIncomes,
  saveUserConfig,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  createFixedExpense,
  updateFixedExpense,
  deleteFixedExpense,
  createExpectedIncome,
  updateExpectedIncome,
  deleteExpectedIncome,
} from './config-my-money-thunks';
import type {
  ConfigMyMoneyState,
  UserConfig,
  ExpenseCategory,
  FixedExpense,
  ExpectedIncome,
} from './config-my-money-models';

const initialState: ConfigMyMoneyState = {
  userConfig: null,
  expenseCategories: [],
  fixedExpenses: [],
  expectedIncomes: [],
  loading: false,
  error: null,
};

const configMyMoneySlice = createSlice({
  name: 'configMyMoney',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User Config
      .addCase(loadUserConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.userConfig = action.payload;
      })
      .addCase(loadUserConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save User Config
      .addCase(saveUserConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.userConfig = action.payload;
      })
      .addCase(saveUserConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load Expense Categories
      .addCase(loadExpenseCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadExpenseCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseCategories = action.payload;
      })
      .addCase(loadExpenseCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Expense Category
      .addCase(createExpenseCategory.fulfilled, (state, action) => {
        const exists = state.expenseCategories.find(
          (c) => c.id === action.payload.id
        );
        if (!exists) {
          state.expenseCategories.push(action.payload);
        }
      })
      // Update Expense Category
      .addCase(updateExpenseCategory.fulfilled, (state, action) => {
        const index = state.expenseCategories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.expenseCategories[index] = action.payload;
        }
      })
      // Delete Expense Category
      .addCase(deleteExpenseCategory.fulfilled, (state, action) => {
        state.expenseCategories = state.expenseCategories.filter(
          (c) => c.id !== action.meta.arg
        );
      })
      // Load Fixed Expenses
      .addCase(loadFixedExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFixedExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.fixedExpenses = action.payload;
      })
      .addCase(loadFixedExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Fixed Expense
      .addCase(createFixedExpense.fulfilled, (state, action) => {
        state.fixedExpenses.push(action.payload);
      })
      // Update Fixed Expense
      .addCase(updateFixedExpense.fulfilled, (state, action) => {
        const index = state.fixedExpenses.findIndex(
          (e) => e.id === action.payload.id
        );
        if (index !== -1) {
          state.fixedExpenses[index] = action.payload;
        }
      })
      // Delete Fixed Expense
      .addCase(deleteFixedExpense.fulfilled, (state, action) => {
        state.fixedExpenses = state.fixedExpenses.filter(
          (e) => e.id !== action.meta.arg
        );
      })
      // Load Expected Incomes
      .addCase(loadExpectedIncomes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadExpectedIncomes.fulfilled, (state, action) => {
        state.loading = false;
        state.expectedIncomes = action.payload;
      })
      .addCase(loadExpectedIncomes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Expected Income
      .addCase(createExpectedIncome.fulfilled, (state, action) => {
        state.expectedIncomes.push(action.payload);
      })
      // Update Expected Income
      .addCase(updateExpectedIncome.fulfilled, (state, action) => {
        const index = state.expectedIncomes.findIndex(
          (i) => i.id === action.payload.id
        );
        if (index !== -1) {
          state.expectedIncomes[index] = action.payload;
        }
      })
      // Delete Expected Income
      .addCase(deleteExpectedIncome.fulfilled, (state, action) => {
        state.expectedIncomes = state.expectedIncomes.filter(
          (i) => i.id !== action.meta.arg
        );
      });
  },
});

export const { clearError } = configMyMoneySlice.actions;
export const configMyMoneyReducer = configMyMoneySlice.reducer;
