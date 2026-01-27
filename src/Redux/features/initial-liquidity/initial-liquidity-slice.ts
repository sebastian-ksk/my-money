import { createSlice } from '@reduxjs/toolkit';
import {
  loadInitialLiquidity,
  saveInitialLiquidity,
  clearInitialLiquidity,
  loadInitialLiquidityHistory,
  recalculateInitialLiquidity,
} from './initial-liquidity-thunks';
import { logoutUser } from '../auth/auth-thunks';
import type { InitialLiquidityState } from './initial-liquidity-models';

const initialState: InitialLiquidityState = {
  currentLiquidity: null,
  effectiveAmount: 0,
  wasCalculated: true,
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
        state.effectiveAmount = action.payload.effectiveAmount;
        state.wasCalculated = action.payload.wasCalculated;
      })
      .addCase(loadInitialLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save Initial Liquidity (set realAmount)
      .addCase(saveInitialLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveInitialLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLiquidity = action.payload.liquidity;
        state.effectiveAmount = action.payload.effectiveAmount;
        state.wasCalculated = false;
      })
      .addCase(saveInitialLiquidity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Clear Initial Liquidity (remove realAmount, use calculated)
      .addCase(clearInitialLiquidity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearInitialLiquidity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLiquidity = action.payload.liquidity;
        state.effectiveAmount = action.payload.effectiveAmount;
        state.wasCalculated = true;
      })
      .addCase(clearInitialLiquidity.rejected, (state, action) => {
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
        state.currentLiquidity = action.payload.liquidity;
        state.effectiveAmount = action.payload.effectiveAmount;
        state.wasCalculated = action.payload.wasCalculated;
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
