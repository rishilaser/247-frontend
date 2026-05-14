import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';

const SidebarLayoutContext = createContext(null);

export const useSidebarLayout = () => useContext(SidebarLayoutContext);

/**
 * Provides shared sidebar open state for AdminLayout + InternalHeader so the
 * mobile menu button toggles the left navigation drawer on small screens.
 */
export function SidebarLayoutProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      setSidebarOpen(mq.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, []);

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
    }),
    [sidebarOpen]
  );

  return (
    <SidebarLayoutContext.Provider value={value}>
      {children}
    </SidebarLayoutContext.Provider>
  );
}
