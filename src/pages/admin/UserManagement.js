import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, axios } from '../../services/api';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { parseContentDisposition } from '../../utils/downloadFilename';
import { roleUtils } from '../../utils/authUtils';

const ROLE_LABELS = {
  customer: 'Customer',
  admin: 'Admin',
  backoffice: 'Back Office',
  subadmin: 'Sub-Admin'
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatAddress = (address) => {
  if (!address || typeof address !== 'object') return '—';
  const parts = [address.street, address.city, address.state, address.zipCode, address.country]
    .filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

const getUserGstin = (user) => {
  if (!user) return '—';
  const gstin = (user.gstNumber || user.gst || '').trim();
  return gstin || '—';
};

const normalizeUserRecord = (user) => {
  if (!user) return user;
  return {
    ...user,
    gstNumber: user.gstNumber || user.gst || ''
  };
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [exporting, setExporting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        role: 'customer',
        page: 1,
        limit: 100
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter === 'active') params.status = 'active';
      if (statusFilter === 'inactive') params.status = 'inactive';

      const response = await userAPI.getUsers(params);
      if (response.data.success) {
        const fetchedUsers = (response.data.users || []).map(normalizeUserRecord);
        const customerOnlyUsers = fetchedUsers.filter((u) => u.role === 'customer');
        setUsers(customerOnlyUsers);
        setPagination(response.data.pagination || { page: 1, total: 0, pages: 1 });
      }
    } catch (error) {
      if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const closeDetails = () => {
    setSelectedUser(null);
    setDetailLoading(false);
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = { role: 'customer' };
      if (search.trim()) params.search = search.trim();
      if (statusFilter === 'active') params.status = 'active';
      if (statusFilter === 'inactive') params.status = 'inactive';

      const response = await userAPI.exportCustomersExcel(params);
      const filename =
        parseContentDisposition(response.headers['content-disposition']) ||
        `customers_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Customers exported to Excel');
    } catch (error) {
      if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
        return;
      }
      toast.error(error.response?.data?.message || 'Failed to export customers');
    } finally {
      setExporting(false);
    }
  };

  const handleViewUser = async (userId) => {
    const cached = users.find((u) => u._id === userId);
    try {
      setSelectedUser(cached ? normalizeUserRecord(cached) : null);
      setDetailLoading(true);
      const response = await userAPI.getUser(userId);
      if (response.data.success) {
        setSelectedUser(normalizeUserRecord(response.data.user));
      }
    } catch (error) {
      if (!axios.isCancel(error) && error?.code !== 'ERR_CANCELED') {
        toast.error(error.response?.data?.message || 'Failed to load user details');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  if (!currentUser || (!roleUtils.isAdmin(currentUser) && !roleUtils.isBackOffice(currentUser))) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <p className="text-gray-600">You do not have permission to access lead management.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Lead Management</h1>
        <p className="mt-1 text-sm text-gray-600">View registered customer accounts</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name, email, company, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={loading || exporting}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
              <button
                type="button"
                onClick={fetchCustomers}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.companyName || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.phoneNumber || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              u.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleViewUser(u._id)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                          No customers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && pagination.total > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
                Showing {users.length} of {pagination.total} customers
              </div>
            )}
          </div>

      <CustomerDetailsModal
        isOpen={Boolean(selectedUser || detailLoading)}
        loading={detailLoading}
        user={selectedUser}
        onClose={closeDetails}
      />
    </div>
  );
};

const CustomerDetailsModal = ({ isOpen, loading, user, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-details-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative flex w-full max-w-2xl max-h-[min(90vh,calc(100dvh-2rem))] flex-col rounded-xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <h3 id="customer-details-title" className="text-lg font-semibold text-gray-900">
              Customer Details
            </h3>
            {user && !loading && (
              <p className="mt-0.5 truncate text-sm text-gray-500">{user.email}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {user && !loading && (
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              aria-label="Close"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : user ? (
            <dl className="divide-y divide-gray-100">
              <DetailRow label="Name" value={`${user.firstName} ${user.lastName}`} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Phone" value={user.phoneNumber || '—'} />
              <DetailRow label="Company" value={user.companyName || '—'} />
              <DetailRow label="GSTIN Number" value={getUserGstin(user)} />
              <DetailRow label="Department" value={user.department || '—'} />
              <DetailRow label="Country" value={user.country || '—'} />
              <DetailRow label="Address" value={formatAddress(user.address)} />
              <DetailRow label="Role" value={ROLE_LABELS[user.role] || user.role} />
              <DetailRow label="Registered" value={formatDate(user.createdAt)} />
              <DetailRow label="Last login" value={formatDate(user.lastLogin)} />
            </dl>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-1 gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[130px_1fr] sm:gap-4">
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pt-0.5">{label}</dt>
    <dd className="text-sm text-gray-900 break-words">{value}</dd>
  </div>
);

export default UserManagement;
