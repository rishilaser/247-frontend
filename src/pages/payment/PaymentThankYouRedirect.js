import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentThankYouRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto py-8 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-xl p-8 text-center">
        <div className="text-2xl font-bold text-green-700">Payment Successful</div>
        <p className="mt-3 text-gray-600">Thank you! Redirecting to dashboard in 3 seconds...</p>
        <div className="mt-6 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentThankYouRedirect;
