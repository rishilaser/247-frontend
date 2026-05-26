import { roleUtils } from './authUtils';

export const PERMISSION_KEYS = {
  CAN_CREATE_QUOTATIONS: 'canCreateQuotations',
  CAN_MANAGE_USERS: 'canManageUsers',
  CAN_VIEW_ALL_INQUIRIES: 'canViewAllInquiries',
  CAN_MANAGE_ORDERS: 'canManageOrders'
};

const ALL_PERMISSIONS = Object.values(PERMISSION_KEYS);

export const permissionUtils = {
  isStaff: (user) =>
    roleUtils.isAdmin(user) || roleUtils.isBackOffice(user) || roleUtils.isSubAdmin(user),

  hasFullAccess: (user) => roleUtils.isAdmin(user) || roleUtils.isBackOffice(user),

  hasPermission: (user, permission) => {
    if (!user || !permission) return false;
    if (permissionUtils.hasFullAccess(user)) return true;
    if (roleUtils.isSubAdmin(user)) {
      return Boolean(user.permissions?.[permission]);
    }
    return false;
  },

  hasAnyPermission: (user, permissions = ALL_PERMISSIONS) => {
    if (permissionUtils.hasFullAccess(user)) return true;
    if (!roleUtils.isSubAdmin(user)) return false;
    return permissions.some((key) => permissionUtils.hasPermission(user, key));
  },

  canAccessDashboard: (user) => permissionUtils.hasAnyPermission(user),

  canAccessDashboardTab: (user, tab) => {
    if (permissionUtils.hasFullAccess(user)) {
      return tab !== 'material' || roleUtils.isAdmin(user) || roleUtils.isBackOffice(user);
    }
    if (!roleUtils.isSubAdmin(user)) return false;
    switch (tab) {
      case 'inquiries':
        return permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_VIEW_ALL_INQUIRIES);
      case 'quotations':
        return permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_CREATE_QUOTATIONS);
      case 'orders':
        return permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_MANAGE_ORDERS);
      case 'material':
        return false;
      default:
        return false;
    }
  },

  getFirstAllowedDashboardTab: (user) => {
    if (permissionUtils.hasFullAccess(user)) return 'inquiries';
    if (permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_VIEW_ALL_INQUIRIES)) return 'inquiries';
    if (permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_CREATE_QUOTATIONS)) return 'quotations';
    if (permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_MANAGE_ORDERS)) return 'orders';
    return null;
  },

  canAccessRoute: (user, pathname, search = '') => {
    if (!user) return false;

    if (pathname === '/profile' || pathname.startsWith('/profile')) {
      if (pathname.includes('tab=subadmins')) {
        return roleUtils.isAdmin(user);
      }
      return permissionUtils.isStaff(user) || roleUtils.isCustomer(user);
    }

    if (roleUtils.isCustomer(user)) return true;

    if (!permissionUtils.isStaff(user)) return false;
    if (permissionUtils.hasFullAccess(user)) return true;

    if (pathname.startsWith('/admin/leads') || pathname.startsWith('/admin/users')) {
      return permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_MANAGE_USERS);
    }
    if (pathname.startsWith('/admin/orders')) {
      return permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_MANAGE_ORDERS);
    }
    if (pathname.startsWith('/admin/material-management')) {
      return false;
    }
    if (pathname.startsWith('/inquiries') || pathname.startsWith('/inquiry/')) {
      return permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_VIEW_ALL_INQUIRIES);
    }
    if (pathname.startsWith('/admin/dashboard')) {
      const tab = new URLSearchParams(search).get('tab');
      if (!tab) return permissionUtils.canAccessDashboard(user);
      return permissionUtils.canAccessDashboardTab(user, tab);
    }
    if (pathname.startsWith('/component-manager')) {
      return false;
    }
    if (pathname.startsWith('/admin/')) {
      return permissionUtils.canAccessDashboard(user);
    }

    return false;
  },

  getDefaultRoute: (user) => {
    if (!user) return '/login';
    if (roleUtils.isCustomer(user)) return '/dashboard';
    if (permissionUtils.hasFullAccess(user)) return '/admin/dashboard';

    if (roleUtils.isSubAdmin(user)) {
      const tab = permissionUtils.getFirstAllowedDashboardTab(user);
      if (tab) return `/admin/dashboard?tab=${tab}`;
      if (permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_MANAGE_ORDERS)) {
        return '/admin/orders';
      }
      if (permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_MANAGE_USERS)) {
        return '/admin/leads';
      }
      return '/profile';
    }

    return '/dashboard';
  }
};
