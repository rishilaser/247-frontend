import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarLayout } from '../contexts/SidebarLayoutContext';

const HEADER_OFFSET_PX = 90;

/**
 * Full-height PDF overlay aligned to the main content area (beside the sidebar).
 * Left offset transitions with sidebar expand/collapse on desktop.
 */
const QuotationPdfOverlay = ({ title, onClose, children, actions }) => {
  const sidebarLayout = useSidebarLayout();
  const sidebarOpen = sidebarLayout?.sidebarOpen ?? true;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const overlay = (
    <div
      className={`fixed z-[100] flex flex-col bg-black/50 transition-[left] duration-200 ease-out right-0 bottom-0 left-0 ${
        sidebarOpen ? 'lg:left-64' : 'lg:left-20'
      }`}
      style={{ top: `${HEADER_OFFSET_PX}px` }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quotation-pdf-title"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white shadow-2xl lg:m-2 lg:rounded-lg">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-5 sm:py-3">
          <h2
            id="quotation-pdf-title"
            className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 sm:text-base"
          >
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 bg-gray-100">{children}</div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default QuotationPdfOverlay;
