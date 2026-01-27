import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  loadDashboardStats,
  loadMonthlyTrend,
  loadExpenseDistribution,
  loadPeriodSummary,
  loadDashboardData,
  loadCompleteDashboard,
  loadFinancialStats,
  loadFinancialHistory,
  loadGlobalSummary,
} from './dashboard-thunks';
import { logoutUser } from '../auth/auth-thunks';
import type { DashboardState, PeriodFilter } from './dashboard-models';

const initialState: DashboardState = {
  stats: null,
  monthlyTrend: [],
  expenseDistribution: [],
  periodSummary: null,
  selectedPeriod: '6m',
  loading: false,
  error: null,
  // Estados para datos avanzados
  financialStats: null,
  monthlyFinancialData: [],
  globalSummary: null,
  currentMonthData: null,
  expensesByCategory: [],
  incomesByCategory: [],
  transactionsByPaymentMethod: [],
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    setSelectedPeriod: (state, action: PayloadAction<PeriodFilter>) => {
      state.selectedPeriod = action.payload;
    },
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Load Dashboard Stats
      .addCase(loadDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(loadDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load Monthly Trend
      .addCase(loadMonthlyTrend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMonthlyTrend.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyTrend = action.payload;
      })
      .addCase(loadMonthlyTrend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load Expense Distribution
      .addCase(loadExpenseDistribution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadExpenseDistribution.fulfilled, (state, action) => {
        state.loading = false;
        state.expenseDistribution = action.payload;
      })
      .addCase(loadExpenseDistribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load Period Summary
      .addCase(loadPeriodSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPeriodSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.periodSummary = action.payload;
      })
      .addCase(loadPeriodSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load All Dashboard Data
      .addCase(loadDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.monthlyTrend = action.payload.monthlyTrend;
        state.expenseDistribution = action.payload.expenseDistribution;
        state.periodSummary = action.payload.periodSummary;
      })
      .addCase(loadDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reset on logout
      .addCase(logoutUser.fulfilled, () => initialState)

      // Load Complete Dashboard
      .addCase(loadCompleteDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCompleteDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.financialStats = action.payload.stats;
        state.monthlyFinancialData = action.payload.monthlyData;
        state.currentMonthData = action.payload.currentMonth;
        state.globalSummary = action.payload.summary;
        state.expensesByCategory = action.payload.expensesByCategory;
        state.incomesByCategory = action.payload.incomesByCategory;
        state.transactionsByPaymentMethod = action.payload.transactionsByPaymentMethod;
      })
      .addCase(loadCompleteDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load Financial Stats
      .addCase(loadFinancialStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFinancialStats.fulfilled, (state, action) => {
        state.loading = false;
        state.financialStats = action.payload;
      })
      .addCase(loadFinancialStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load Financial History
      .addCase(loadFinancialHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFinancialHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyFinancialData = action.payload;
      })
      .addCase(loadFinancialHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Load Global Summary
      .addCase(loadGlobalSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGlobalSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.globalSummary = action.payload;
      })
      .addCase(loadGlobalSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError, setSelectedPeriod, resetDashboard } =
  dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
