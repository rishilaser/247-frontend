import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import toast from 'react-hot-toast';

const formatSnakeLabel = (value) => {
  if (!value || typeof value !== 'string') return 'N/A';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const getOrderNumberStr = (order) => {
  if (typeof order.orderNumber === 'string') return order.orderNumber;
  if (order.orderNumber && typeof order.orderNumber === 'object' && order.orderNumber?.orderNumber) {
    return String(order.orderNumber.orderNumber);
  }
  return '';
};

const getInquiryNumberStr = (order) => {
  if (typeof order.inquiryNumber === 'string') return order.inquiryNumber;
  if (typeof order.inquiryId === 'string') return order.inquiryId;
  if (typeof order.inquiry === 'string') return order.inquiry;
  if (order.inquiry && typeof order.inquiry === 'object' && order.inquiry.inquiryNumber) {
    return String(order.inquiry.inquiryNumber);
  }
  return '';
};

const getQuotationIdForPayment = (order) => {
  const q = order?.quotation;
  if (!q) return null;
  if (typeof q === 'object' && q._id) return String(q._id);
  return String(q);
};

const OrderList = () => {
  const { user } = useAuth();
  const { subscribe, isConnected } = useWebSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (user?._id) {
      fetchOrders();
      
      // Set up real-time polling for order updates (fallback when WebSocket is offline)
      // Poll every 15 seconds if WebSocket is not connected, otherwise every 60 seconds
      const pollInterval = isConnected ? 60000 : 15000;
      
      const interval = setInterval(() => {
        fetchOrders();
      }, pollInterval);
      
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, isConnected]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!user?._id) return;

    const unsubscribeOrderUpdate = subscribe('order_update', (data) => {
      console.log('Order update received:', data);
      // Refresh orders list to get latest data
      fetchOrders();
      if (data.data?.orderNumber) {
        toast.success(`Order ${data.data.orderNumber} status updated to ${data.data.newStatus || 'updated'}`);
      }
    });

    const unsubscribeDispatch = subscribe('dispatch', (data) => {
      console.log('Dispatch update received:', data);
      // Refresh orders list to get latest data
      fetchOrders();
      if (data.data?.orderNumber) {
        toast.success(`Order ${data.data.orderNumber} has been dispatched!`);
      }
    });

    const unsubscribePayment = subscribe('payment', (data) => {
      console.log('Payment update received:', data);
      // Refresh orders list to get latest data
      fetchOrders();
      if (data.data?.orderNumber) {
        toast.success(`Payment received for order ${data.data.orderNumber}`);
      }
    });

    return () => {
      unsubscribeOrderUpdate();
      unsubscribeDispatch();
      unsubscribePayment();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, subscribe]);

  const fetchOrders = async () => {
    // Prevent duplicate fetches
    if (fetchingRef.current) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      if (!user?._id) {
        setOrders([]);
        return;
      }
      
      // Use customer API endpoint (uses authenticated user's ID from token)
      const response = await orderAPI.getCustomerOrders();
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setOrders([]);
        // Don't show error if no orders found - that's normal
        if (response.data.message && !response.data.message.includes('No orders')) {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      // Ignore cancellation errors
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return;
      }
      
      // Only log real errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching orders:', error);
      }
      
      // Handle specific errors
      if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to view orders.');
      } else if (error.response?.status === 404) {
        // No orders found is normal, don't show error
        setOrders([]);
      } else if (error.response?.status === 401) {
        // 401 is handled by axios interceptor
        // Don't show error here
      } else {
        // Only show error for actual failures, not for "no orders found"
        if (error.response?.status !== 404) {
          // Don't show error for network issues - polling will retry
          if (error.message !== 'Network Error') {
            toast.error('Failed to fetch orders. Please try again.');
          }
        }
        setOrders([]);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'dispatched':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'ready_for_dispatch':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'in_production':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'confirmed':
        return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'partially_paid':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'overdue':
        return 'bg-red-200 text-red-900 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const ordNum = getOrderNumberStr(order).toLowerCase();
      const inqNum = getInquiryNumberStr(order).toLowerCase();
      const matchesSearch = !q || ordNum.includes(q) || inqNum.includes(q);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-7xl py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <div className="w-full min-w-0 px-0 py-6">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Orders</h1>
              <p className="mt-2 text-gray-600">Track and manage your orders</p>
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <div
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-yellow-500'}`}
              />
              <span className={`min-w-0 break-words ${isConnected ? 'text-green-700' : 'text-yellow-800'}`}>
                {isConnected ? 'Live updates on' : 'Polling every 15s when live is off'}
              </span>
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by order or inquiry number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full min-w-0 rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="relative min-w-0 sm:w-52">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-10 pr-10 leading-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: 'none',
                  }}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_production">In production</option>
                  <option value="ready_for_dispatch">Ready for dispatch</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Orders: cards on small screens, table from md */}
          <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
            {filteredOrders.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="mb-4 text-lg text-gray-500">No orders found</div>
                {user?.role === 'customer' && (
                  <Link
                    to="/inquiry/new"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Create your first inquiry
                  </Link>
                )}
                {user?.role !== 'customer' && (
                  <div className="text-sm text-gray-500">
                    No orders found. Orders will appear here once customers place them.
                  </div>
                )}
              </div>
            ) : (
              <>
                <div
                  className="max-h-[32rem] min-w-0 space-y-3 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:hidden"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}
                >
                  {filteredOrders.map((order) => {
                    const oid = order._id || order.id;
                    const onum = getOrderNumberStr(order) || 'N/A';
                    const inq = getInquiryNumberStr(order) || '—';
                    const ordered =
                      order.createdAt != null
                        ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                        : 'N/A';
                    const paySt = order.payment?.status || order.paymentStatus;
                    const delivery = order.dispatch?.estimatedDelivery
                      ? new Date(order.dispatch.estimatedDelivery).toLocaleDateString()
                      : order.production?.estimatedCompletion
                        ? new Date(order.production.estimatedCompletion).toLocaleDateString()
                        : 'TBD';
                    return (
                      <div
                        key={oid || onum}
                        className="min-w-0 rounded-lg border border-gray-200 bg-gray-50/30 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div
                            className="min-w-0 max-w-full truncate text-lg font-bold tabular-nums text-gray-900"
                            title={onum}
                          >
                            {onum}
                          </div>
                          <span
                            className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {formatSnakeLabel(order.status)}
                          </span>
                        </div>
                        <div className="mt-2 min-w-0 text-sm text-gray-600">
                          <span>Inquiry: </span>
                          <span className="inline-block min-w-0 max-w-full truncate font-medium tabular-nums text-gray-800" title={inq}>
                            {inq}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Ordered on {ordered}</p>
                        <p className="mt-3 text-lg font-semibold text-gray-900">
                          ₹{(order.totalAmount || order.amount || 0).toFixed(2)}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentStatusColor(
                              paySt
                            )}`}
                          >
                            {formatSnakeLabel(paySt)}
                          </span>
                          <span className="text-xs text-gray-500">Delivery: {delivery}</span>
                        </div>
                        {oid ? (
                          <div className="mt-4 flex flex-col gap-2">
                            {user?.role === 'customer' &&
                              (paySt === 'pending' || paySt === 'failed') &&
                              getQuotationIdForPayment(order) && (
                                <Link
                                  to={`/quotation/${getQuotationIdForPayment(order)}/payment`}
                                  className="inline-flex w-full items-center justify-center rounded-md bg-orange-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
                                >
                                  Pay now
                                </Link>
                              )}
                            <Link
                              to={`/order/${oid}/tracking`}
                              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Track order
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="hidden min-w-0 md:block">
                  <div className="overflow-x-auto">
                    <div
                      className="max-h-96 overflow-y-auto"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db #f3f4f6',
                      }}
                    >
                      <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ORDER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AMOUNT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PAYMENT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DELIVERY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const payStRow = order.payment?.status || order.paymentStatus;
                    const qidPay = getQuotationIdForPayment(order);
                    return (
                    <tr key={order._id || order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {getOrderNumberStr(order) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Inquiry: {getInquiryNumberStr(order) || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{(order.totalAmount || order.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status === 'delivered' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.status === 'dispatched' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.status === 'ready_for_dispatch' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.status === 'in_production' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.status === 'confirmed' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.status === 'pending' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.status === 'cancelled' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          {formatSnakeLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment?.status || order.paymentStatus)}`}>
                          {order.payment?.status === 'completed' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.payment?.status === 'processing' && (
                            <svg className="w-3 h-3 mr-1 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.payment?.status === 'pending' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.payment?.status === 'failed' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.payment?.status === 'refunded' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.payment?.status === 'cancelled' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                          {order.payment?.status === 'overdue' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                          {formatSnakeLabel(order.payment?.status || order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.date || order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.dispatch?.estimatedDelivery 
                          ? new Date(order.dispatch.estimatedDelivery).toLocaleDateString()
                          : order.production?.estimatedCompletion 
                          ? new Date(order.production.estimatedCompletion).toLocaleDateString()
                          : 'TBD'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-1">
                          {user?.role === 'customer' &&
                            (payStRow === 'pending' || payStRow === 'failed') &&
                            qidPay && (
                              <Link
                                to={`/quotation/${qidPay}/payment`}
                                className="text-orange-600 hover:text-orange-800 font-medium"
                              >
                                Pay now
                              </Link>
                            )}
                          <Link
                            to={`/order/${order._id || order.id}/tracking`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Track
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );})}
                  </tbody>
                </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
