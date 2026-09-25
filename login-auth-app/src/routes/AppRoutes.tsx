import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { Dashboard } from '../pages/Dashboard';
import { Profile } from '../pages/Profile';
import { AdminOverview } from '../pages/admin/AdminOverview';
import { AdminUsersList } from '../pages/admin/AdminUsersList';
import { AdminRbacMatrix } from '../pages/admin/AdminRbacMatrix';
import { Unauthorized } from '../pages/Unauthorized';
import { OAuth2Redirect } from '../pages/OAuth2Redirect';
import { AuditVault } from '../pages/AuditVault';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated user routes (accessible to normal users) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/audit-vault" element={<AuditVault />} />
        <Route path="/vault" element={<AuditVault />} />
      </Route>

      {/* Admin RBAC protected routes */}
      <Route element={<RoleRoute allowedRoles={['ROLE_ADMIN']} />}>
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUsersList />} />
        <Route path="/admin/rbac" element={<AdminRbacMatrix />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
