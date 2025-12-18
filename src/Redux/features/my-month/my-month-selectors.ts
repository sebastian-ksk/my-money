import { RootState } from '../../store/store';

export const selectMyMonth = (state: RootState) => state.myMonth;
export const selectTransactions = (state: RootState) =>
  state.myMonth.transactions;
export const selectMyMonthLoading = (state: RootState) => state.myMonth.loading;
export const selectMyMonthError = (state: RootState) => state.myMonth.error;
export const selectCurrentMonthPeriod = (state: RootState) =>
  state.myMonth.currentMonthPeriod;

// Selectores filtrados por tipo
export const selectFixedExpenseTransactions = (state: RootState) =>
  state.myMonth.transactions.filter((t) => t.type === 'fixed_expense');

export const selectExpectedIncomeTransactions = (state: RootState) =>
  state.myMonth.transactions.filter((t) => t.type === 'expected_income');

export const selectUnexpectedIncomeTransactions = (state: RootState) =>
  state.myMonth.transactions.filter((t) => t.type === 'unexpected_income');

export const selectRegularExpenseTransactions = (state: RootState) =>
  state.myMonth.transactions.filter((t) => t.type === 'regular_expense');

// Selectores calculados
export const selectTotalFixedExpensePayments = (state: RootState) =>
  state.myMonth.transactions
    .filter((t) => t.type === 'fixed_expense')
    .reduce((sum, t) => sum + t.value, 0);

export const selectTotalExpectedIncomes = (state: RootState) =>
  state.myMonth.transactions
    .filter((t) => t.type === 'expected_income')
    .reduce((sum, t) => sum + t.value, 0);

export const selectTotalUnexpectedIncomes = (state: RootState) =>
  state.myMonth.transactions
    .filter((t) => t.type === 'unexpected_income')
    .reduce((sum, t) => sum + t.value, 0);

export const selectTotalRealIncomes = (state: RootState) =>
  selectTotalExpectedIncomes(state) + selectTotalUnexpectedIncomes(state);

export const selectTotalRegularExpenses = (state: RootState) =>
  state.myMonth.transactions
    .filter((t) => t.type === 'regular_expense')
    .reduce((sum, t) => sum + t.value, 0);

export const selectTotalExpenses = (state: RootState) => {
  const fixed = selectTotalFixedExpensePayments(state);
  const regular = selectTotalRegularExpenses(state);
  return fixed + regular;
};
