import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { permissionUtils } from '../utils/permissionUtils';
import { roleUtils } from '../utils/authUtils';

const LoadingSpinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
  </div>
);

/**
 * Guards routes by auth token and optional sub-admin permission keys.
 * Admin and back office always pass permission checks.
 */
const PermissionRoute = ({
  children,
  permission,
  anyPermission,
  requireStaff = false,
  adminOnly = false,
  allowCustomer = false
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowCustomer && roleUtils.isCustomer(user)) {
    return children;
  }

  if (adminOnly && !permissionUtils.hasFullAccess(user)) {
    return <Navigate to={permissionUtils.getDefaultRoute(user)} replace />;
  }

  if (requireStaff && !permissionUtils.isStaff(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (permission && !permissionUtils.hasPermission(user, permission)) {
    return <Navigate to={permissionUtils.getDefaultRoute(user)} replace />;
  }

  if (anyPermission?.length && !permissionUtils.hasAnyPermission(user, anyPermission)) {
    return <Navigate to={permissionUtils.getDefaultRoute(user)} replace />;
  }

  if (
    !permission &&
    !anyPermission?.length &&
    !permissionUtils.canAccessRoute(user, location.pathname, location.search)
  ) {
    return <Navigate to={permissionUtils.getDefaultRoute(user)} replace />;
  }

  return children;
};

export default PermissionRoute;
