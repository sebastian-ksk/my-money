import { createSlice } from '@reduxjs/toolkit';
import {
  loadInitialLiquidity,
  saveInitialLiquidity,
  updateInitialLiquidity,
  deleteInitialLiquidity,
  loadInitialLiquidityHistory,
  recalculateInitialLiquidity,
} from './initial-liquidity-thunks';
import { logoutUser } from '../auth/auth-thunks';
import type { InitialLiquidityState } from './initial-liquidity-models';

const initialState: InitialLiquidityState = {
  currentLiquidity: null,
  calculatedAmount: 0,
  wasCalculated: false,
  history: [],
  loading: false,
  error: null,
};

const initialLiquiditySlice = createSlice({
  name: 'initialLiquidity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetInitialLiquidity: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Load Initial Liquidity
      .addCase(loadInitialLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadInitialLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLiquidity = action.payload.liquidity;
        state.calculatedAmount = action.payload.calculatedAmount;
        state.wasCalculated = action.payload.wasCalculated;
      })
      .addCase(loadInitialLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save Initial Liquidity
      .addCase(saveInitialLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveInitialLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLiquidity = action.payload;
        state.calculatedAmount = action.payload.amount;
        state.wasCalculated = false;
      })
      .addCase(saveInitialLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Initial Liquidity
      .addCase(updateInitialLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInitialLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLiquidity = action.payload;
        state.calculatedAmount = action.payload.amount;
      })
      .addCase(updateInitialLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Initial Liquidity
      .addCase(deleteInitialLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInitialLiquidity.fulfilled, (state) => {
        state.loading = false;
        state.currentLiquidity = null;
        state.wasCalculated = true;
      })
      .addCase(deleteInitialLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load History
      .addCase(loadInitialLiquidityHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadInitialLiquidityHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(loadInitialLiquidityHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Recalculate Initial Liquidity
      .addCase(recalculateInitialLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recalculateInitialLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLiquidity = action.payload;
        state.calculatedAmount = action.payload.amount;
        state.wasCalculated = false;
      })
      .addCase(recalculateInitialLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset on logout
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { clearError, resetInitialLiquidity } = initialLiquiditySlice.actions;
export const initialLiquidityReducer = initialLiquiditySlice.reducer;
