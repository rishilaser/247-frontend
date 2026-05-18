import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { quotationAPI, axios } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CloudinaryPDFViewer from '../../components/CloudinaryPDFViewer';
import QuotationPdfOverlay from '../../components/QuotationPdfOverlay';
import toast from 'react-hot-toast';

const QuotationResponse = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const getId = () => {
    let id = params.id;
    if (!id || id === 'undefined' || id === 'null') {
      const pathMatch = location.pathname.match(/\/quotation\/([^/]+)/);
      if (pathMatch && pathMatch[1]) {
        id = pathMatch[1];
      }
    }
    return id;
  };

  const id = getId();

  const handleClose = useCallback(() => {
    const isAdmin =
      user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin';
    navigate(isAdmin ? '/dashboard' : '/quotations', { replace: true });
  }, [navigate, user?.role]);

  useEffect(() => {
    if (!authLoading) {
      if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
        toast.error('Invalid quotation ID. Redirecting...');
        setLoading(false);
        setTimeout(() => navigate('/quotations', { replace: true }), 1500);
        return;
      }
      if (!fetchingRef.current) {
        fetchingRef.current = true;
        fetchQuotation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, location.pathname, authLoading]);

  const fetchQuotation = async () => {
    try {
      const currentId = getId();
      if (!currentId || currentId === 'undefined' || currentId === 'null' || currentId.trim() === '') {
        toast.error('Invalid quotation ID. Please check the URL.');
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      setLoading(true);
      fetchingRef.current = true;
      const response = await quotationAPI.getQuotation(currentId);

      if (response.data.success) {
        setQuotation(response.data.quotation);
      } else {
        toast.error(response.data.message || 'Failed to fetch quotation');
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || axios.isCancel?.(error)) {
        return;
      }

      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Invalid quotation ID provided');
        navigate('/quotations', { replace: true });
      } else if (error.response?.status === 403) {
        toast.error('Access denied. This quotation does not belong to you.');
        navigate('/quotations', { replace: true });
      } else if (error.response?.status === 404) {
        toast.error('Quotation not found.');
        navigate('/quotations', { replace: true });
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to fetch quotation. Please try again.');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  if (loading || authLoading) {
    return (
      <QuotationPdfOverlay title="Loading quotation..." onClose={handleClose}>
        <div className="flex h-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </QuotationPdfOverlay>
    );
  }

  if (!quotation) {
    return (
      <QuotationPdfOverlay title="Quotation not found" onClose={handleClose}>
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <p className="mb-6 text-sm text-gray-600">This quotation could not be loaded.</p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to quotations
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
      <QuotationPdfOverlay title={title} onClose={handleClose}>
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <p className="mb-6 text-sm text-gray-600">
            The quotation PDF is being prepared. Please check back later or contact support.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to quotations
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
        onClose={handleClose}
      />
    );
  }

  const quotationId = quotation._id || getId();
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const apiPdfUrl = `${apiBaseUrl}/quotation/${quotationId}/pdf?token=${encodeURIComponent(token || '')}`;

  return (
    <QuotationPdfOverlay title={title} onClose={handleClose}>
      <iframe src={apiPdfUrl} className="h-full w-full border-0" title={title} />
    </QuotationPdfOverlay>
  );
};

export default QuotationResponse;
