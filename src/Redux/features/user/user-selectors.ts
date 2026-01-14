import type { RootState } from '../../store/types';

export const selectUser = (state: RootState) => state.user;
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectOnboardingCompleted = (state: RootState) => state.user.onboardingCompleted;