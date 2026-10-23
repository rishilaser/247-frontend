import React, { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../NotificationCenter';
import InstructionsDrawer from '../content/InstructionsDrawer';
import { 
  Bars3Icon,
  XMarkIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  BuildingOfficeIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon,
  UsersIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useSidebarLayout } from '../../contexts/SidebarLayoutContext';
import { getWordpressUrl } from '../../utils/wordpressUrl';
import { SHOW_MY_QUOTATIONS_PAGE } from '../../config/featureFlags';
import { permissionUtils, PERMISSION_KEYS } from '../../utils/permissionUtils';
import { roleUtils } from '../../utils/authUtils';

const InternalHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarLayout = useSidebarLayout();

  // Role-based navigation
  const getRoleBasedNavigation = () => {
    if (!user) return [];

    const baseNavigation = [
      { name: 'Profile', href: '/profile', icon: UserCircleIcon },
      { name: 'Sign out', href: getWordpressUrl(), icon: ArrowRightOnRectangleIcon, action: logout },
    ];

    if (roleUtils.isAdmin(user)) {
      return [
        { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Cog6ToothIcon },
        { name: 'Order Management', href: '/admin/orders', icon: ClipboardDocumentListIcon },
        { name: 'Lead Management', href: '/admin/leads', icon: UsersIcon },
        ...baseNavigation
      ];
    }

    if (roleUtils.isBackOffice(user)) {
      return [
        { name: 'Back Office Dashboard', href: '/admin/dashboard', icon: BuildingOfficeIcon },
        { name: 'Order Management', href: '/admin/orders', icon: ClipboardDocumentListIcon },
        { name: 'Lead Management', href: '/admin/leads', icon: UsersIcon },
        ...baseNavigation
      ];
    }

    if (roleUtils.isSubAdmin(user)) {
      const items = [];
      if (permissionUtils.canAccessDashboard(user)) {
        items.push({
          name: 'Sub Admin Dashboard',
          href: permissionUtils.getDefaultRoute(user),
          icon: Cog6ToothIcon
        });
      }
      if (permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_MANAGE_ORDERS)) {
        items.push({
          name: 'Order Management',
          href: '/admin/orders',
          icon: ClipboardDocumentListIcon
        });
      }
      if (permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_MANAGE_USERS)) {
        items.push({
          name: 'Lead Management',
          href: '/admin/leads',
          icon: UsersIcon
        });
      }
      if (permissionUtils.hasPermission(user, PERMISSION_KEYS.CAN_VIEW_ALL_INQUIRIES)) {
        items.push({
          name: 'Inquiries',
          href: '/inquiries',
          icon: ClipboardDocumentListIcon
        });
      }
      return [...items, ...baseNavigation];
    }

    {
      // Customer navigation
      return [
        { name: 'Dashboard', href: '/dashboard', icon: Cog6ToothIcon },
        { name: 'New Inquiry', href: '/inquiry/new', icon: ClipboardDocumentListIcon },
        { name: 'My Inquiries', href: '/inquiries', icon: ClipboardDocumentListIcon },
        ...(SHOW_MY_QUOTATIONS_PAGE
          ? [{ name: 'My Quotations', href: '/quotations', icon: TagIcon }]
          : []),
        { name: 'My Orders', href: '/orders', icon: ShoppingCartIcon },
        ...baseNavigation
      ];
    }
  };

  const userNavigation = getRoleBasedNavigation();

  const closeInstructions = useCallback(() => setInstructionsOpen(false), []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  // Check if current route is an admin page (has sidebar with logo)
  // For admin users, /inquiries and /profile are also admin pages
  const isAdminPage = location.pathname.startsWith('/admin/') || 
                      location.pathname.startsWith('/component-manager') ||
                      (user && ['admin', 'backoffice', 'subadmin'].includes(user.role) && 
                       (location.pathname === '/inquiries' || location.pathname === '/profile'));

  // Filter navigation items - skip admin dashboard items on admin pages (they have sidebar)
  const filteredNavigation = isAdminPage 
    ? userNavigation.filter(item => 
        item.name === 'Profile' || item.name === 'Sign out'
      )
    : userNavigation;

  return (
    <header className="overflow-visible bg-gray-100 shadow-sm border-b fixed top-0 left-0 right-0 z-50" style={{ height: '90px' }}>
      <div className="w-full h-full">
        {/* Top Bar - Contact Info & Social - Hidden if empty */}
        {/* <div className="hidden lg:flex items-center justify-between py-3 bg-blue-900 text-white text-sm px-4 sm:px-6 lg:px-8">
         
        </div> */}

        {/* Main Navigation Bar — mobile menu left; logo shrinks (min-w-0) so bell stays visible */}
        <div className="flex h-full w-full min-w-0 items-center gap-2 overflow-visible px-3 sm:px-6 lg:px-8">
          {sidebarLayout && (
            <button
              type="button"
              className="lg:hidden inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => {
                sidebarLayout.toggleSidebar();
                setMobileMenuOpen(false);
              }}
              aria-label={sidebarLayout.sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              aria-expanded={sidebarLayout.sidebarOpen}
            >
              {sidebarLayout.sidebarOpen ? (
                <XMarkIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
              )}
            </button>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex max-w-full items-center hover:opacity-80 transition-opacity duration-200">
              <img
                src="/Logo.png"
                alt="247 Cut Bend"
                className="h-8 w-auto max-h-9 max-w-[7.5rem] object-contain object-left sm:h-9 sm:max-w-[8.5rem]"
              />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
            {roleUtils.isCustomer(user) && (
              <button
                type="button"
                onClick={() => {
                  setInstructionsOpen(true);
                  setUserMenuOpen(false);
                }}
                className="inline-flex h-10 flex-shrink-0 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 sm:px-3"
                aria-label="Open instructions"
                aria-expanded={instructionsOpen}
              >
                <BookOpenIcon className="h-5 w-5 text-green-600" aria-hidden="true" />
                <span className="hidden sm:inline">Instructions</span>
              </button>
            )}

            <div className="flex-shrink-0">
              <NotificationCenter />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-label="Open profile menu"
                aria-expanded={userMenuOpen}
              >
                <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  {filteredNavigation.map((item) => (
                    <div key={item.name}>
                      {item.action ? (
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {roleUtils.isCustomer(user) && (
        <InstructionsDrawer open={instructionsOpen} onClose={closeInstructions} />
      )}

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-xl overflow-y-auto">
            <div className="px-3 pt-2 pb-2">
              <div className="flex items-center justify-between">
                {!isAdminPage && (
                  <div className="flex items-center">
                    <img
                      src="/Logo.png"
                      alt="247 Cut Bend"
                      className="mr-2 h-9 w-auto max-w-[8rem] object-contain"
                    />
                  </div>
                )}
                {isAdminPage && <div className="flex-1"></div>}
                <button
                  type="button"
                  className="-mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  {filteredNavigation.map((item) =>
                    item.action ? (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="-m-3 p-3 flex w-full text-left items-center rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                        <span className="ml-3 text-base font-medium text-gray-900">{item.name}</span>
                      </button>
                    ) : (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        <span className="ml-3 text-base font-medium text-gray-900">{item.name}</span>
                      </Link>
                    )
                  )}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default InternalHeader;