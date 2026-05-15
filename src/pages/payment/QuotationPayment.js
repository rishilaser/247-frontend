import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quotationAPI, paymentAPI, axios } from '../../services/api';
import toast from 'react-hot-toast';

const QuotationPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod] = useState('online');
  const fetchingRef = useRef(false); // Prevent duplicate fetches

  // Helper function to get valid quotation ID
  const getQuotationId = () => {
    const quotationId = quotation?._id || quotation?.id || id;
    if (!quotationId || quotationId === 'undefined' || quotationId === 'null') {
      return null;
    }
    return quotationId;
  };

  useEffect(() => {
    if (id && !fetchingRef.current) {
      fetchingRef.current = true;
      fetchQuotation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-refresh when page becomes visible (user switches back to tab/window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && id) {
        fetchingRef.current = false; // Reset ref to allow refresh
        fetchQuotation();
      }
    };

    const handleFocus = () => {
      if (id) {
        fetchingRef.current = false; // Reset ref to allow refresh
        fetchQuotation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const response = await quotationAPI.getQuotation(id);
      
      if (response.data.success) {
        setQuotation(response.data.quotation);
      } else {
        toast.error(response.data.message || 'Failed to fetch quotation details');
      }
    } catch (error) {
      // Ignore cancellation errors - they're expected when requests are cancelled
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || axios.isCancel?.(error)) {
        // Silently return - this is expected behavior when a new request cancels the old one
        return;
      }
      
      console.error('Error fetching quotation:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error('Access denied. This quotation does not belong to you.');
        navigate('/inquiries');
      } else if (error.response?.status === 404) {
        toast.error('Quotation not found.');
        navigate('/inquiries');
      } else if (error.response?.status === 401) {
        // 401 is handled by axios interceptor - will logout automatically
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error('Failed to fetch quotation details. Please try again.');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      if (paymentMethod === 'online') {
        const quotationId = getQuotationId();
        if (!quotationId) {
          toast.error('Invalid quotation. Please try again.');
          return;
        }

        // Hosted checkout flow: create a Zoho-hosted payment link (URL) and redirect user.
        toast.loading('Redirecting to secure payment...', { id: 'zoho-pay' });
        const resp = await paymentAPI.createZohoPaymentLink(quotationId);
        const { url } = resp?.data || {};
        if (!url) {
          toast.error('Failed to create payment link. Please try again.', { id: 'zoho-pay' });
          return;
        }

        try {
          sessionStorage.setItem('zohoPendingQuotationId', String(quotationId));
        } catch {
          /* ignore storage errors */
        }

        window.location.assign(url);

        return;
      } else {
        toast.error('Only Zoho online payment is available.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.', { id: 'zoho-pay' });
    } finally {
      setPaymentLoading(false);
    }
  };

  const acceptQuotation = async () => {
    try {
      const response = await quotationAPI.acceptQuotation(quotation._id);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to accept quotation');
      }
    } catch (error) {
      console.error('Error accepting quotation:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Quotation not found</h1>
            <Link to="/inquiries" className="text-blue-600 hover:text-blue-800">
              Back to Inquiries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          {(() => {
            const quotationId = getQuotationId();
            if (!quotationId) return null;
            return (
              <Link
                to={`/quotation/${quotationId}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Back to Quotation
              </Link>
            );
          })()}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quotation Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quotation ID:</span>
                  <span className="text-sm font-medium text-gray-900">#{quotation.quotationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Inquiry ID:</span>
                  <span className="text-sm font-medium text-gray-900">#{quotation.inquiry?.inquiryNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valid Until:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="space-y-2">
                    {quotation.parts?.map((part, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{part.partRef} ({part.material})</span>
                        <span className="text-gray-900">₹{part.totalPrice?.toFixed(2) || '0.00'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span>₹{quotation.totalAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>

              <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-white border border-blue-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-blue-700 tracking-wide">ZOHO</span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Zoho Checkout</div>
                      <div className="text-xs text-blue-700">Secure online payment</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
                    Recommended
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                        {paymentLoading ? 'Processing...' : `Pay ₹${quotation.totalAmount?.toFixed(2) || '0.00'}`}
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  By proceeding, you agree to our Terms & Conditions and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPayment;