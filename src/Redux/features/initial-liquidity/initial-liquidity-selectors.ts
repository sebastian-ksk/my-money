import type { RootState } from '@/Redux/store';

export const selectInitialLiquidity = (state: RootState) =>
  state.initialLiquidity.currentLiquidity;

export const selectEffectiveAmount = (state: RootState) =>
  state.initialLiquidity.effectiveAmount;

export const selectRealAmount = (state: RootState) =>
  state.initialLiquidity.currentLiquidity?.realAmount ?? null;

export const selectCalculatedAmount = (state: RootState) =>
  state.initialLiquidity.currentLiquidity?.calculatedAmount ?? 0;

export const selectWasCalculated = (state: RootState) =>
  state.initialLiquidity.wasCalculated;

export const selectInitialLiquidityHistory = (state: RootState) =>
  state.initialLiquidity.history;

export const selectInitialLiquidityLoading = (state: RootState) =>
  state.initialLiquidity.loading;

export const selectInitialLiquidityError = (state: RootState) =>
  state.initialLiquidity.error;

// Selector para obtener la liquidez efectiva con toda la info
export const selectEffectiveInitialLiquidity = (state: RootState) => {
  const { currentLiquidity, effectiveAmount, wasCalculated } =
    state.initialLiquidity;

  return {
    amount: effectiveAmount,
    realAmount: currentLiquidity?.realAmount ?? null,
    calculatedAmount: currentLiquidity?.calculatedAmount ?? 0,
    wasCalculated,
    hasRecord: currentLiquidity !== null,
  };
};
