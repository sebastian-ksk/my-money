import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logoutUser } from '../auth/auth-thunks';

interface UserState {
  profile: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
    providerId: string;
  } | null;
  onboardingCompleted: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  onboardingCompleted: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserState['profile']>) => {
      state.profile = action.payload;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { setProfile, setOnboardingCompleted, setLoading, setError, clearProfile, resetUserState } =
  userSlice.actions;
export const userReducer = userSlice.reducer;
