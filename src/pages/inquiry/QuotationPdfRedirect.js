import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotationAPI } from '../../services/api';
import toast from 'react-hot-toast';

/**
 * Legacy /quotation/:id links → inquiry detail with quotation PDF popup open.
 */
const QuotationPdfRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!id || id === 'undefined' || id === 'null') {
        toast.error('Invalid quotation link');
        navigate('/quotations', { replace: true });
        return;
      }

      try {
        const response = await quotationAPI.getQuotation(id);
        if (cancelled) return;

        const quotation = response.data?.quotation;
        let inquiryId = quotation?.inquiryId;
        if (inquiryId && typeof inquiryId === 'object') {
          inquiryId = inquiryId._id;
        }

        if (inquiryId) {
          navigate(`/inquiry/${inquiryId}?quotationPdf=1`, { replace: true });
          return;
        }

        toast.error('Could not find inquiry for this quotation');
        navigate('/quotations', { replace: true });
      } catch {
        if (!cancelled) {
          toast.error('Could not load quotation');
          navigate('/quotations', { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>
  );
};

export default QuotationPdfRedirect;
