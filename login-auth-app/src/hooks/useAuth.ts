import { useMemo } from 'react';
import { useAppSelector } from './reduxHooks';
import {
  selectCurrentUser,
  selectCurrentToken,
  selectIsAuthenticated,
  selectIsInitialized,
} from '../features/auth/authSlice';

export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector(selectCurrentToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);

  return useMemo(() => {
    const roles = user?.roles || [];
    const isAdmin = roles.includes('ROLE_ADMIN');
    const isModerator = roles.includes('ROLE_MODERATOR') || isAdmin;
    const isUser = roles.includes('ROLE_USER') || isModerator;

    const hasRole = (role: string) => roles.includes(role);
    const hasAnyRole = (requiredRoles: string[]) =>
      requiredRoles.some((r) => roles.includes(r));

    return {
      user,
      token,
      isAuthenticated,
      isInitialized,
      roles,
      isAdmin,
      isModerator,
      isUser,
      hasRole,
      hasAnyRole,
    };
  }, [user, token, isAuthenticated, isInitialized]);
};
