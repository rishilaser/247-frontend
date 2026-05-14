import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BackOfficeMaterialManagement from './BackOfficeMaterialManagement';
import QuotationForm from '../components/QuotationForm';
import SubAdminManagement from '../components/SubAdminManagement';
import { inquiryAPI, quotationAPI, adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const BackOfficeDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'inquiries');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pendingInquiries, setPendingInquiries] = useState([]);
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    inquiries: 0,
    quotations: 0,
    orders: 0,
    completed: 0
  });
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Helper function to format dates (reusable)
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Helper function to format customer name (reusable)
  const formatCustomerName = useCallback((customer) => {
    return `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'N/A';
  }, []);

  // Helper function to get status badge classes (reusable)
  const getStatusBadgeClasses = useCallback((status, type = 'inquiry') => {
    if (type === 'inquiry') {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'quoted':
          return 'bg-green-100 text-green-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        case 'accepted':
          return 'bg-blue-100 text-blue-800';
        case 'payment_received':
          return 'bg-emerald-100 text-emerald-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    } else if (type === 'quotation') {
      switch (status) {
        case 'draft':
          return 'bg-gray-100 text-gray-800';
        case 'sent':
          return 'bg-yellow-100 text-yellow-800';
        case 'accepted':
          return 'bg-green-100 text-green-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        case 'order_created':
          return 'bg-emerald-100 text-emerald-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    } else if (type === 'order') {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'confirmed':
          return 'bg-blue-100 text-blue-800';
        case 'in_production':
          return 'bg-purple-100 text-purple-800';
        case 'ready_for_dispatch':
          return 'bg-orange-100 text-orange-800';
        case 'dispatched':
          return 'bg-indigo-100 text-indigo-800';
        case 'delivered':
          return 'bg-green-100 text-green-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  }, []);

  // Helper function to format status text (reusable)
  const formatStatusText = useCallback((status) => {
    if (!status) return 'Unknown';
    if (status === 'payment_received') return 'Paid';
    if (status === 'order_created') return 'Paid';
    const withSpaces = String(status).replace(/_/g, ' ');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  }, []);

  const inquiryStatusOptions = useMemo(() => {
    const uniqueStatuses = [...new Set(pendingInquiries.map((inquiry) => inquiry.status).filter(Boolean))];
    return [
      { value: 'all', label: 'All Statuses' },
      ...uniqueStatuses.map((status) => ({
        value: status,
        label: formatStatusText(status)
      }))
    ];
  }, [pendingInquiries, formatStatusText]);

  const filteredInquiries = useMemo(() => {
    if (inquiryStatusFilter === 'all') return pendingInquiries;
    return pendingInquiries.filter((inquiry) => inquiry.status === inquiryStatusFilter);
  }, [pendingInquiries, inquiryStatusFilter]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      const now = Date.now();
      const shouldRefresh = forceRefresh || !lastFetchTime || (now - lastFetchTime) > 30000;
      
      if (!shouldRefresh) {
        return;
      }

      setLoading(true);
      setStatsLoading(true);
      
      const statsPromise = adminAPI.getDashboardStats();
      
      const [statsResponse, inquiryResponse, quotationResponse, orderResponse] = await Promise.allSettled([
        statsPromise,
        inquiryAPI.getAllInquiries(),
        quotationAPI.getAllQuotations(),
        user && ['admin', 'backoffice'].includes(user.role) ? adminAPI.getAllOrders() : Promise.resolve({ data: { success: false } })
      ]);

      if (statsResponse.status === 'fulfilled' && statsResponse.value.data.success) {
        setDashboardStats(statsResponse.value.data.stats);
      }
      setStatsLoading(false);

      if (inquiryResponse.status === 'fulfilled' && inquiryResponse.value.data.success) {
        const transformedInquiries = inquiryResponse.value.data.inquiries.map(inquiry => ({
          id: inquiry.inquiryNumber,
          customer: formatCustomerName(inquiry.customer),
          company: inquiry.customer?.companyName || 'N/A',
          files: inquiry.files?.length || 0,
          partsCount: inquiry.parts?.length || 0,
          status: inquiry.status,
          date: formatDate(inquiry.createdAt),
          _id: inquiry._id,
          inquiryNumber: inquiry.inquiryNumber,
          parts: inquiry.parts || [],
          customerData: inquiry.customer
        }));
        setPendingInquiries(transformedInquiries);
      }

      if (quotationResponse.status === 'fulfilled' && quotationResponse.value.data.success) {
        const transformedQuotations = quotationResponse.value.data.quotations.map(quotation => ({
          id: quotation.quotationNumber,
          inquiryId: quotation.inquiry?.inquiryNumber || 'N/A',
          customer: formatCustomerName(quotation.inquiry?.customer),
          company: quotation.inquiry?.customer?.companyName || 'N/A',
          amount: quotation.totalAmount,
          status: quotation.status,
          date: formatDate(quotation.createdAt),
          _id: quotation._id,
          quotationNumber: quotation.quotationNumber,
          quotationPdf: quotation.quotationPdf,
          quotationPdfCloudinaryUrl: quotation.quotationPdfCloudinaryUrl
        }));
        setQuotations(transformedQuotations);
      }

      if (orderResponse.status === 'fulfilled' && orderResponse.value.data.success) {
        const transformedOrders = orderResponse.value.data.orders.map(order => ({
          id: order.orderNumber,
          customer: formatCustomerName(order.customer),
          items: order.parts?.length || 0,
          status: order.status,
          amount: order.totalAmount,
          date: formatDate(order.createdAt),
          _id: order._id
        }));
        setOrders(transformedOrders);
      } else if (orderResponse.status === 'rejected') {
        const orderError = orderResponse.reason;
        
        if (orderError.name === 'CanceledError' || orderError.code === 'ERR_CANCELED') {
          return;
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching orders:', orderError);
        }
        
        if (orderError.response?.status === 401) {
          toast.error('Authentication failed. Please login again.');
        } else if (orderError.response?.status === 403) {
          toast.error('Access denied. You do not have permission to view orders.');
        } else if (orderError.response?.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(`Failed to fetch orders: ${orderError.response?.data?.message || orderError.message}`);
        }
        
        setOrders([]);
      }

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching data:', error);
      }
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setLastFetchTime(Date.now());
    }
  }, [user, lastFetchTime, formatDate, formatCustomerName]);

  const handleCreateQuotation = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowQuotationForm(true);
  };

  const handleQuotationSuccess = (quotation) => {
    toast.success(`Quotation ${quotation.quotationNumber} created successfully!`);
    fetchData(true);
  };

  const handleCloseQuotationForm = () => {
    setShowQuotationForm(false);
    setSelectedInquiry(null);
  };

  const handleSendQuotation = async (quotationId) => {
    try {
      const response = await quotationAPI.sendQuotation(quotationId);
      
      if (response.data.success) {
        toast.success('Quotation sent to customer successfully!');
        fetchData(true);
      } else {
        toast.error(response.data.message || 'Failed to send quotation');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending quotation:', error);
      }
      toast.error('Failed to send quotation');
    }
  };

  const handleDownloadPDF = async (quotation) => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const apiPdfUrl = `${apiBaseUrl}/quotation/${quotation._id}/pdf?download=true`;
      
      const response = await fetch(apiPdfUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        
        if (blob.size === 0) {
          toast.error('PDF is empty. Please try again.');
          return;
        }
        
        const arrayBuffer = await blob.slice(0, 4).arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const pdfHeader = String.fromCharCode(...uint8Array);
        
        if (pdfHeader !== '%PDF') {
          const text = await blob.text();
          try {
            const errorData = JSON.parse(text);
            toast.error(errorData.message || 'Failed to download PDF');
          } catch (e) {
            toast.error('Invalid PDF format received');
          }
          return;
        }
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quotation_${quotation.quotationNumber || quotation._id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('PDF downloaded successfully!');
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          toast.error(errorData.message || 'Failed to download PDF');
        } catch (e) {
          toast.error('Failed to download PDF');
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error downloading PDF:', error);
      }
      toast.error('Failed to download PDF. Please try again.');
    }
  };

  // Reusable tab button component
  const TabButton = ({ tab, icon: Icon, label, onClick }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
          isActive
            ? 'bg-green-600 text-white shadow-sm'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </button>
    );
  };

  // Reusable stats card component
  const StatsCard = ({ icon, label, value, loading: cardLoading, iconBgColor = 'bg-blue-100', iconTextColor = 'text-blue-600' }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <span className={`${iconTextColor} text-sm`}>{icon}</span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-xs font-medium text-gray-600">{label}</p>
          {cardLoading ? (
            <div className="animate-pulse bg-gray-200 h-5 w-10 rounded mt-1"></div>
          ) : (
            <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Reusable scrollable table wrapper
  const ScrollableTable = ({ children }) => (
    <div className="overflow-x-auto">
      <div className="max-h-96 overflow-y-auto" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db #f3f4f6'
      }}>
        {children}
      </div>
    </div>
  );

  // Reusable status badge component
  const StatusBadge = ({ status, type = 'inquiry' }) => (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(status, type)}`}>
      {formatStatusText(status)}
    </span>
  );

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  }, [setSearchParams]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-600">Loading user data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">Back Office Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Manage inquiries, quotations, and orders</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <svg className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard icon="📄" label="Total Inquiries" value={dashboardStats.inquiries} loading={statsLoading} iconBgColor="bg-blue-100" iconTextColor="text-blue-600" />
        <StatsCard icon="🏷️" label="Quotations" value={dashboardStats.quotations} loading={statsLoading} iconBgColor="bg-yellow-100" iconTextColor="text-yellow-600" />
        <StatsCard icon="📦" label="Active Orders" value={dashboardStats.orders} loading={statsLoading} iconBgColor="bg-green-100" iconTextColor="text-green-600" />
        <StatsCard icon="✅" label="Completed" value={dashboardStats.completed} loading={statsLoading} iconBgColor="bg-purple-100" iconTextColor="text-purple-600" />
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Admin Dashboard Navigation</h2>
        <div className="flex flex-wrap gap-2">
          <TabButton
            tab="inquiries"
            icon={DocumentTextIcon}
            label="Inquiries"
            onClick={() => handleTabChange('inquiries')}
          />
          <TabButton
            tab="quotations"
            icon={TagIcon}
            label="Quotations"
            onClick={() => handleTabChange('quotations')}
          />
          <TabButton
            tab="orders"
            icon={ClipboardDocumentListIcon}
            label="Orders"
            onClick={() => handleTabChange('orders')}
          />
          {(user?.role === 'admin' || user?.role === 'backoffice') && (
            <>
              <TabButton
                tab="material"
                icon={WrenchScrewdriverIcon}
                label="Material & Thickness Data"
                onClick={() => handleTabChange('material')}
              />
              {user?.role === 'admin' && (
                <TabButton
                  tab="subadmins"
                  icon={UsersIcon}
                  label="Sub-Admins"
                  onClick={() => handleTabChange('subadmins')}
                />
              )}
            </>
          )}
        </div>
      </div>

          {activeTab === 'inquiries' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Pending Inquiries</h3>
                  <p className="text-sm text-gray-600 mt-1">Review and create quotations for customer inquiries</p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="inquiry-status-filter" className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="inquiry-status-filter"
                    value={inquiryStatusFilter}
                    onChange={(e) => setInquiryStatusFilter(e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {inquiryStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ScrollableTable>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        INQUIRY
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CUSTOMER
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        TECHNICAL SPECIFICATIONS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DATE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium tabular-nums tracking-tight text-gray-900">{inquiry.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inquiry.customer}</div>
                          <div className="text-sm text-gray-500">{inquiry.company}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {inquiry.parts && inquiry.parts.length > 0 ? (
                              <div className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                                <div className="font-medium">{inquiry.parts[0].material}</div>
                                <div className="text-gray-500">{inquiry.parts[0].thickness} • Qty: {inquiry.parts[0].quantity}</div>
                                {inquiry.parts[0].remarks && (
                                  <div className="text-gray-400 truncate">{inquiry.parts[0].remarks}</div>
                                )}
                                {inquiry.parts.length > 1 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    +{inquiry.parts.length - 1} more parts
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">No specifications</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={inquiry.status} type="inquiry" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {inquiry.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/inquiry/${inquiry._id}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </Link>
                            {inquiry.status === 'pending' && (
                              <button
                                onClick={() => handleCreateQuotation(inquiry)}
                                className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Quote
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredInquiries.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No inquiries found for selected status
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollableTable>
            </div>
          )}

          {activeTab === 'quotations' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quotations</h3>
                <p className="text-sm text-gray-600 mt-1">Manage customer quotations and pricing</p>
              </div>
              <ScrollableTable>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inquiry ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotations.map((quotation) => (
                      <tr key={quotation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {quotation.inquiryId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="text-sm font-medium text-gray-900">{quotation.customer}</div>
                          <div className="text-sm text-gray-500">{quotation.company}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{quotation.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={quotation.status} type="quotation" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quotation.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/quotation/${quotation._id}`}
                              className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md text-sm font-medium"
                            >
                              View
                            </Link>
                            {quotation.status === 'draft' && (
                              <button 
                                onClick={() => handleSendQuotation(quotation._id)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md text-sm font-medium"
                              >
                                Send
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadPDF(quotation)}
                              className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1"
                              title="Download PDF"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {quotations.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No quotations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollableTable>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Orders</h3>
                <p className="text-sm text-gray-600 mt-1">Manage production orders and tracking</p>
              </div>
              <ScrollableTable>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.items}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} type="order" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/order/${order._id}`}
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md text-sm font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollableTable>
            </div>
          )}

          {activeTab === 'material' && (
            <BackOfficeMaterialManagement />
          )}

      {activeTab === 'subadmins' && (
        <SubAdminManagement />
      )}

      {showQuotationForm && selectedInquiry && (
        <QuotationForm
          inquiry={selectedInquiry}
          onClose={handleCloseQuotationForm}
          onSuccess={handleQuotationSuccess}
        />
      )}
    </div>
  );
};

export default BackOfficeDashboard;
