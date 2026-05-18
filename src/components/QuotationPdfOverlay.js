import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const QuotationPdfOverlay = ({ title, onClose, children, actions }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const overlay = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quotation-pdf-title"
      onClick={onClose}
    >
      <div
        className="flex h-[min(88vh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10 sm:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 sm:px-4 sm:py-2.5">
          <h2 id="quotation-pdf-title" className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {actions}
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700" aria-label="Close">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
          <div className="absolute inset-0">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default QuotationPdfOverlay;
