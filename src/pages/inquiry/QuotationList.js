import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quotationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { quotationViewPath } from '../../utils/quotationRoutes';
import { isQuotationVisibleToCustomer } from '../../utils/quotationVisibility';

const getQuotationId = (quotation) => {
  const id = quotation?._id || quotation?.id;
  if (!id || id === 'undefined' || id === 'null') {
    return null;
  }
  return id;
};

const statusBadgeClass = (status) => {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'order_created':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatStatus = (status) => {
  if (!status) return 'Pending';
  if (status === 'order_created') return 'Payment Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const QuotationList = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await quotationAPI.getQuotations();
      if (response.data.success) {
        setQuotations(response.data.quotations || []);
      } else {
        setQuotations([]);
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return;
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching quotations:', error);
      }
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view quotations.');
      } else if (error.response?.status !== 401) {
        toast.error('Failed to load quotations. Please try again.');
      }
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const statusOptions = useMemo(() => {
    const set = new Set(['all']);
    quotations.forEach((q) => {
      if (q.status) set.add(String(q.status).toLowerCase());
    });
    return Array.from(set);
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      if (!isQuotationVisibleToCustomer(q.status)) return false;
      const num = (q.quotationNumber || '').toString().toLowerCase();
      const inquiry =
        (q.inquiry?.inquiryNumber || q.inquiryId || '').toString().toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        num.includes(searchTerm.toLowerCase()) ||
        inquiry.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (q.status && String(q.status).toLowerCase() === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchTerm, statusFilter]);

  const sortedQuotations = useMemo(() => {
    const list = [...filteredQuotations];
    list.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortBy === 'newest' ? tb - ta : ta - tb;
    });
    return list;
  }, [filteredQuotations, sortBy]);

  const isQuotationPaid = (quotation) =>
    quotation?.orderPaymentWorkflowStatus === 'Paid' &&
    quotation?.payment_status === 'Success';

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
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <nav className="mb-2 text-sm text-gray-500">
                <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
                  Dashboard
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-700">Quotations</span>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Quotations</h1>
              <p className="mt-2 text-gray-600">
                View all quotations, check status, and open details or payment when available.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
              <div className="min-w-0 flex-1">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by quotation or inquiry number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full min-w-0 rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm sm:w-44"
                >
                  <option value="all">All statuses</option>
                  {statusOptions
                    .filter((s) => s !== 'all')
                    .map((s) => (
                      <option key={s} value={s}>
                        {formatStatus(s)}
                      </option>
                    ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm sm:w-44"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-lg bg-white shadow">
            {filteredQuotations.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <div className="mb-3 text-4xl">🏷️</div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  {quotations.length === 0 ? 'No quotations yet' : 'No matching quotations'}
                </h3>
                <p className="mb-4 text-gray-600">
                  {quotations.length === 0
                    ? 'Your quotations will appear here once our team prepares them.'
                    : 'Try adjusting your search or status filter.'}
                </p>
                {quotations.length === 0 && (
                  <Link
                    to="/inquiry/new"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Submit an inquiry
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="max-h-[32rem] min-w-0 space-y-3 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:hidden">
                  {sortedQuotations.map((quotation, index) => {
                    const qid = getQuotationId(quotation);
                    const rowKey =
                      quotation._id ||
                      quotation.id ||
                      `quotation-${quotation.quotationNumber || index}`;
                    const dateStr = quotation.createdAt
                      ? new Date(quotation.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—';
                    return (
                      <div
                        key={rowKey}
                        className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div
                            className="min-w-0 max-w-full truncate font-semibold tabular-nums text-gray-900"
                            title={String(quotation.quotationNumber || qid || '—')}
                          >
                            #{quotation.quotationNumber || qid || '—'}
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(
                              isQuotationPaid(quotation) ? 'order_created' : quotation.status
                            )}`}
                          >
                            {isQuotationPaid(quotation) ? 'Paid' : formatStatus(quotation.status)}
                          </span>
                        </div>
                        <div className="mt-2 min-w-0 text-sm text-gray-600">
                          <span>Inquiry: </span>
                          <span
                            className="inline-block min-w-0 max-w-full truncate font-medium tabular-nums text-gray-800"
                            title={String(quotation.inquiry?.inquiryNumber || quotation.inquiryId || '—')}
                          >
                            {quotation.inquiry?.inquiryNumber || quotation.inquiryId || '—'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{dateStr}</p>
                        <p className="mt-3 text-lg font-bold text-gray-900">
                          {quotation.totalAmount != null
                            ? `₹${Number(quotation.totalAmount).toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              })}`
                            : '—'}
                        </p>
                        <div className="mt-4 flex flex-col gap-2">
                          {qid && (
                            <Link
                              to={quotationViewPath(quotation) || '#'}
                              className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </Link>
                          )}
                          {quotation.status === 'sent' && qid && (
                            <button
                              type="button"
                              onClick={() => navigate(`/quotation/${qid}/payment`)}
                              className="inline-flex w-full items-center justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
                            >
                              Pay
                            </button>
                          )}
                          {quotation.status === 'order_created' && (
                            <Link
                              to="/orders"
                              className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                            >
                              Orders
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden min-w-0 md:block">
                  <div className="overflow-x-auto">
                    <div
                      className="max-h-[32rem] overflow-y-auto"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d1d5db #f3f4f6',
                      }}
                    >
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:px-6">
                              Quotation
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:px-6">
                              Inquiry
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:px-6">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:px-6">
                              Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 lg:px-6">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 lg:px-6">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {sortedQuotations.map((quotation, index) => {
                            const qid = getQuotationId(quotation);
                            const rowKey =
                              quotation._id ||
                              quotation.id ||
                              `quotation-${quotation.quotationNumber || index}`;
                            return (
                              <tr key={rowKey} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-4 py-4 lg:px-6">
                                  <div className="text-sm font-semibold text-gray-900">
                                    #{quotation.quotationNumber || qid || '—'}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 lg:px-6">
                                  {quotation.inquiry?.inquiryNumber ||
                                    quotation.inquiryId ||
                                    '—'}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 lg:px-6">
                                  {quotation.createdAt
                                    ? new Date(quotation.createdAt).toLocaleDateString()
                                    : '—'}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 lg:px-6">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass(
                                      isQuotationPaid(quotation) ? 'order_created' : quotation.status
                                    )}`}
                                  >
                                    {isQuotationPaid(quotation) ? 'Paid' : formatStatus(quotation.status)}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-semibold text-gray-900 lg:px-6">
                                  {quotation.totalAmount != null
                                    ? `₹${Number(quotation.totalAmount).toLocaleString(undefined, {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 2,
                                      })}`
                                    : '—'}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-right text-sm lg:px-6">
                                  <div className="flex flex-wrap justify-end gap-2">
                                    {qid && (
                                      <Link
                                        to={quotationViewPath(quotation) || '#'}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                                      >
                                        View
                                      </Link>
                                    )}
                                    {quotation.status === 'sent' && qid && (
                                      <button
                                        type="button"
                                        onClick={() => navigate(`/quotation/${qid}/payment`)}
                                        className="inline-flex items-center rounded-md bg-orange-600 px-3 py-1.5 text-white hover:bg-orange-700"
                                      >
                                        Pay
                                      </button>
                                    )}
                                    {quotation.status === 'order_created' && (
                                      <Link
                                        to="/orders"
                                        className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
                                      >
                                        Orders
                                      </Link>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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

export default QuotationList;
