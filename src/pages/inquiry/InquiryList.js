import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inquiryAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const InquiryList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Helper function to get valid quotation ID
  const getQuotationId = (quotation) => {
    const id = quotation?._id || quotation?.id;
    if (!id || id === 'undefined' || id === 'null') {
      return null;
    }
    return id;
  };

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch inquiries when filters change (but not for search term)
  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortBy]);

  const fetchInquiries = async (skipZohoSync = false) => {
    try {
      setLoading(true);
      
      // Use different API based on user role
      let response;
      if (user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') {
        // Admin users get all inquiries
        response = await inquiryAPI.getAllInquiries();
      } else {
        // Customer users get their own inquiries
        response = await inquiryAPI.getInquiries({
          status: statusFilter,
          search: searchTerm,
          sortBy: sortBy === 'newest' ? 'createdAt' : 'inquiryNumber',
          sortOrder: sortBy === 'newest' ? 'desc' : 'asc'
        });
      }
      
      if (response.data.success) {
        // Force-sync Zoho status for pending payment rows before rendering (customer view only)
        if (!skipZohoSync && user?.role === 'customer') {
          const pendingQuotationIds = (response.data.inquiries || [])
            .map((inq) => inq.quotation)
            .filter(
              (q) =>
                q?._id &&
                q?.zohoPaymentLinkId &&
                (
                  q.orderPaymentWorkflowStatus === 'Payment Pending' ||
                  (q.orderPaymentWorkflowStatus === 'Paid' && q.payment_status === 'Success')
                )
            )
            .map((q) => q._id);

          if (pendingQuotationIds.length > 0) {
            await Promise.allSettled(
              pendingQuotationIds.map((qid) => paymentAPI.syncZohoPaymentStatus(qid))
            );
            // Re-fetch once after sync attempts to render latest status.
            await fetchInquiries(true);
            return;
          }
        }

        // Transform the data to match the component's expected format
        const transformedInquiries = response.data.inquiries.map(inquiry => {
          const date = new Date(inquiry.createdAt);
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          // Debug customer data
          if (process.env.NODE_ENV === 'development') {
            console.log('Inquiry customer data:', {
              inquiryNumber: inquiry.inquiryNumber,
              customer: inquiry.customer,
              hasCustomer: !!inquiry.customer,
              customerType: typeof inquiry.customer,
              userRole: user?.role
            });
          }
          
          // Extract customer information with better fallback
          // For customer users, use their own profile data since backend doesn't populate customer
          // For admin/backoffice users, use the populated customer data from inquiry
          let companyName = 'N/A';
          let contactName = 'N/A';
          
          if (user?.role === 'customer') {
            // Use logged-in user's data for customer inquiries
            companyName = user.companyName || user.company || 'N/A';
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            contactName = `${firstName} ${lastName}`.trim() || 'N/A';
          } else {
            // For admin/backoffice, use customer data from inquiry (should be populated)
            const customer = inquiry.customer || {};
            companyName = customer.companyName || customer.company || 'N/A';
            const firstName = customer.firstName || '';
            const lastName = customer.lastName || '';
            contactName = `${firstName} ${lastName}`.trim() || 'N/A';
          }
          
          return {
            id: inquiry.inquiryNumber,
            shortId: inquiry.inquiryNumber.replace('INQ', '').slice(-4),
            status: inquiry.status,
            company: companyName,
            contact: contactName,
            files: inquiry.files?.length || 0,
            parts: inquiry.parts?.length || 0,
            createdAt: `${dateStr} at ${timeStr}`,
            views: 0,
            _id: inquiry._id, // Keep the MongoDB ID for API calls
            // Add quotation information
            quotation: inquiry.quotation ? {
              id: inquiry.quotation._id,
              quotationNumber: inquiry.quotation.quotationNumber,
              status: inquiry.quotation.status,
              totalAmount: inquiry.quotation.totalAmount,
              validUntil: inquiry.quotation.validUntil,
              orderPaymentWorkflowStatus: inquiry.quotation.orderPaymentWorkflowStatus,
              payment_status: inquiry.quotation.payment_status
            } : null
          };
        });
        
        setInquiries(transformedInquiries);
      } else {
        toast.error(response.data.message || 'Failed to fetch inquiries');
      }
    } catch (error) {
      // Don't log cancellation errors
      if (error.name !== 'CanceledError' && process.env.NODE_ENV === 'development') {
        console.error('Error fetching inquiries:', error);
      }
      if (error.name !== 'CanceledError') {
        toast.error('Failed to fetch inquiries');
      }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-7xl py-6">
        <div className="flex h-64 items-center justify-center px-0">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  const filteredInquiries = inquiries
    .filter(inquiry => {
      const matchesSearch = inquiry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inquiry.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inquiry.contact.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen w-full min-w-0">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <div className="w-full min-w-0 px-0">
          {/* Header */}
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <div className="sm:flex-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Inquiries
              </h1>
              <p className="text-gray-600">Manage and track your sheet metal part inquiries</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              {/* Only show New Inquiry button for customers */}
              {user?.role === 'customer' && (
                <Link
                  to="/inquiry/new"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Inquiry
                </Link>
              )}
            </div>
          </div>

          {/* Optimized Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Enhanced Search Bar */}
              <div className="w-full lg:w-96">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search inquiries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              {/* Enhanced Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white block w-full sm:w-44 px-3 py-2.5 pr-8 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer"
                    style={{ 
                      WebkitAppearance: 'none', 
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="quoted">Quoted</option>
                    <option value="approved">Approved</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white block w-full sm:w-44 px-3 py-2.5 pr-8 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer"
                    style={{ 
                      WebkitAppearance: 'none', 
                      MozAppearance: 'none',
                      appearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="status">By Status</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Inquiry List */}
          <div 
            className="inquiries-list-scroll-container min-w-0 space-y-4 overflow-y-auto overflow-x-hidden"
            style={{ 
              maxHeight: '650px',
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none' /* IE and Edge */
            }}
          >
            <style>{`
              .inquiries-list-scroll-container::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
              }
              .inquiries-list-scroll-container {
                -ms-overflow-style: none; /* IE and Edge */
                scrollbar-width: none; /* Firefox */
              }
            `}</style>
            {filteredInquiries.map((inquiry) => (
              <div 
                key={inquiry.id} 
                onClick={() => navigate(`/inquiry/${inquiry._id}`)}
                className="group block w-full min-w-0 max-w-full cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:border-blue-300 hover:shadow-md sm:p-5"
              >
                <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="min-w-0 max-w-full truncate text-base font-bold tabular-nums tracking-tight text-gray-900 group-hover:text-blue-600 sm:text-lg"
                        title={inquiry.id}
                      >
                        {inquiry.id}
                      </h3>
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        inquiry.status === 'quoted' 
                          ? 'bg-green-100 text-green-800' 
                          : inquiry.status === 'payment_received'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inquiry.status === 'approved' || inquiry.status === 'accepted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inquiry.status === 'quoted' ? (
                          <svg className="mr-1.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="mr-1.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        )}
                        {inquiry.status === 'payment_received'
                          ? 'Payment received'
                          : inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </div>

                    <p className="break-words text-sm font-medium text-gray-600">
                      <span className="text-gray-800">{inquiry.company}</span>
                      <span className="text-gray-400"> · </span>
                      <span className="text-gray-600">{inquiry.contact}</span>
                    </p>

                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="inline-flex items-center rounded-lg bg-gray-50 px-3 py-1 font-medium text-gray-700">
                        <svg className="mr-1.5 h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {inquiry.files} files
                      </span>
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                        <svg className="mr-1.5 h-4 w-4 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        {inquiry.parts} parts
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 w-full shrink-0 space-y-3 border-t border-gray-100 pt-4 text-left lg:w-auto lg:max-w-sm lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 lg:text-right">
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 lg:inline-block">
                      <span className="text-gray-600">Created </span>
                      <span className="mt-0.5 block text-gray-700 lg:mt-0 lg:inline">{inquiry.createdAt}</span>
                    </div>

                    {inquiry.quotation ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          {(() => {
                            const isActuallyPaid =
                              inquiry.quotation.orderPaymentWorkflowStatus === 'Paid' &&
                              inquiry.quotation.payment_status === 'Success';
                            return (
                          <span className={`inline-flex rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm ${
                            inquiry.quotation.status === 'sent' ? 'border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800' :
                            isActuallyPaid ? 'border-emerald-200 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900' :
                            inquiry.quotation.status === 'accepted' ? 'border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                            inquiry.quotation.status === 'rejected' ? 'border-red-200 bg-gradient-to-r from-red-100 to-rose-100 text-red-800' :
                            'border-gray-200 bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.quotation.status === 'sent' ? 'Quotation Ready' :
                             isActuallyPaid ? 'Paid' :
                             inquiry.quotation.status === 'order_created' ? 'Payment Pending' :
                             inquiry.quotation.status === 'accepted' ? 'Accepted' :
                             inquiry.quotation.status === 'rejected' ? 'Rejected' :
                             inquiry.quotation.status}
                          </span>
                            );
                          })()}
                          <span className="text-base font-bold text-gray-900">
                            ₹{(inquiry.quotation.totalAmount || 0).toFixed(2)}
                          </span>
                        </div>

                        {inquiry.quotation.status === 'accepted' && (() => {
                          const quotationId = getQuotationId(inquiry.quotation);
                          if (!quotationId) return null;
                          return (
                            <div className="flex flex-col gap-2">
                              <Link
                                to={`/quotation/${quotationId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 lg:inline-flex lg:w-auto lg:py-1.5"
                              >
                                View Details
                              </Link>
                            </div>
                          );
                        })()}

                        {inquiry.quotation.status === 'order_created' && (() => {
                          const quotationId = getQuotationId(inquiry.quotation);
                          if (!quotationId) return null;
                          return (
                            <div className="flex flex-col gap-2">
                              <Link
                                to="/orders"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 lg:inline-flex lg:w-auto lg:py-1.5"
                              >
                                View orders
                              </Link>
                              <Link
                                to={`/quotation/${quotationId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 lg:inline-flex lg:w-auto lg:py-1.5"
                              >
                                View Details
                              </Link>
                            </div>
                          );
                        })()}

                        {inquiry.quotation.status === 'rejected' && (
                          <div className="text-sm font-medium text-gray-500 lg:text-right">
                            Quotation rejected
                          </div>
                        )}
                      </div>
                    ) : null}

                    <div className="flex w-fit items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 text-gray-400 lg:ml-auto">
                      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-xs font-medium">{inquiry.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInquiries.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="max-w-md mx-auto">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No inquiries found</h3>
                {/* Only show inquiry creation button for customers, not for admin/backoffice users */}
                {user?.role === 'customer' && (
                  <Link
                    to="/inquiry/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 mt-3"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create your first inquiry
                  </Link>
                )}
                {/* Show different message for admin users */}
                {user?.role !== 'customer' && (
                  <p className="text-gray-500 text-sm mt-2">
                    No inquiries found. Inquiries will appear here once customers submit them.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryList;
