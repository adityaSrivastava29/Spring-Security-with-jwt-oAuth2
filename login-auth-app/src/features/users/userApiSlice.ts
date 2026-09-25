import { apiSlice } from '../../app/apiSlice';
import type { ApiResponse } from '../../app/baseQueryWithReauth';
import { updateUser, type User } from '../auth/authSlice';

export interface AdminDashboardData {
  totalUsers: number;
  adminUsers: number;
  moderatorUsers: number;
  standardUsers: number;
  b2bUsers: number;
  b2cUsers: number;
  systemStatus: string;
  securityEngine: string;
}

export interface UserResourceData {
  title: string;
  message: string;
  accountType: 'B2B' | 'B2C';
  roles: string[];
  provider: string;
}

export interface B2BResourceData {
  company: string;
  planTier: string;
  apiQuotaUsage: string;
  contractRenewal: string;
  multiTenantKey: string;
}

export interface B2CResourceData {
  consumerName: string;
  loyaltyTier: string;
  rewardPoints: number;
  pendingOrders: number;
  discountCode: string;
}

export interface ModeratorResourceData {
  title: string;
  message: string;
  pendingReviews: number;
  flaggedAccounts: number;
  auditStatus: string;
}

export interface RbacMatrixItem {
  resource: string;
  endpoint: string;
  guest: boolean;
  b2cUser: boolean;
  b2bUser: boolean;
  moderator: boolean;
  admin: boolean;
  description: string;
}

export interface AuditRecord {
  id: string;
  event: string;
  severity: string;
  ip: string;
  timestamp: string;
}

export interface AuditVaultData {
  vaultStatus: string;
  encryptionStandard: string;
  lastAuditTimestamp: string;
  accessRecords: AuditRecord[];
  activeAuditor: string;
}

export interface UpdateProfileRequest {
  name: string;
  organization?: string;
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data.data));
        } catch {
          // Handled elsewhere
        }
      },
    }),

    updateProfile: builder.mutation<ApiResponse<User>, UpdateProfileRequest>({
      query: (body) => ({
        url: '/users/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User', 'Admin'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data.data));
        } catch {
          // Handled elsewhere
        }
      },
    }),

    getUserData: builder.query<ApiResponse<UserResourceData>, void>({
      query: () => '/users/user-data',
    }),

    getB2BData: builder.query<ApiResponse<B2BResourceData>, void>({
      query: () => '/users/b2b-data',
    }),

    getB2CData: builder.query<ApiResponse<B2CResourceData>, void>({
      query: () => '/users/b2c-data',
    }),

    getModeratorData: builder.query<ApiResponse<ModeratorResourceData>, void>({
      query: () => '/users/moderator-data',
    }),

    getAdminDashboard: builder.query<ApiResponse<AdminDashboardData>, void>({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),

    getAllUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => '/admin/users',
      providesTags: ['Admin'],
    }),

    getUserById: builder.query<ApiResponse<User>, number>({
      query: (id) => `/admin/users/${id}`,
      providesTags: ['Admin'],
    }),

    updateUserRole: builder.mutation<ApiResponse<User>, { id: number; roles: string[] }>({
      query: ({ id, roles }) => ({
        url: `/admin/users/${id}/roles`,
        method: 'PUT',
        body: { roles },
      }),
      invalidatesTags: ['Admin', 'User'],
    }),

    toggleUserStatus: builder.mutation<ApiResponse<User>, number>({
      query: (id) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Admin', 'User'],
    }),

    updateUserAccountType: builder.mutation<ApiResponse<User>, { id: number; accountType: 'B2B' | 'B2C' }>({
      query: ({ id, accountType }) => ({
        url: `/admin/users/${id}/account-type?accountType=${accountType}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Admin', 'User'],
    }),

    deleteUser: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),

    getRbacMatrix: builder.query<ApiResponse<RbacMatrixItem[]>, void>({
      query: () => '/admin/rbac-matrix',
      providesTags: ['Admin'],
    }),

    getAuditVault: builder.query<ApiResponse<AuditVaultData>, void>({
      query: () => '/users/audit-vault',
    }),
  }),
});

export const {
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useGetUserDataQuery,
  useGetB2BDataQuery,
  useGetB2CDataQuery,
  useGetModeratorDataQuery,
  useGetAdminDashboardQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
  useToggleUserStatusMutation,
  useUpdateUserAccountTypeMutation,
  useDeleteUserMutation,
  useGetRbacMatrixQuery,
  useGetAuditVaultQuery,
} = userApiSlice;
