import { RootState } from '../../store/store';

export const selectConfigMyMoney = (state: RootState) => state.configMyMoney;
export const selectUserConfig = (state: RootState) =>
  state.configMyMoney.userConfig;
export const selectExpenseCategories = (state: RootState) =>
  state.configMyMoney.expenseCategories;
export const selectFixedExpenses = (state: RootState) =>
  state.configMyMoney.fixedExpenses;
export const selectExpectedIncomes = (state: RootState) =>
  state.configMyMoney.expectedIncomes;
export const selectBalanceSources = (state: RootState) =>
  state.configMyMoney.balanceSources;
export const selectSavingsSources = (state: RootState) =>
  state.configMyMoney.savingsSources;
export const selectConfigLoading = (state: RootState) =>
  state.configMyMoney.loading;
export const selectConfigError = (state: RootState) =>
  state.configMyMoney.error;
