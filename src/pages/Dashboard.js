import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { quotationAPI, inquiryAPI, orderAPI, paymentAPI } from '../services/api';
import {
  getZohoReturnPayload,
  clearZohoReturnPayload,
  hasZohoReturnPayload,
} from '../utils/zohoReturnParams';
import { SHOW_MY_QUOTATIONS_PAGE } from '../config/featureFlags';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Redirect admin/backoffice users to their respective dashboards
  useEffect(() => {
    // Only redirect if user data is loaded and user is admin/backoffice
    if (user && (user.role === 'admin' || user.role === 'backoffice' || user.role === 'subadmin')) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate, loading]);
  
  // Initialize state variables first
  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Role-based stats
  const getRoleBasedStats = () => {
    if (user?.role === 'admin' || user?.role === 'backoffice') {
      return {
        totalInquiries: 12,
        quotations: 8,
        activeOrders: 5,
        completed: 3
      };
    } else {
      return {
        totalInquiries: 0,
        quotations: 0,
        activeOrders: 0,
        completed: 0
      };
    }
  };

  const [stats, setStats] = useState(getRoleBasedStats());

  // Helper function to get valid quotation ID
  const getQuotationId = (quotation) => {
    const id = quotation?._id || quotation?.id;
    if (!id || id === 'undefined' || id === 'null') {
      return null;
    }
    return id;
  };

  // Update stats when data changes
  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'backoffice') {
      setStats({
        totalInquiries: inquiries.length,
        quotations: quotations.length,
        activeOrders: orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled').length,
        completed: orders.filter(order => order.status === 'delivered').length
      });
    }
  }, [inquiries, quotations, orders, user]);

  // Use ref to track if data has been fetched to prevent duplicate calls
  const hasFetchedRef = useRef(false);
  const pendingZohoSyncRef = useRef(false);

  // Fetch quotations for customer - memoized with useCallback
  const fetchQuotations = useCallback(async () => {
    try {
      setQuotationsLoading(true);
      const response = await quotationAPI.getQuotations();
      if (response.data.success) {
        setQuotations(response.data.quotations || []);
      }
    } catch (error) {
      // Don't log cancellation errors
      if (error.name !== 'CanceledError' && process.env.NODE_ENV === 'development') {
        console.error('Error fetching quotations:', error);
      }
    } finally {
      setQuotationsLoading(false);
    }
  }, []);

  // Fetch inquiries for customer - memoized with useCallback
  const fetchInquiries = useCallback(async () => {
    try {
      setInquiriesLoading(true);
      const response = await inquiryAPI.getInquiries();
      if (response.data.success) {
        setInquiries(response.data.inquiries || []);
      }
    } catch (error) {
      // Don't log cancellation errors
      if (error.name !== 'CanceledError' && process.env.NODE_ENV === 'development') {
        console.error('Error fetching inquiries:', error);
      }
    } finally {
      setInquiriesLoading(false);
    }
  }, []);

  // Fetch orders for customer - memoized with useCallback
  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const response = await orderAPI.getOrders();
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      // Don't log cancellation errors
      if (error.name !== 'CanceledError' && process.env.NODE_ENV === 'development') {
        console.error('Error fetching orders:', error);
      }
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const paySyncQuotationId = searchParams.get('orderId');

  const getZohoReturnFromSearchParams = useCallback(
    () => getZohoReturnPayload(searchParams),
    [searchParams]
  );

  const runZohoPaymentSync = useCallback(async (quotationId, zohoReturn = null) => {
    if (!quotationId) return { updated: false };
    try {
      const res = await paymentAPI.syncZohoPaymentStatus(quotationId, zohoReturn);
      return res?.data || { updated: false };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Zoho payment sync failed:', err?.response?.data || err?.message);
      }
      return { updated: false, error: true };
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'customer') return undefined;

    let storedId = null;
    try {
      storedId = sessionStorage.getItem('zohoPendingQuotationId');
    } catch {
      storedId = null;
    }
    const zohoReturn = getZohoReturnFromSearchParams();
    const quotationIdToSync =
      paySyncQuotationId ||
      storedId ||
      zohoReturn?.payment_link_reference ||
      null;
    if (!quotationIdToSync) return undefined;

    const hasReturn = hasZohoReturnPayload(searchParams);

    let cancelled = false;
    (async () => {
      const returnPayload = hasReturn ? getZohoReturnPayload(searchParams) : null;
      const result = await runZohoPaymentSync(quotationIdToSync, returnPayload);
      if (cancelled) return;
      if (result?.updated || result?.gatewayPaid || result?.notificationsEnsured) {
        queryClient.invalidateQueries('notifications');
        try {
          sessionStorage.removeItem('zohoPendingQuotationId');
          if (hasReturn) clearZohoReturnPayload();
        } catch {
          /* ignore */
        }
      }
      await Promise.all([fetchQuotations(), fetchInquiries()]);
      if (paySyncQuotationId || zohoReturn) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            [
              'orderId',
              'payment_link_id',
              'payment_id',
              'amount',
              'status',
              'signature',
              'payment_link_reference',
            ].forEach((k) => next.delete(k));
            return next;
          },
          { replace: true }
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    paySyncQuotationId,
    user?.role,
    fetchQuotations,
    fetchInquiries,
    setSearchParams,
    runZohoPaymentSync,
    getZohoReturnFromSearchParams,
    queryClient,
  ]);

  const isInquiryGatewayPaid = useCallback((inquiry) => {
    if (inquiry?.status === 'payment_received') return true;
    const q = inquiry?.quotation;
    return q?.orderPaymentWorkflowStatus === 'Paid' && q?.payment_status === 'Success';
  }, []);

  const getInquiryStatusLabel = useCallback(
    (inquiry) => {
      if (isInquiryGatewayPaid(inquiry)) return 'Paid';
      if (inquiry?.status === 'payment_received') return 'Paid';
      return inquiry.status?.charAt(0).toUpperCase() + inquiry.status?.slice(1) || 'Pending';
    },
    [isInquiryGatewayPaid]
  );

  // Background heal only when Zoho return params are in the URL (avoids 401 GET spam without READ scope).
  useEffect(() => {
    if (user?.role !== 'customer' || pendingZohoSyncRef.current || inquiriesLoading) return undefined;
    const zohoReturn = getZohoReturnFromSearchParams();
    if (!zohoReturn) return undefined;

    const pending = (inquiries || [])
      .filter((inq) => {
        const q = inq.quotation;
        return (
          q?._id &&
          q?.zohoPaymentLinkId &&
          q.orderPaymentWorkflowStatus === 'Payment Pending' &&
          inq.status !== 'payment_received'
        );
      })
      .slice(0, 1);
    if (!pending.length) return undefined;

    pendingZohoSyncRef.current = true;
    let cancelled = false;
    (async () => {
      const inq = pending[0];
      if (cancelled) return;
      await runZohoPaymentSync(inq.quotation._id, zohoReturn);
      if (!cancelled) await fetchInquiries();
    })();

    return () => {
      cancelled = true;
    };
  }, [inquiries, inquiriesLoading, user?.role, runZohoPaymentSync, fetchInquiries, getZohoReturnFromSearchParams]);

  // Fetch data when tabs are active - always fetch fresh data
  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'backoffice' && user?.role !== 'subadmin') {
      if (activeTab === 'quotations') {
        fetchQuotations();
      } else if (activeTab === 'inquiries') {
        fetchInquiries();
      } else if (activeTab === 'orders') {
        fetchOrders();
      } else if (activeTab === 'overview') {
        // Fetch all data for overview tab
        fetchQuotations();
        fetchInquiries();
        fetchOrders();
      }
    }
  }, [activeTab, user, fetchQuotations, fetchInquiries, fetchOrders]);

  // Initial data fetch on mount
  useEffect(() => {
    if (user && 
        user.role !== 'admin' && 
        user.role !== 'backoffice' && 
        user.role !== 'subadmin' &&
        activeTab === 'overview') {
      // Fetch all data on initial load
      fetchQuotations();
      fetchInquiries();
      fetchOrders();
    }
  }, [user]); // Only depend on user, not on fetch functions

  const [recentActivity] = useState([
    {
      id: 1,
      type: 'inquiry',
      title: 'New inquiry submitted',
      description: 'Sheet metal parts for automotive industry',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'quotation',
      title: 'Quotation prepared',
      description: 'Custom brackets and panels',
      time: '1 day ago',
      status: 'sent'
    },
    {
      id: 3,
      type: 'order',
      title: 'Order confirmed',
      description: 'Production started for order #KO-2026-001',
      time: '3 days ago',
      status: 'confirmed'
    }
  ]);

  // eslint-disable-next-line no-unused-vars
  const [recentOrders] = useState([
    {
      id: 1,
      orderNumber: 'KO-2064-001',
      product: 'Sheet Metal Brackets',
      status: 'In Production',
      amount: 2500.00,
      date: '2025-01-15'
    },
    {
      id: 2,
      orderNumber: 'KO-2026-002',
      product: 'Laser Cut Panels',
      status: 'Shipped',
      amount: 1800.00,
      date: '2025-01-12'
    }
  ]);

  // eslint-disable-next-line no-unused-vars
  const workflowSteps = [
    {
      step: 1,
      title: 'Inquiry Generation',
      status: 'current',
      color: 'green'
    },
    {
      step: 2,
      title: 'Quotation Process',
      status: 'current',
      color: 'yellow'
    },
    {
      step: 3,
      title: 'Customer Response',
      status: 'current',
      color: 'blue'
    },
    {
      step: 4,
      title: 'Payment Process',
      status: 'pending',
      color: 'purple'
    },
    {
      step: 5,
      title: 'Order Confirmation',
      status: 'pending',
      color: 'dark-blue'
    },
    {
      step: 6,
      title: 'Order Dispatch',
      status: 'pending',
      color: 'grey'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'inquiries', name: 'Inquiries', icon: '📄' },
    ...(SHOW_MY_QUOTATIONS_PAGE ? [{ id: 'quotations', name: 'Quotations', icon: '🏷️' }] : []),
    { id: 'orders', name: 'Orders', icon: '📦' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show message if user is not loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access your dashboard</h2>
          <Link 
            to="/login" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto ">
        <div className="px-4 py-2 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.firstName || user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 text-sm">
              {user?.role === 'admin' || user?.role === 'backoffice' 
                ? 'Manage inquiries, quotations, and orders from your back office dashboard.'
                : 'Here\'s what\'s happening with your manufacturing projects today.'
              }
            </p>
          </div>

          {/* Tabs Navigation - Only show for customer users */}
          {user && user.role === 'customer' && (
            <div className="mb-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard Navigation</h3>
                <nav className="flex flex-wrap gap-7">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white shadow-md transform scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Tab Content - Only show for customer users */}
          {user && user.role === 'customer' && activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total Inquiries', value: stats.totalInquiries, icon: '📄', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                  { label: 'Quotations', value: stats.quotations, icon: '🏷️', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
                  { label: 'Active Orders', value: stats.activeOrders, icon: '📦', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
                  { label: 'Completed', value: stats.completed, icon: '✅', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 shrink-0 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                        <span className={`${stat.iconColor} text-sm`}>{stat.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500 truncate">{stat.label}</p>
                        <p className="text-lg font-bold text-gray-900 leading-tight">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-3 py-2 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Only show for customer users */}
                    {user?.role === 'customer' && (
                      <Link
                        to="/inquiry/new"
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-green-600 text-lg">📄</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Submit New Inquiry</h4>
                          <p className="text-sm text-gray-500">Submit a new manufacturing inquiry</p>
                        </div>
                      </Link>
                    )}

                    <Link
                      to="/inquiries"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-blue-600 text-lg">📋</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">View All Inquiries</h4>
                        <p className="text-sm text-gray-500">Check status of your inquiries</p>
                      </div>
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-purple-600 text-lg">🛒</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Track Orders</h4>
                        <p className="text-sm text-gray-500">Track your orders and deliveries</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Quotations */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Quotations</h3>
                  </div>
                  <div className="p-3 max-h-80 overflow-y-auto" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db #f3f4f6'
                  }}>
                    {quotations.length > 0 ? (
                      <div className="space-y-3">
                        {quotations.slice(0, 3).map((quotation, index) => (
                          <div key={quotation._id || quotation.id || `quotation-${quotation.quotationNumber || index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                Quotation #{quotation.quotationNumber || quotation.id}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {new Date(quotation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                quotation.status === 'sent' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : (quotation.orderPaymentWorkflowStatus === 'Paid' && quotation.payment_status === 'Success')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : quotation.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {(quotation.orderPaymentWorkflowStatus === 'Paid' && quotation.payment_status === 'Success')
                                  ? 'Paid'
                                  : quotation.status === 'order_created'
                                  ? 'Payment Pending'
                                  : quotation.status?.charAt(0).toUpperCase() + quotation.status?.slice(1) || 'Pending'}
                              </span>
                              {quotation.totalAmount && (
                                <span className="text-sm font-semibold text-gray-900">
                                  ₹{quotation.totalAmount.toLocaleString()}
                                </span>
                              )}
                              {quotation.status === 'sent' && (() => {
                                const quotationId = getQuotationId(quotation);
                                if (!quotationId) return null;
                                return (
                                  <button
                                    onClick={() => navigate(`/quotation/${quotationId}/payment`)}
                                    className="bg-orange-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-orange-600 transition-colors"
                                  >
                                    Pay Now
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                        {SHOW_MY_QUOTATIONS_PAGE && quotations.length > 0 && (
                          <div className="text-center pt-1">
                            <Link
                              to="/quotations"
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View All Quotations
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-2">🏷️</div>
                        <p className="text-sm text-gray-500">No quotations available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="p-3 max-h-80 overflow-y-auto" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d1d5db #f3f4f6'
                  }}>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              activity.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : activity.status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {activity.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Quotations Tab Content */}
          {user && user.role === 'customer' && activeTab === 'quotations' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Your Quotations</h3>
                  <p className="text-sm text-gray-600 mt-1">View and respond to quotations from our team</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  {quotationsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading quotations...</span>
                    </div>
                  ) : quotations.length > 0 ? (
                    <div className="space-y-4">
                      {quotations.map((quotation, index) => (
                        <div key={quotation._id || quotation.id || `quotation-${quotation.quotationNumber || index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">
                                Quotation #{quotation.quotationNumber || quotation._id || quotation.id}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Inquiry: {quotation.inquiry?.inquiryNumber || quotation.inquiryId || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Created: {new Date(quotation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                quotation.status === 'sent' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : (quotation.orderPaymentWorkflowStatus === 'Paid' && quotation.payment_status === 'Success')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : quotation.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : quotation.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {(quotation.orderPaymentWorkflowStatus === 'Paid' && quotation.payment_status === 'Success')
                                  ? 'Paid'
                                  : quotation.status === 'order_created'
                                  ? 'Payment Pending'
                                  : quotation.status?.charAt(0).toUpperCase() + quotation.status?.slice(1) || 'Pending'}
                              </span>
                              {quotation.totalAmount && (
                                <span className="text-lg font-semibold text-gray-900">
                                  ₹{quotation.totalAmount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {(
                            quotation.status === 'sent' ||
                            quotation.status === 'accepted' ||
                            quotation.orderPaymentWorkflowStatus === 'Payment Pending'
                          ) &&
                          !(
                            quotation.orderPaymentWorkflowStatus === 'Paid' &&
                            quotation.payment_status === 'Success'
                          ) && (() => {
                            const quotationId = getQuotationId(quotation);
                            if (!quotationId) return null;
                            return (
                              <div className="mt-4 flex space-x-3">
                                <button
                                  onClick={() => navigate(`/quotation/${quotationId}/payment`)}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                  <span className="mr-2">💳</span>
                                  Pay Now
                                </button>
                              </div>
                            );
                          })()}
                          {quotation.status === 'order_created' && (() => {
                            const quotationId = getQuotationId(quotation);
                            if (!quotationId) return null;
                            return (
                              <div className="mt-4 flex space-x-3">
                                <Link
                                  to="/orders"
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                  View orders
                                </Link>
                              </div>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🏷️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations yet</h3>
                      <p className="text-gray-600 mb-4">Your quotations will appear here once submitted.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inquiries Tab Content */}
          {user && user.role === 'customer' && activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Your Inquiries</h3>
                  <p className="text-sm text-gray-600 mt-1">Track the status of your manufacturing inquiries</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  {inquiriesLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading inquiries...</span>
                    </div>
                  ) : inquiries.length > 0 ? (
                    <div 
                      className="space-y-4 overflow-y-auto inquiries-scroll-container"
                      style={{ 
                        maxHeight: '650px',
                        scrollbarWidth: 'none', /* Firefox */
                        msOverflowStyle: 'none' /* IE and Edge */
                      }}
                    >
                      <style>{`
                        .inquiries-scroll-container::-webkit-scrollbar {
                          display: none; /* Chrome, Safari, Opera */
                        }
                        .inquiries-scroll-container {
                          -ms-overflow-style: none; /* IE and Edge */
                          scrollbar-width: none; /* Firefox */
                        }
                      `}</style>
                      {inquiries.map((inquiry) => (
                        <div key={inquiry._id || inquiry.id || `inquiry-${inquiry.inquiryNumber || Math.random()}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              {inquiry.inquiryNumber ? (
                                <p
                                  className="min-w-0 max-w-full truncate text-lg font-semibold tabular-nums tracking-tight text-gray-900"
                                  title={inquiry.inquiryNumber}
                                >
                                  {inquiry.inquiryNumber}
                                </p>
                              ) : (
                                <h4
                                  className="min-w-0 max-w-full truncate text-lg font-medium tabular-nums text-gray-900"
                                  title={inquiry.title || `Inquiry #${inquiry.id}`}
                                >
                                  {inquiry.title || `Inquiry #${inquiry.id}`}
                                </h4>
                              )}
                              {inquiry.inquiryNumber && inquiry.title ? (
                                <p className="mt-1 break-words text-sm font-medium text-gray-800">{inquiry.title}</p>
                              ) : null}
                              <p className="text-sm text-gray-600 mt-1">
                                {inquiry.description || 'No description available'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Created: {new Date(inquiry.createdAt).toLocaleDateString()}
                              </p>
                              {inquiry.material && (
                                <p className="text-sm text-gray-500">
                                  Material: {inquiry.material} | Thickness: {inquiry.thickness} | Quantity: {inquiry.quantity}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                isInquiryGatewayPaid(inquiry)
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : inquiry.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : inquiry.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : inquiry.status === 'payment_received'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : inquiry.status === 'accepted'
                                  ? 'bg-green-100 text-green-800'
                                  : inquiry.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : inquiry.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {getInquiryStatusLabel(inquiry)}
                              </span>
                            </div>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">📋</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                      <p className="text-gray-600 mb-4">Your inquiries will appear here once submitted.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab Content */}
          {user && user.role === 'customer' && activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Your Orders</h3>
                  <p className="text-sm text-gray-600 mt-1">Track your manufacturing orders and deliveries</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto" style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}>
                  {ordersLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading orders...</span>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id || order.id || `order-${order.orderNumber || Math.random()}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-medium text-gray-900">
                                Order #{order.orderNumber || order.id}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {order.description || 'Manufacturing Order'}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Created: {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              {order.deliveryDate && (
                                <p className="text-sm text-gray-500">
                                  Expected Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                order.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'confirmed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'in_production'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'shipped'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                              </span>
                              {order.totalAmount && (
                                <span className="text-lg font-semibold text-gray-900">
                                  ₹{order.totalAmount.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex space-x-3">
                            <Link
                              to={`/order/${order._id || order.id}`}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              View Details
                            </Link>
                            {order.status === 'shipped' && (
                              <Link
                                to={`/order/${order._id || order.id}/tracking`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                Track Order
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">📦</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-4">Your orders will appear here once you accept a quotation.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab Content */}
          {user && user.role === 'customer' && activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">View your manufacturing project analytics</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalInquiries}</div>
                      <div className="text-sm text-blue-800">Total Inquiries</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{stats.quotations}</div>
                      <div className="text-sm text-yellow-800">Quotations</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.activeOrders}</div>
                      <div className="text-sm text-green-800">Active Orders</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
                      <div className="text-sm text-purple-800">Completed</div>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📈</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                    <p className="text-gray-600">Detailed charts and insights coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback content for non-customer users */}
          {user && user.role !== 'customer' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your {user.role} dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                You have been redirected to the appropriate dashboard for your role.
              </p>
              <Link 
                to="/admin/dashboard" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;