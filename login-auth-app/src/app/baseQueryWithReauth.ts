import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { logOut, setCredentials, type User } from '../features/auth/authSlice';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
  user: User;
}

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8080/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (getState() as any)?.auth?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait if mutex is already locked by another query
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const requestUrl = typeof args === 'string' ? args : args.url;
    if (
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/logout') ||
      requestUrl.includes('/auth/login')
    ) {
      return result;
    }

    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const res = refreshResult.data as ApiResponse<AuthResponseDto>;
          api.dispatch(
            setCredentials({
              accessToken: res.data.accessToken,
              user: res.data.user,
            })
          );
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logOut());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
