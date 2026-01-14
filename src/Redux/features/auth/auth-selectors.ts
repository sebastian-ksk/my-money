import type { RootState } from '../../store/types';

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectOnboardingCompleted = (state: RootState) =>
  state.auth.user?.onboardingCompleted ?? false;
export const selectOnboardingMyMonthCompleted = (state: RootState) =>
  state.auth.user?.onboardingMyMonthCompleted ?? false;