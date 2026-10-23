import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { XMarkIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { inquiryAPI, handleApiError } from '../services/api';

/**
 * Reject an inquiry with a mandatory reason. The customer is emailed using the
 * "Inquiry rejected" template (Admin → CMS → Emails & Reminders).
 */
const RejectInquiryModal = ({ inquiry, onClose, onRejected }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && !submitting && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, submitting]);

  if (!inquiry) return null;

  const trimmed = reason.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (trimmed.length < 3) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setSubmitting(true);
    try {
      const response = await inquiryAPI.rejectInquiry(inquiry._id, trimmed);
      if (response.data.emailSent) {
        toast.success(response.data.message);
      } else {
        toast(response.data.message, { icon: '⚠️' });
      }
      onRejected?.(response.data.inquiry);
      onClose();
    } catch (error) {
      toast.error(handleApiError(error).error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => !submitting && onClose()}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-inquiry-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <NoSymbolIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 id="reject-inquiry-title" className="text-base font-semibold text-gray-900">Reject inquiry</h2>
              <p className="text-sm text-gray-500">{inquiry.inquiryNumber}{inquiry.customer ? ` · ${inquiry.customer}` : ''}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700">
            Reason for rejection<span className="ml-0.5 text-red-500">*</span>
          </label>
          <textarea
            id="reject-reason"
            rows={4}
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={2000}
            placeholder="e.g. The requested material thickness is outside our current capability."
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-red-500"
          />
          <p className="text-xs text-gray-500">
            The customer receives this reason by email. Edit the email wording in CMS → Emails &amp; Reminders.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3 rounded-b-xl">
          <button type="button" onClick={onClose} disabled={submitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting || trimmed.length < 3}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Rejecting...' : 'Reject & notify customer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RejectInquiryModal;
