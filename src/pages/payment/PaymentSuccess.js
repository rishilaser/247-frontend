import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { quotationAPI, paymentAPI } from '../../services/api';
import {
  captureZohoReturnFromUrl,
  getZohoReturnPayload,
  clearZohoReturnPayload,
} from '../../utils/zohoReturnParams';

const POLL_MS = 12000;
const MAX_POLLS = 10;

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef(0);

  const getZohoReturnFromSearchParams = useCallback(
    () => getZohoReturnPayload(searchParams),
    [searchParams]
  );

  const fetchStatus = useCallback(async () => {
    if (!orderId) {
      setError('Missing order reference.');
      return;
    }
    try {
      const zohoReturn = getZohoReturnFromSearchParams();
      try {
        const syncRes = await paymentAPI.syncZohoPaymentStatus(orderId, zohoReturn);
        const syncData = syncRes?.data;
        if (syncData?.updated || syncData?.gatewayPaid) {
          setWorkflowStatus('Paid');
          setPaymentStatus('Success');
          setError(null);
          clearZohoReturnPayload();
          return;
        }
      } catch (syncErr) {
        const zohoReturnPaid =
          zohoReturn &&
          ['succeeded', 'paid', 'success', 'completed'].includes(
            String(zohoReturn.status || '').toLowerCase()
          );
        if (!zohoReturnPaid) {
          console.warn('Zoho sync failed:', syncErr?.response?.data || syncErr?.message);
        }
      }
      const response = await quotationAPI.getQuotation(orderId);
      const q = response?.data?.quotation;
      if (!response?.data?.success || !q) {
        setError(response?.data?.message || 'Could not load order.');
        return;
      }
      setWorkflowStatus(q.orderPaymentWorkflowStatus || null);
      setPaymentStatus(q.payment_status || null);
      setError(null);
      if (q.orderPaymentWorkflowStatus === 'Paid' && q.payment_status === 'Success') {
        clearZohoReturnPayload();
      }
    } catch (e) {
      if (e?.response?.status === 403 || e?.response?.status === 404) {
        setError('We could not find this order or you do not have access.');
      } else {
        setError('Unable to refresh payment status. You can open your dashboard and check again shortly.');
      }
    }
  }, [orderId, getZohoReturnFromSearchParams]);

  useEffect(() => {
    captureZohoReturnFromUrl();
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!orderId) return undefined;
    if (workflowStatus === 'Paid' && paymentStatus === 'Success') return undefined;
    if (workflowStatus === 'Failed') return undefined;
    if (pollRef.current >= MAX_POLLS) return undefined;

    const id = window.setInterval(() => {
      pollRef.current += 1;
      setPollCount(pollRef.current);
      if (pollRef.current >= MAX_POLLS) {
        window.clearInterval(id);
        return;
      }
      fetchStatus();
    }, POLL_MS);

    return () => window.clearInterval(id);
  }, [orderId, workflowStatus, paymentStatus, fetchStatus]);

  const isPaid = workflowStatus === 'Paid' && paymentStatus === 'Success';
  const isFailed = workflowStatus === 'Failed' || paymentStatus === 'Failed';

  if (!orderId) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <p className="text-gray-700">Missing order information in the return link.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (error && !workflowStatus) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <p className="text-red-700">{error}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment not completed</h1>
        <p className="mt-3 text-gray-600">
          The payment did not go through or was cancelled. You can try again from your quotation.
        </p>
        <Link
          to={`/quotation/${orderId}/payment`}
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back to payment
        </Link>
      </div>
    );
  }

  const urlShowsPaid =
    ['succeeded', 'paid', 'success', 'completed'].includes(
      String(searchParams.get('status') || '').toLowerCase()
    ) && Boolean(searchParams.get('payment_link_id'));

  if (isPaid || (pollRef.current >= MAX_POLLS && urlShowsPaid)) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold text-green-700">Payment successful</h1>
        <p className="mt-3 text-gray-600">
          Your payment has been confirmed. Thank you — our team will proceed with the next steps.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Verifying payment…</h1>
      <p className="mt-3 text-gray-600">
        Secure confirmation can take a few seconds. This page refreshes automatically. Do not close the tab.
      </p>
      <div className="mt-6 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
      {pollCount > 0 && (
        <p className="mt-4 text-xs text-gray-500">
          Still waiting on confirmation (check {pollCount} of up to {MAX_POLLS}). If this lasts several minutes,
          contact support with your quotation ID.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-amber-700">{error}</p>}
    </div>
  );
};

export default PaymentSuccess;
