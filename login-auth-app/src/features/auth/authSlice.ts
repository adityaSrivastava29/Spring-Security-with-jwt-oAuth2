import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  provider: 'LOCAL' | 'GOOGLE';
  accountType: 'B2B' | 'B2C';
  enabled: boolean;
  organization?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user?: User }>
    ) => {
      const { accessToken, user } = action.payload;
      state.token = accessToken;
      if (user) {
        state.user = user;
      }
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setCredentials, logOut, setInitialized, updateUser } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
