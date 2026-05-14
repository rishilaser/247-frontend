import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getWordpressUrl } from '../utils/wordpressUrl';
import {
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  ShoppingCartIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ onLinkClick, onToggle, isCollapsed = false, onLogoClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Role-based navigation - same as InternalHeader
  const getRoleBasedNavigation = () => {
    if (!user) return [];

    const baseNavigation = [
      { name: 'Profile', href: '/profile', icon: UserCircleIcon },
      { name: 'Sign out', href: getWordpressUrl(), icon: ArrowRightOnRectangleIcon, action: logout },
    ];

    if (user.role === 'admin') {
      return [
        { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Squares2X2Icon },
        { name: 'Order Management', href: '/admin/orders', icon: ClipboardDocumentListIcon },
        ...baseNavigation
      ];
    } else if (user.role === 'backoffice') {
      return [
        { name: 'Back Office Dashboard', href: '/admin/dashboard', icon: BuildingOfficeIcon },
        { name: 'Order Management', href: '/admin/orders', icon: ClipboardDocumentListIcon },
        ...baseNavigation
      ];
    } else if (user.role === 'subadmin') {
      return [
        { name: 'Sub Admin Dashboard', href: '/admin/dashboard', icon: Squares2X2Icon },
        ...baseNavigation
      ];
    } else {
      // Customer navigation
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
        { name: 'New Inquiry', href: '/inquiry/new', icon: ClipboardDocumentListIcon },
        { name: 'My Inquiries', href: '/inquiries', icon: ClipboardDocumentListIcon },
        { name: 'My Quotations', href: '/quotations', icon: TagIcon },
        { name: 'My Orders', href: '/orders', icon: ShoppingCartIcon },
        ...baseNavigation
      ];
    }
  };

  const navigationItems = getRoleBasedNavigation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (href) => {
    if (href === getWordpressUrl()) return false;
    // Check if href matches current pathname
    if (href.includes('?')) {
      const [path, query] = href.split('?');
      const [param, value] = query.split('=');
      const currentParams = new URLSearchParams(location.search);
      return location.pathname === path && currentParams.get(param) === value;
    }
    if (href === '/quotations') {
      return (
        location.pathname === '/quotations' ||
        location.pathname.startsWith('/quotation/')
      );
    }
    return location.pathname === href;
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Logo/Brand Section - Clickable when expanded to collapse */}
      <div 
        className={`${isCollapsed ? 'px-3 py-4' : 'px-6 py-6 cursor-pointer hover:bg-gray-50'} border-b border-gray-200 flex-shrink-0`}
        onClick={!isCollapsed && onLogoClick ? onLogoClick : undefined}
        title={!isCollapsed ? 'Click to collapse sidebar' : ''}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <img 
            src="/Logo.png" 
            alt="247CutBend Logo" 
            className="flex-shrink-0"
            style={{ 
              width: '64px', 
              height: '64px', 
              objectFit: 'contain'
            }}
          />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="text-lg font-bold text-blue-600 whitespace-nowrap">
                CUTBEND
              </h2>
              <p className="text-xs text-gray-500 whitespace-nowrap">Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-6 admin-sidebar-scroll">
        <nav className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            if (item.action) {
              return (
                <button
                  key={item.name}
                  onClick={handleLogout}
                  className={`w-full ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} rounded-xl font-medium text-sm flex items-center ${isCollapsed ? '' : 'space-x-3'} transition-all duration-200 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 hover:shadow-md group relative`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className="h-5 w-5 text-gray-500 group-hover:text-red-600 flex-shrink-0 transition-colors" />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </button>
              );
            }

            const isDashboard = item.name === 'Dashboard' || item.name === 'Admin Dashboard' || item.name === 'Back Office Dashboard' || item.name === 'Sub Admin Dashboard';
            
            return (
              <div key={item.name} className="relative group">
                <Link
                  to={item.href}
                  onClick={() => {
                    // Only close sidebar on mobile when link is clicked
                    if (onLinkClick && window.innerWidth < 1024) {
                      onLinkClick();
                    }
                  }}
                  className={`w-full ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} rounded-lg font-medium text-sm flex items-center ${isCollapsed ? '' : 'space-x-3'} transition-colors duration-150 relative ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-colors ${
                    active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.name}</span>
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute right-2 w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                      )}
                    </>
                  )}
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                  {/* Hamburger Icon - Only for Dashboard tab, positioned on right */}
                  {isDashboard && onToggle && !isCollapsed && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggle();
                      }}
                      className="ml-auto p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors flex-shrink-0"
                      title="Toggle Sidebar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Section at Bottom */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 border-t border-gray-200 flex-shrink-0 bg-gray-50`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg bg-white shadow-sm border border-gray-200`}>
          <div className="flex-shrink-0">
            <div className={`${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg bg-blue-600 flex items-center justify-center shadow-sm`}>
              <UserCircleIcon className={`${isCollapsed ? 'h-6 w-6' : 'h-7 w-7'} text-white`} />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm font-semibold truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-gray-500 text-xs truncate flex items-center space-x-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                <span>{user?.role === 'admin' ? 'Administrator' : user?.role === 'backoffice' ? 'Back Office' : user?.role === 'subadmin' ? 'Sub Admin' : 'User'}</span>
              </p>
            </div>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-gray-300">{user?.role === 'admin' ? 'Administrator' : user?.role === 'backoffice' ? 'Back Office' : user?.role === 'subadmin' ? 'Sub Admin' : 'User'}</p>
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;

