import { apiSlice } from '../../app/apiSlice';
import type { ApiResponse, AuthResponseDto } from '../../app/baseQueryWithReauth';
import { setCredentials, logOut } from './authSlice';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  accountType?: 'B2B' | 'B2C';
  organization?: string;
  roles?: string[];
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponseDto>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.data.accessToken,
              user: data.data.user,
            })
          );
        } catch {
          // Handled in component
        }
      },
    }),

    signup: builder.mutation<ApiResponse<AuthResponseDto>, SignupRequest>({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.data.accessToken,
              user: data.data.user,
            })
          );
        } catch {
          // Handled in component
        }
      },
    }),

    refreshToken: builder.mutation<ApiResponse<AuthResponseDto>, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.data.accessToken,
              user: data.data.user,
            })
          );
        } catch {
          dispatch(logOut());
        }
      },
    }),

    logout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logOut());
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApiSlice;
