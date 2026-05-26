import React from 'react';
import AdminSidebar from '../AdminSidebar';
import InternalHeader from './InternalHeader';
import { SidebarLayoutProvider, useSidebarLayout } from '../../contexts/SidebarLayoutContext';

const AdminLayoutInner = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useSidebarLayout();

  return (
    <div className="min-h-screen bg-gray-50">
      <InternalHeader />

      <div className="flex relative" style={{ paddingTop: '90px' }}>
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:block fixed left-0 z-40 transition-all duration-200 ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
          style={{ top: '90px', height: 'calc(100vh - 90px)' }}
        >
          <div
            className={`h-full bg-white border-r border-gray-200 shadow-lg relative overflow-hidden ${
              sidebarOpen ? 'w-64' : 'w-20'
            }`}
          >
            {!sidebarOpen && (
              <div
                className="absolute inset-0 z-50 cursor-pointer"
                onClick={() => setSidebarOpen(true)}
                title="Click to expand sidebar"
              />
            )}

            <div className="h-full relative z-40">
              <AdminSidebar
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                isCollapsed={!sidebarOpen}
                onLogoClick={() => sidebarOpen && setSidebarOpen(false)}
              />
            </div>
          </div>
        </aside>

        {/* Mobile: dim main content so overlay receives taps to close */}
        {sidebarOpen && (
          <div
            className="fixed left-0 right-0 bottom-0 top-[90px] z-[35] bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile drawer — toggled from header (see InternalHeader + SidebarLayoutContext) */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed left-0 w-64 max-w-[85vw] z-[45] transition-transform duration-200 ease-out lg:hidden shadow-xl bg-white border-r border-gray-200`}
          style={{ top: '90px', height: 'calc(100vh - 90px)' }}
        >
          <AdminSidebar onLinkClick={() => setSidebarOpen(false)} />
        </aside>

        <main
          className={`relative z-10 flex-1 w-full min-w-0 transition-all duration-200 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
        >
          <div
            className="w-full min-h-[calc(100vh-5rem)] overflow-x-hidden py-6 px-4 sm:px-6 lg:px-8"
            style={{ minWidth: 0 }}
          >
            <div className="max-w-7xl mr-auto" style={{ minWidth: 0 }}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }) => (
  <SidebarLayoutProvider>
    <AdminLayoutInner>{children}</AdminLayoutInner>
  </SidebarLayoutProvider>
);

export default AdminLayout;

