import React, { useState, useEffect, useRef, useCallback } from 'react';
import { quotationAPI, axios } from '../services/api';
import CloudinaryPDFViewer from './CloudinaryPDFViewer';
import QuotationPdfOverlay from './QuotationPdfOverlay';
import toast from 'react-hot-toast';

/**
 * In-page quotation PDF popup (used from Inquiry detail "Quoted" button).
 */
const QuotationPdfModal = ({ quotationId, isOpen, onClose }) => {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  const fetchQuotation = useCallback(async () => {
    if (!quotationId || quotationId === 'undefined' || quotationId === 'null') {
      toast.error('Quotation not available for this inquiry.');
      return;
    }

    try {
      setLoading(true);
      fetchingRef.current = true;
      const response = await quotationAPI.getQuotation(quotationId);

      if (response.data.success) {
        setQuotation(response.data.quotation);
      } else {
        toast.error(response.data.message || 'Failed to load quotation');
        setQuotation(null);
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || axios.isCancel?.(error)) {
        return;
      }
      if (error.response?.status === 404) {
        toast.error('Quotation not found.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have access to this quotation.');
      } else {
        toast.error('Failed to load quotation PDF.');
      }
      setQuotation(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [quotationId]);

  useEffect(() => {
    if (!isOpen) {
      setQuotation(null);
      fetchingRef.current = false;
      return;
    }
    if (!fetchingRef.current) {
      fetchQuotation();
    }
  }, [isOpen, quotationId, fetchQuotation]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <QuotationPdfOverlay title="Loading quotation..." onClose={onClose}>
        <div className="flex h-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </QuotationPdfOverlay>
    );
  }

  if (!quotation) {
    return (
      <QuotationPdfOverlay title="Quotation not found" onClose={onClose}>
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <p className="mb-6 text-sm text-gray-600">This quotation could not be loaded.</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </QuotationPdfOverlay>
    );
  }

  const pdfUrl = quotation.quotationPdfCloudinaryUrl || quotation.quotationPdf;
  const hasPdf = Boolean(pdfUrl);
  const title = `Quotation PDF - ${quotation.quotationNumber || 'Document'}`;

  if (!hasPdf) {
    return (
      <QuotationPdfOverlay title={title} onClose={onClose}>
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <p className="mb-6 text-sm text-gray-600">
            The quotation PDF is being prepared. Please check back later or contact support.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </QuotationPdfOverlay>
    );
  }

  if (pdfUrl.startsWith('http')) {
    return (
      <CloudinaryPDFViewer
        cloudinaryUrl={pdfUrl}
        filename={title}
        onClose={onClose}
      />
    );
  }

  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const apiPdfUrl = `${apiBaseUrl}/quotation/${quotation._id || quotationId}/pdf?token=${encodeURIComponent(token || '')}`;

  return (
    <QuotationPdfOverlay title={title} onClose={onClose}>
      <iframe src={apiPdfUrl} className="absolute inset-0 h-full w-full border-0" title={title} />
    </QuotationPdfOverlay>
  );
};

export default QuotationPdfModal;
