import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUser,
  FaUserShield,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

const getPasswordRequirements = (password) => [
  { text: 'At least 8 characters', met: password.length >= 8 },
  { text: 'One lowercase letter', met: /[a-z]/.test(password) },
  { text: 'One uppercase letter', met: /[A-Z]/.test(password) },
  { text: 'One digit', met: /\d/.test(password) },
  { text: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(password) }
];

const isPasswordValid = (password) =>
  password.length >= 8 && PASSWORD_REGEX.test(password);

const formatApiErrors = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.errors?.length) {
    const messages = [...new Set(
      data.errors.map((e) => {
        if (e.path === 'password') {
          return 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&)';
        }
        if (e.path === 'email') return 'Please enter a valid email address';
        if (e.path === 'firstName' || e.path === 'lastName') return `${e.path} is required`;
        return e.msg || `${e.path}: invalid`;
      })
    )];
    return messages.join(' ');
  }
  return data?.message || fallback;
};

const PERMISSION_ITEMS = [
  { key: 'canCreateQuotations', label: 'Create Quotations' },
  { key: 'canManageUsers', label: 'Manage Users' },
  { key: 'canViewAllInquiries', label: 'View All Inquiries' },
  { key: 'canManageOrders', label: 'Manage Orders' }
];

const PermissionTags = ({ permissions }) => {
  const active = PERMISSION_ITEMS.filter((item) => permissions?.[item.key]);
  if (active.length === 0) {
    return <span className="text-xs text-gray-400">No permissions assigned</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
        >
          {item.label}
        </span>
      ))}
    </div>
  );
};

const ModalActions = ({ onCancel, cancelLabel = 'Cancel', submitLabel, submitLoading, submitLoadingLabel, submitDisabled, submitVariant = 'primary', formId }) => (
  <div className="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
    <button
      type="button"
      onClick={onCancel}
      disabled={submitLoading}
      className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto sm:py-2"
    >
      {cancelLabel}
    </button>
    <button
      type="submit"
      form={formId}
      disabled={submitDisabled || submitLoading}
      className={`w-full rounded-md px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2 ${
        submitVariant === 'danger'
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      {submitLoading ? submitLoadingLabel : submitLabel}
    </button>
  </div>
);

const SubAdminManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    permissions: {
      canCreateQuotations: false,
      canManageUsers: false,
      canViewAllInquiries: false,
      canManageOrders: false
    }
  });

  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery(
    'admin-users',
    async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.users || [];
    }
  );

  // Create sub-admin mutation
  const createSubAdminMutation = useMutation(
    async (userData) => {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/admin/subadmin', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('Sub-admin created successfully');
        setShowCreateModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(formatApiErrors(error, 'Failed to create sub-admin'));
      }
    }
  );

  // Update permissions mutation
  const updatePermissionsMutation = useMutation(
    async ({ userId, permissions }) => {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/admin/subadmin/${userId}/permissions`, 
        { permissions }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('Permissions updated successfully');
        setShowEditModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update permissions');
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    async (userId) => {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/admin/subadmin/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        setUserToDelete(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  );

  const resetForm = () => {
    setShowPassword(false);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      permissions: {
        canCreateQuotations: false,
        canManageUsers: false,
        canViewAllInquiries: false,
        canManageOrders: false
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permissionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCreateSubAdmin = (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isPasswordValid(formData.password)) {
      toast.error('Password does not meet the requirements below');
      return;
    }

    createSubAdminMutation.mutate(formData);
  };

  const passwordRequirements = getPasswordRequirements(formData.password);
  const passwordValid = isPasswordValid(formData.password);

  const handleEditPermissions = (user) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      permissions: user.permissions || {
        canCreateQuotations: false,
        canManageUsers: false,
        canViewAllInquiries: false,
        canManageOrders: false
      }
    }));
    setShowEditModal(true);
  };

  const handleUpdatePermissions = (e) => {
    e.preventDefault();
    updatePermissionsMutation.mutate({
      userId: selectedUser._id,
      permissions: formData.permissions
    });
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleteUserMutation.isLoading) return;
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete._id);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="text-red-500" />;
      case 'subadmin':
        return <FaUser className="text-blue-500" />;
      case 'backoffice':
        return <FaUser className="text-green-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheck className="w-3 h-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaTimes className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  const subAdmins = users.filter(user => user.role === 'subadmin');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Sub-Admin Management</h2>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Manage sub-admin users and their permissions
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex w-full shrink-0 items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:py-2"
        >
          <FaPlus className="mr-2 h-4 w-4 shrink-0" />
          Create Sub-Admin
        </button>
      </div>

      {/* Users list */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-3 py-3 sm:px-6 sm:py-4">
          <h3 className="text-base font-medium text-gray-900 sm:text-lg">Sub-Admin Users</h3>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            {subAdmins.length} {subAdmins.length === 1 ? 'user' : 'users'}
          </p>
        </div>

        {subAdmins.length === 0 ? (
          <div className="px-4 py-10 text-center sm:px-6">
            <p className="text-sm text-gray-500">No sub-admins yet.</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Create your first sub-admin
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: card layout */}
            <div className="divide-y divide-gray-200 md:hidden">
              {subAdmins.map((user) => (
                <div key={user._id} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          Sub-Admin
                        </span>
                        {getStatusBadge(user.isActive)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      Permissions
                    </p>
                    <PermissionTags permissions={user.permissions} />
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-500">
                      Created {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditPermissions(user)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        aria-label={`Edit permissions for ${user.firstName} ${user.lastName}`}
                      >
                        <FaEdit className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(user)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                        aria-label={`Delete ${user.firstName} ${user.lastName}`}
                      >
                        <FaTrash className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subAdmins.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Sub-Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <PermissionTags permissions={user.permissions} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditPermissions(user)}
                          className="text-blue-600 hover:text-blue-900"
                          aria-label={`Edit permissions for ${user.firstName} ${user.lastName}`}
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600 hover:text-red-900"
                          aria-label={`Delete ${user.firstName} ${user.lastName}`}
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>

      {/* Create Sub-Admin Modal */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 sm:items-start sm:p-4 sm:pt-6">
          <div className="flex max-h-[min(100dvh,100vh)] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl sm:mt-4 sm:rounded-lg sm:max-h-[calc(100dvh-2rem)]">
              {/* Header */}
              <div className="shrink-0 border-b border-gray-200 px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Create Sub-Admin</h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      Fill in the details to create a new sub-admin user
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form
                id="create-subadmin-form"
                onSubmit={handleCreateSubAdmin}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
                <div className="space-y-6">
                  {/* Personal Information Section */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              formData.password && !passwordValid
                                ? 'border-red-300'
                                : 'border-gray-300'
                            }`}
                            placeholder="e.g. Admin@123"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <FaEye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {passwordRequirements.map((req) => (
                            <li
                              key={req.text}
                              className={`text-xs flex items-center gap-1.5 ${
                                req.met ? 'text-green-600' : 'text-gray-500'
                              }`}
                            >
                              {req.met ? (
                                <FaCheck className="w-3 h-3 shrink-0" />
                              ) : (
                                <FaTimes className="w-3 h-3 shrink-0 text-gray-400" />
                              )}
                              {req.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Section */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Permissions</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-4">Select the permissions you want to grant to this sub-admin:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="permissions.canCreateQuotations"
                            checked={formData.permissions.canCreateQuotations}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Create Quotations</div>
                            <div className="text-xs text-gray-500">Allow creating and managing quotations</div>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="permissions.canManageUsers"
                            checked={formData.permissions.canManageUsers}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Manage Users</div>
                            <div className="text-xs text-gray-500">Allow managing other users</div>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="permissions.canViewAllInquiries"
                            checked={formData.permissions.canViewAllInquiries}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">View All Inquiries</div>
                            <div className="text-xs text-gray-500">Allow viewing all inquiries</div>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            name="permissions.canManageOrders"
                            checked={formData.permissions.canManageOrders}
                            onChange={handleInputChange}
                            className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Manage Orders</div>
                            <div className="text-xs text-gray-500">Allow managing orders</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
                  <ModalActions
                    formId="create-subadmin-form"
                    onCancel={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    submitLabel="Create Sub-Admin"
                    submitLoading={createSubAdminMutation.isLoading}
                    submitLoadingLabel="Creating..."
                    submitDisabled={!passwordValid}
                  />
                </div>
              </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onClick={closeDeleteModal}
          />
          <div
            className="relative w-full max-w-md rounded-t-2xl bg-white shadow-xl sm:rounded-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-subadmin-title"
          >
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
              <h3 id="delete-subadmin-title" className="text-lg font-semibold text-gray-900">
                Delete Sub-Admin
              </h3>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete{' '}
                <span className="font-medium text-gray-900 break-words">
                  {userToDelete.firstName} {userToDelete.lastName}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteUserMutation.isLoading}
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:w-auto sm:py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  disabled={deleteUserMutation.isLoading}
                  className="w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
                >
                  {deleteUserMutation.isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Permissions Modal */}
      {showEditModal && selectedUser && createPortal(
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 sm:items-start sm:p-4 sm:pt-6">
          <div className="flex max-h-[min(100dvh,100vh)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-xl sm:mt-8 sm:rounded-lg sm:max-h-[calc(100dvh-3rem)]">
              {/* Header */}
              <div className="shrink-0 border-b border-gray-200 px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      Edit Permissions
                    </h3>
                    <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
                      Update permissions for {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form
                id="edit-permissions-form"
                onSubmit={handleUpdatePermissions}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">User Permissions</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-4">Select the permissions you want to grant to this sub-admin:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions.canCreateQuotations"
                          checked={formData.permissions.canCreateQuotations}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Create Quotations</div>
                          <div className="text-xs text-gray-500">Allow creating and managing quotations</div>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions.canManageUsers"
                          checked={formData.permissions.canManageUsers}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Manage Users</div>
                          <div className="text-xs text-gray-500">Allow managing other users</div>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions.canViewAllInquiries"
                          checked={formData.permissions.canViewAllInquiries}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">View All Inquiries</div>
                          <div className="text-xs text-gray-500">Allow viewing all inquiries</div>
                        </div>
                      </label>
                      <label className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          name="permissions.canManageOrders"
                          checked={formData.permissions.canManageOrders}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Manage Orders</div>
                          <div className="text-xs text-gray-500">Allow managing orders</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                </div>

                <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
                  <ModalActions
                    formId="edit-permissions-form"
                    onCancel={() => setShowEditModal(false)}
                    submitLabel="Update Permissions"
                    submitLoading={updatePermissionsMutation.isLoading}
                    submitLoadingLabel="Updating..."
                  />
                </div>
              </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SubAdminManagement;
