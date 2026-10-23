import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { quotationAPI, handleApiError } from '../services/api';

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';

const formatInr = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Update a sent quotation (new file and/or new total) and re-share it, or just re-send it.
 * Earlier files/amounts are kept and listed as previous versions.
 */
const ReshareQuotationModal = ({ quotation, onClose, onShared }) => {
  const [details, setDetails] = useState(null);
  const [file, setFile] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!quotation?._id) return undefined;
    let active = true;
    quotationAPI
      .getQuotation(quotation._id)
      .then((response) => {
        if (!active) return;
        const data = response.data.quotation || null;
        setDetails(data);
        if (data?.totalAmount) setAmount(String(data.totalAmount));
      })
      .catch(() => active && setDetails(null));
    return () => {
      active = false;
    };
  }, [quotation]);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && !submitting && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, submitting]);

  if (!quotation) return null;

  const currentAmount = Number(details?.totalAmount || 0);
  const parsedAmount = Number(amount);
  const amountValid = amount !== '' && Number.isFinite(parsedAmount) && parsedAmount > 0;
  const amountChanged = amountValid && Math.round(parsedAmount * 100) !== Math.round(currentAmount * 100);
  const isUpdate = Boolean(file) || amountChanged;
  const versions = [...(details?.versions || [])].reverse();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amountValid) {
      toast.error('Enter a valid total amount');
      return;
    }
    setSubmitting(true);
    try {
      const response = await quotationAPI.reshareQuotation(quotation._id, {
        file,
        note: note.trim(),
        totalAmount: amountChanged ? parsedAmount : undefined
      });
      if (response.data.emailSent) {
        toast.success(response.data.message);
      } else {
        toast(response.data.message, { icon: '⚠️' });
      }
      onShared?.(response.data.quotation);
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
        className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reshare-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h2 id="reshare-title" className="text-base font-semibold text-gray-900">Update &amp; re-share quotation</h2>
            <p className="text-sm text-gray-500">
              {quotation.quotationNumber || details?.quotationNumber}{quotation.customer ? ` · ${quotation.customer}` : ''}
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* File */}
          <div>
            <span className="block text-sm font-medium text-gray-700">Quotation file</span>
            <div className="mt-1 flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex min-w-0 items-center gap-2 text-sm text-gray-700">
                <DocumentTextIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <span className="truncate">
                  {file ? (
                    <><span className="font-medium text-blue-700">{file.name}</span> <span className="text-gray-500">(new)</span></>
                  ) : (
                    details?.quotationPdfFilename || 'Current quotation file'
                  )}
                </span>
              </p>
              <div className="flex flex-shrink-0 gap-2">
                {file && (
                  <button type="button" onClick={() => setFile(null)} className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100">
                    Keep current
                  </button>
                )}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50">
                  <ArrowUpTrayIcon className="h-4 w-4" /> {file ? 'Choose another' : 'Replace file'}
                </button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.dwg,.dxf,.zip,.xlsx,.xls" className="hidden"
              onChange={(e) => { setFile(e.target.files?.[0] || null); e.target.value = ''; }} />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="reshare-amount" className="block text-sm font-medium text-gray-700">
              Total amount (₹)<span className="ml-0.5 text-red-500">*</span>
            </label>
            <input id="reshare-amount" type="number" min="0.01" step="0.01" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" />
            {amountChanged && (
              <p className="mt-1 text-xs text-amber-700">Changes from {formatInr(currentAmount)} to {formatInr(parsedAmount)}.</p>
            )}
          </div>

          <div>
            <label htmlFor="reshare-note" className="block text-sm font-medium text-gray-700">Note for history (optional)</label>
            <input id="reshare-note" type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300}
              placeholder="e.g. Updated pricing for 2 mm sheets"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" />
          </div>

          <p className={`rounded-md px-3 py-2 text-xs ${isUpdate ? 'bg-amber-50 text-amber-800' : 'bg-gray-50 text-gray-600'}`}>
            {isUpdate
              ? 'The customer receives the updated quotation by email and must accept it again before paying. The previous version is kept below.'
              : 'Nothing changed - the current quotation will be emailed to the customer again.'}
          </p>

          <div>
            <h3 className="text-sm font-medium text-gray-900">Previous versions ({versions.length})</h3>
            {versions.length === 0 ? (
              <p className="mt-1 text-xs text-gray-500">No earlier versions yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-200">
                {versions.map((version, index) => (
                  <li key={version._id || index} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800">
                        {version.fileName || 'Quotation file'}
                        {version.totalAmount ? <span className="font-normal text-gray-500"> · {formatInr(version.totalAmount)}</span> : null}
                      </p>
                      <p className="text-xs text-gray-500">Replaced {formatDateTime(version.replacedAt)}</p>
                    </div>
                    {version.fileUrl && (
                      <a href={version.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 text-xs font-medium text-blue-600 hover:underline">
                        Open
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 rounded-b-xl border-t border-gray-200 bg-gray-50 px-5 py-3">
          <button type="button" onClick={onClose} disabled={submitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting || !details || !amountValid}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Sending...' : isUpdate ? 'Update & re-share' : 'Re-send to User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReshareQuotationModal;
