import React, { useEffect, useState } from 'react';
import { BookOpenIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { contentAPI } from '../../services/api';
import { InstructionEntryCard, getEntryMedia } from './ContentMedia';

// Intro text followed by one card per instruction; also used for the admin preview
export const InstructionsList = ({ content }) => {
  const entries = (content?.entries || []).filter(
    (entry) => entry.isActive !== false && (entry.title || entry.subtitle || entry.description || getEntryMedia(entry).length > 0)
  );
  return (
    <div className="space-y-5">
      {content?.subheading && (
        <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{content.subheading}</p>
      )}
      {entries.map((entry, index) => (
        <InstructionEntryCard key={entry._id || index} entry={entry} index={index} />
      ))}
    </div>
  );
};

/**
 * Right-side panel with the instructions published from
 * Admin → CMS → Customer Instructions.
 */
const InstructionsDrawer = ({ open, onClose }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  // Reload every time the panel opens so new admin content shows up right away
  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    setFailed(false);
    contentAPI
      .getContent('instructions')
      .then((response) => active && setContent(response.data.content || null))
      .catch(() => active && setFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => e.key === 'Escape' && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  const entries = content?.entries || [];
  const isEmpty = !content?.subheading && entries.length === 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Instructions"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-600">
              <BookOpenIcon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-gray-900">
                {content?.heading || 'Instructions'}
              </h2>
              <p className="text-xs text-gray-500">Guides and videos from the Cutbend team</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Close instructions"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body is unmounted while closed so videos stop playing */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {!open ? null : loading && !content ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            </div>
          ) : failed ? (
            <p className="py-10 text-center text-sm text-gray-500">Instructions could not be loaded. Please try again.</p>
          ) : isEmpty ? (
            <div className="py-12 text-center">
              <BookOpenIcon className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No instructions have been published yet.</p>
            </div>
          ) : (
            <InstructionsList content={content} />
          )}
        </div>
      </aside>
    </>
  );
};

export default InstructionsDrawer;
