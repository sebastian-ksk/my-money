import type { RootState } from '@/Redux/store';

export const selectInitialLiquidity = (state: RootState) =>
  state.initialLiquidity.currentLiquidity;

export const selectInitialLiquidityAmount = (state: RootState) =>
  state.initialLiquidity.currentLiquidity?.amount ??
  state.initialLiquidity.calculatedAmount;

export const selectCalculatedAmount = (state: RootState) =>
  state.initialLiquidity.calculatedAmount;

export const selectWasCalculated = (state: RootState) =>
  state.initialLiquidity.wasCalculated;

export const selectInitialLiquidityHistory = (state: RootState) =>
  state.initialLiquidity.history;

export const selectInitialLiquidityLoading = (state: RootState) =>
  state.initialLiquidity.loading;

export const selectInitialLiquidityError = (state: RootState) =>
  state.initialLiquidity.error;

// Selector para obtener la liquidez efectiva (guardada o calculada)
export const selectEffectiveInitialLiquidity = (state: RootState) => {
  const { currentLiquidity, calculatedAmount, wasCalculated } =
    state.initialLiquidity;

  return {
    amount: currentLiquidity?.amount ?? calculatedAmount,
    isManual: currentLiquidity?.isManual ?? false,
    wasCalculated,
    hasRecord: currentLiquidity !== null,
  };
};
