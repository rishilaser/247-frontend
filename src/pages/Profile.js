import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, inquiryAPI, adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { inquiryQuotationPdfPath } from '../utils/quotationRoutes';
import SubAdminManagement from '../components/SubAdminManagement';
import { roleUtils } from '../utils/authUtils';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const isValidGstin = (gst) => GSTIN_REGEX.test((gst || '').trim().toUpperCase());

const DEPARTMENT_OPTIONS = [
  'Engineering',
  'Procurement',
  'Design',
  'Manufacturing',
  'Quality Control',
  'Other'
];

const COUNTRY_OPTIONS = ['India', 'United States', 'United Kingdom', 'Germany', 'Other'];

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    gstNumber: '',
    department: '',
    country: '',
    deliveryStreet: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZipCode: ''
  });
  const [loading, setLoading] = useState(false);
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    if (!user) return;

    const addr = user.address || {};
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || user.phone || '',
      company: user.companyName || '',
      gstNumber: user.gstNumber || '',
      department: user.department || '',
      country: user.country || addr.country || '',
      deliveryStreet: addr.street || '',
      deliveryCity: addr.city || '',
      deliveryState: addr.state || '',
      deliveryZipCode: addr.zipCode || ''
    });
  }, [user]);

  useEffect(() => {
    if (searchParams.get('tab') === 'subadmins' && roleUtils.isAdmin(user)) {
      setActiveTab('subadmins');
    }
  }, [searchParams, user]);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'subadmins') {
      setSearchParams({ tab: 'subadmins' });
    } else {
      setSearchParams({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'gstNumber' ? value.toUpperCase() : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.gstNumber && !isValidGstin(formData.gstNumber)) {
      toast.error('Please enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5)');
      return;
    }
    if (isCustomer && !formData.gstNumber.trim()) {
      toast.error('GSTIN is required for customer accounts');
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        phoneNumber: formData.phone,
        companyName: formData.company,
        gstNumber: formData.gstNumber.trim().toUpperCase(),
        department: formData.department,
        country: formData.country,
        address: {
          street: formData.deliveryStreet.trim(),
          city: formData.deliveryCity.trim(),
          state: formData.deliveryState.trim(),
          zipCode: formData.deliveryZipCode.trim(),
          country: formData.country
        }
      };

      const result = await updateProfile(updateData);

      if (result.success) {
        toast.success('Profile updated successfully!');
        // Refresh profile data after update
        if (user?.role === 'customer') {
          fetchOrders();
          fetchInquiries();
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  // Real data for orders and inquiries
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // Fetch customer orders
  const fetchOrders = async () => {
    if (!user?._id || user?.role !== 'customer') return;

    try {
      setOrdersLoading(true);
      // Use customer API endpoint (uses authenticated user's ID from token)
      const response = await orderAPI.getCustomerOrders();

      if (response.data.success) {
        const transformedOrders = (response.data.orders || []).map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' '),
          total: order.totalAmount,
          date: new Date(order.createdAt).toISOString().split('T')[0],
          items: order.parts ? order.parts.map(part => part.name || part.description || 'Part') : ['Custom Parts']
        }));
        setOrders(transformedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      // Ignore cancellation errors
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return;
      }
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch customer inquiries
  const fetchInquiries = async () => {
    if (!user?._id || user?.role !== 'customer') return;

    try {
      setInquiriesLoading(true);
      const response = await inquiryAPI.getCustomerInquiries();

      if (response.data.success) {
        const transformedInquiries = response.data.inquiries.map((inquiry) => ({
          id: inquiry._id,
          inquiryNumber: inquiry.inquiryNumber || '',
          rawTitle: inquiry.title?.trim() || null,
          title: inquiry.title || `Inquiry ${inquiry.inquiryNumber}`,
          description: inquiry.description || inquiry.specialInstructions || 'Custom sheet metal parts inquiry',
          status: inquiry.status,
          date: new Date(inquiry.createdAt).toISOString().split('T')[0],
          quoteAmount: inquiry.quotation ? inquiry.quotation.totalAmount : null,
          files: inquiry.files ? inquiry.files.map((file) => file.originalName || file.filename) : [],
        }));
        setInquiries(transformedInquiries);
      } else {
        setInquiries([]);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  };

  // Fetch data when user changes or tab changes
  useEffect(() => {
    if (user?._id && user?.role === 'customer') {
      if (activeTab === 'orders') {
        fetchOrders();
      } else if (activeTab === 'inquiries') {
        fetchInquiries();
      }
    }
  }, [user, activeTab]);

  // Auto-refresh when page becomes visible (user switches back to tab/window)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?._id) {
        if (user?.role === 'customer') {
          if (activeTab === 'orders') {
            fetchOrders();
          } else if (activeTab === 'inquiries') {
            fetchInquiries();
          }
        } else if (user?.role === 'admin') {
          fetchBackOfficeSettings();
        }
      }
    };

    const handleFocus = () => {
      if (user?._id) {
        if (user?.role === 'customer') {
          if (activeTab === 'orders') {
            fetchOrders();
          } else if (activeTab === 'inquiries') {
            fetchInquiries();
          }
        } else if (user?.role === 'admin') {
          fetchBackOfficeSettings();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  // Back Office Settings state (Admin only)
  const [backOfficeEmails, setBackOfficeEmails] = useState(['', '', '', '']);
  const [backOfficeMobileNumbers, setBackOfficeMobileNumbers] = useState(['', '']);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Fetch back office settings for admin
  const fetchBackOfficeSettings = async () => {
    if (user?.role !== 'admin') return;

    try {
      setSettingsLoading(true);
      const response = await adminAPI.getSettings();

      if (response.data.success) {
        const { backOfficeEmails: emails, backOfficeMobileNumbers: numbers } = response.data.settings;
        setBackOfficeEmails(emails && emails.length >= 4 ? emails : [...(emails || []), ...Array(4 - (emails?.length || 0)).fill('')]);
        setBackOfficeMobileNumbers(numbers && numbers.length >= 2 ? numbers : [...(numbers || []), ...Array(2 - (numbers?.length || 0)).fill('')]);
      }
    } catch (error) {
      // Ignore cancellation errors
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return;
      }
      // Only log real errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching settings:', error);
      }
    } finally {
      setSettingsLoading(false);
    }
  };

  // Load settings when user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBackOfficeSettings();
    }
  }, [user]);

  const handleBackOfficeEmailChange = (index, value) => {
    const newEmails = [...backOfficeEmails];
    newEmails[index] = value;
    setBackOfficeEmails(newEmails);
  };

  const handleBackOfficeMobileChange = (index, value) => {
    const newNumbers = [...backOfficeMobileNumbers];
    newNumbers[index] = value;
    setBackOfficeMobileNumbers(newNumbers);
  };

  const addBackOfficeEmail = () => {
    setBackOfficeEmails([...backOfficeEmails, '']);
  };

  const removeBackOfficeEmail = (index) => {
    if (backOfficeEmails.length > 4) {
      setBackOfficeEmails(backOfficeEmails.filter((_, i) => i !== index));
    } else {
      toast.error('Minimum 4 email addresses are required');
    }
  };

  const addBackOfficeMobile = () => {
    setBackOfficeMobileNumbers([...backOfficeMobileNumbers, '']);
  };

  const removeBackOfficeMobile = (index) => {
    if (backOfficeMobileNumbers.length > 2) {
      setBackOfficeMobileNumbers(backOfficeMobileNumbers.filter((_, i) => i !== index));
    } else {
      toast.error('Minimum 2 mobile numbers are required');
    }
  };

  const handleBackOfficeSettingsSave = async (e) => {
    e.preventDefault();

    const validEmails = backOfficeEmails.filter(email => email.trim() !== '');
    const validNumbers = backOfficeMobileNumbers.filter(num => num.trim() !== '');

    if (validEmails.length < 4) {
      toast.error('Please enter at least 4 email addresses');
      return;
    }

    if (validNumbers.length < 2) {
      toast.error('Please enter at least 2 mobile numbers');
      return;
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of validEmails) {
      if (!emailRegex.test(email)) {
        toast.error(`Invalid email: ${email}`);
        return;
      }
    }

    // Validate mobile numbers
    for (const num of validNumbers) {
      if (num.length < 10) {
        toast.error(`Invalid mobile number: ${num}`);
        return;
      }
    }

    try {
      setSettingsSaving(true);
      const response = await adminAPI.updateSettings({
        backOfficeEmails: validEmails,
        backOfficeMobileNumbers: validNumbers
      });

      if (response.data.success) {
        toast.success('Back Office settings updated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Nomenclature configuration state (Admin/Backoffice/Subadmin only)
  const defaultNomenclatureSettings = {
    inquiryPrefix: 'INQ',
    inquiryStartNumber: 1200,
    orderPrefix: 'ORD',
    orderStartNumber: 800,
    quotationPrefix: 'QTN',
    quotationStartNumber: 500,
    includeYearSuffix: true,
    separator: '-'
  };

  const nomenclatureCards = [
    {
      key: 'inquiry',
      title: 'Inquiry ID Format',
      helper: 'Used when a new inquiry is created'
    },
    {
      key: 'quotation',
      title: 'Quotation ID Format',
      helper: 'Applied to quotation numbers shared with customers'
    },
    {
      key: 'order',
      title: 'Order ID Format',
      helper: 'Used once quotations convert to orders'
    }
  ];

  const getStoredNomenclature = () => {
    if (typeof window === 'undefined') return defaultNomenclatureSettings;
    try {
      const stored = localStorage.getItem('nomenclatureConfig');
      return stored ? { ...defaultNomenclatureSettings, ...JSON.parse(stored) } : { ...defaultNomenclatureSettings };
    } catch (error) {
      console.error('Failed to parse nomenclature settings:', error);
      return { ...defaultNomenclatureSettings };
    }
  };

  const [nomenclatureConfig, setNomenclatureConfig] = useState(() => getStoredNomenclature());
  const [nomenclatureSaving, setNomenclatureSaving] = useState(false);

  // Fetch nomenclature config from backend
  const fetchNomenclatureConfig = async () => {
    if (user?.role !== 'admin' && user?.role !== 'backoffice' && user?.role !== 'subadmin') return;

    try {
      const response = await adminAPI.getNomenclatureConfig();
      if (response.data.success && response.data.config) {
        const config = response.data.config;
        setNomenclatureConfig({
          inquiryPrefix: config.inquiryPrefix || 'INQ',
          inquiryStartNumber: config.inquiryStartNumber || 1200,
          quotationPrefix: config.quotationPrefix || 'QTN',
          quotationStartNumber: config.quotationStartNumber || 500,
          orderPrefix: config.orderPrefix || 'ORD',
          orderStartNumber: config.orderStartNumber || 800,
          separator: config.separator || '-',
          includeYearSuffix: config.includeYearSuffix !== undefined ? config.includeYearSuffix : true
        });
        // Also save to localStorage for offline access
        localStorage.setItem('nomenclatureConfig', JSON.stringify({
          inquiryPrefix: config.inquiryPrefix || 'INQ',
          inquiryStartNumber: config.inquiryStartNumber || 1200,
          quotationPrefix: config.quotationPrefix || 'QTN',
          quotationStartNumber: config.quotationStartNumber || 500,
          orderPrefix: config.orderPrefix || 'ORD',
          orderStartNumber: config.orderStartNumber || 800,
          separator: config.separator || '-',
          includeYearSuffix: config.includeYearSuffix !== undefined ? config.includeYearSuffix : true
        }));
      }
    } catch (error) {
      // Ignore cancellation errors - they're expected
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return;
      }
      // Only log real errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching nomenclature config:', error);
      }
      // Use localStorage as fallback
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'backoffice' || user.role === 'subadmin')) {
      fetchNomenclatureConfig();
    }
  }, [user]);

  const handleNomenclatureChange = (field, value) => {
    setNomenclatureConfig((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveNomenclature = async () => {
    try {
      setNomenclatureSaving(true);

      // Save to backend
      const response = await adminAPI.updateNomenclatureConfig({
        inquiryPrefix: nomenclatureConfig.inquiryPrefix,
        inquiryStartNumber: nomenclatureConfig.inquiryStartNumber,
        quotationPrefix: nomenclatureConfig.quotationPrefix,
        quotationStartNumber: nomenclatureConfig.quotationStartNumber,
        orderPrefix: nomenclatureConfig.orderPrefix,
        orderStartNumber: nomenclatureConfig.orderStartNumber,
        separator: nomenclatureConfig.separator,
        includeYearSuffix: nomenclatureConfig.includeYearSuffix
      });

      if (response.data.success) {
        // Also save to localStorage for offline access
        if (typeof window !== 'undefined') {
          localStorage.setItem('nomenclatureConfig', JSON.stringify(nomenclatureConfig));
        }
        toast.success('Nomenclature settings saved successfully');
      } else {
        throw new Error(response.data.message || 'Failed to save nomenclature settings');
      }
    } catch (error) {
      console.error('Failed to save nomenclature settings:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save nomenclature settings');
    } finally {
      setNomenclatureSaving(false);
    }
  };

  const resetNomenclature = async () => {
    try {
      setNomenclatureSaving(true);
      const resetConfig = { ...defaultNomenclatureSettings };
      setNomenclatureConfig(resetConfig);

      // Reset on backend
      await adminAPI.updateNomenclatureConfig({
        inquiryPrefix: resetConfig.inquiryPrefix,
        inquiryStartNumber: resetConfig.inquiryStartNumber,
        quotationPrefix: resetConfig.quotationPrefix,
        quotationStartNumber: resetConfig.quotationStartNumber,
        orderPrefix: resetConfig.orderPrefix,
        orderStartNumber: resetConfig.orderStartNumber,
        separator: resetConfig.separator,
        includeYearSuffix: resetConfig.includeYearSuffix
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('nomenclatureConfig', JSON.stringify(resetConfig));
      }
      toast.success('Nomenclature reset to defaults');
    } catch (error) {
      console.error('Failed to reset nomenclature settings:', error);
      toast.error('Failed to reset nomenclature settings');
    } finally {
      setNomenclatureSaving(false);
    }
  };

  const formatPreview = (type) => {
    const prefix = nomenclatureConfig[`${type}Prefix`] || '';
    const startNumber = parseInt(nomenclatureConfig[`${type}StartNumber`], 10) || 0;
    const padded = String(startNumber).padStart(4, '0');
    const yearSuffix = nomenclatureConfig.includeYearSuffix ? `-${new Date().getFullYear()}` : '';
    const separator = nomenclatureConfig.separator || '';
    return `${prefix}${separator}${padded}${yearSuffix}`;
  };

  // Role-based tabs - admin users don't need Order History and Inquiries
  const getTabs = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'profile', name: 'Profile Information' },
        { id: 'subadmins', name: 'Sub-Admins' },
        { id: 'nomenclature', name: 'ID Nomenclature' }
      ];
    }
    if (user?.role === 'backoffice') {
      return [
        { id: 'profile', name: 'Profile Information' },
        { id: 'nomenclature', name: 'ID Nomenclature' }
      ];
    }
    if (user?.role === 'subadmin') {
      return [{ id: 'profile', name: 'Profile Information' }];
    }
    {
      return [
        { id: 'profile', name: 'Profile Information' },
        { id: 'orders', name: 'Order History' },
        { id: 'inquiries', name: 'Inquiries' }
      ];
    }
  };

  const tabs = getTabs();

  return (
    <div className="w-full min-w-0">
      <div className="mx-auto w-full min-w-0 max-w-7xl">
        <div className="w-full min-w-0 px-0 py-6">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Profile</h1>
            <p className="mt-2 text-gray-600">Manage your account and view your activity</p>
          </div>

          {/* Tabs — scroll horizontally on narrow screens */}
          <div className="mb-6 sm:mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex min-w-0 flex-wrap gap-x-4 gap-y-2 pb-px sm:gap-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabSelect(tab.id)}
                    className={`shrink-0 whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

                {/* Admin Role Indicator */}
                {(user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">A</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-900">
                          {user?.role === 'admin' ? 'Administrator Account' :
                            user?.role === 'backoffice' ? 'Back Office Account' :
                              'Sub-Admin Account'}
                        </h3>
                        <p className="text-sm text-blue-700">
                          You have administrative access to manage inquiries, quotations, and orders.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="company"
                        id="company"
                        required
                        value={formData.company}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
                        GST Number (GSTIN)
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        id="gstNumber"
                        maxLength={15}
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        className={`mt-2 block w-full px-4 py-3 border rounded-md shadow-sm uppercase focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          formData.gstNumber && !isValidGstin(formData.gstNumber)
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      {formData.gstNumber && !isValidGstin(formData.gstNumber) && (
                        <p className="mt-1 text-xs text-red-600">
                          Invalid GSTIN. Use 15 characters: state code + PAN + entity + Z + checksum.
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <select
                        name="department"
                        id="department"
                        required={isCustomer}
                        value={formData.department}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENT_OPTIONS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country/Region
                      </label>
                      <select
                        name="country"
                        id="country"
                        required={isCustomer}
                        value={formData.country}
                        onChange={handleChange}
                        className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select Country</option>
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Delivery Address</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="deliveryStreet" className="block text-sm font-medium text-gray-700">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="deliveryStreet"
                          id="deliveryStreet"
                          required={isCustomer}
                          value={formData.deliveryStreet}
                          onChange={handleChange}
                          placeholder="Building, street, area"
                          className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="deliveryCity" className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          name="deliveryCity"
                          id="deliveryCity"
                          required={isCustomer}
                          value={formData.deliveryCity}
                          onChange={handleChange}
                          className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="deliveryState" className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <input
                          type="text"
                          name="deliveryState"
                          id="deliveryState"
                          required={isCustomer}
                          value={formData.deliveryState}
                          onChange={handleChange}
                          className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="deliveryZipCode" className="block text-sm font-medium text-gray-700">
                          PIN / ZIP Code
                        </label>
                        <input
                          type="text"
                          name="deliveryZipCode"
                          id="deliveryZipCode"
                          required={isCustomer}
                          value={formData.deliveryZipCode}
                          onChange={handleChange}
                          className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>

                {/* Back Office Contact Settings - Admin Only */}
                {user?.role === 'admin' && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Back Office Contact Settings</h2>

                    {settingsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading settings...</span>
                      </div>
                    ) : (
                      <form onSubmit={handleBackOfficeSettingsSave}>
                        {/* Email Addresses */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">Back Office Email IDs</h3>
                              <p className="text-sm text-gray-600">Minimum 4 email addresses required</p>
                            </div>
                            <button
                              type="button"
                              onClick={addBackOfficeEmail}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 shrink-0"
                            >
                              + Add Email
                            </button>
                          </div>

                          <div className="space-y-3">
                            {backOfficeEmails.map((email, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                                </div>
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => handleBackOfficeEmailChange(index, e.target.value)}
                                  placeholder={`Email ${index + 1}`}
                                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                  required={index < 4}
                                />
                                {backOfficeEmails.length > 4 && (
                                  <button
                                    type="button"
                                    onClick={() => removeBackOfficeEmail(index)}
                                    className="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mobile Numbers */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">Back Office Mobile Numbers</h3>
                              <p className="text-sm text-gray-600">Minimum 2 mobile numbers required</p>
                            </div>
                            <button
                              type="button"
                              onClick={addBackOfficeMobile}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 shrink-0"
                            >
                              + Add Number
                            </button>
                          </div>

                          <div className="space-y-3">
                            {backOfficeMobileNumbers.map((mobile, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 text-sm font-medium">{index + 1}</span>
                                </div>
                                <input
                                  type="tel"
                                  value={mobile}
                                  onChange={(e) => handleBackOfficeMobileChange(index, e.target.value)}
                                  placeholder={`Mobile Number ${index + 1}`}
                                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                  required={index < 2}
                                />
                                {backOfficeMobileNumbers.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeBackOfficeMobile(index)}
                                    className="flex-shrink-0 p-1.5 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={fetchBackOfficeSettings}
                            disabled={settingsSaving}
                            className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            Reset
                          </button>
                          <button
                            type="submit"
                            disabled={settingsSaving}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            {settingsSaving ? 'Saving...' : 'Save Back Office Settings'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="w-full min-w-0 p-4 sm:p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:mb-6">My Orders</h2>
                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 mt-2">Loading orders...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="max-h-96 min-w-0 space-y-3 overflow-x-hidden overflow-y-auto sm:space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-lg font-medium text-gray-900">{order.orderNumber}</h3>
                            <p className="mt-1 break-words text-sm text-gray-600">
                              {order.items.join(', ')}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">Ordered on {order.date}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-stretch gap-2 border-t border-gray-100 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0 sm:text-right">
                            <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold sm:ml-auto ${order.status === 'In Production'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'Dispatched'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'Delivered'
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'Confirmed'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                              }`}>
                              {order.status}
                            </span>
                            <p className="text-lg font-semibold text-gray-900">
                              ₹{order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No orders found.</p>
                    <p className="text-sm text-gray-400 mt-2">Your orders will appear here once you place them.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="w-full min-w-0 p-4 sm:p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:mb-6">My Inquiries</h2>
                {inquiriesLoading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                    <p className="mt-2 text-gray-500">Loading inquiries...</p>
                  </div>
                ) : inquiries.length > 0 ? (
                  <div className="max-h-[28rem] min-w-0 space-y-4 overflow-x-hidden overflow-y-auto sm:max-h-96 sm:space-y-6">
                    {inquiries.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className="min-w-0 max-w-full rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md sm:p-6"
                      >
                        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            {inquiry.inquiryNumber ? (
                              <p
                                className="mb-2 min-w-0 max-w-full truncate text-lg font-bold tabular-nums tracking-tight text-gray-900"
                                title={inquiry.inquiryNumber}
                              >
                                {inquiry.inquiryNumber}
                              </p>
                            ) : null}
                            {inquiry.rawTitle ? (
                              <h3 className="mb-2 break-words text-base font-semibold text-gray-800">{inquiry.rawTitle}</h3>
                            ) : null}
                            <p className="mb-3 break-words text-sm leading-relaxed text-gray-600">{inquiry.description}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span>Submitted on {inquiry.date}</span>
                              {inquiry.quoteAmount != null && (
                                <span className="font-medium text-gray-900">
                                  Quote: ₹{Number(inquiry.quoteAmount).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-start sm:items-end">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${inquiry.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : inquiry.status === 'quoted'
                                    ? 'bg-blue-100 text-blue-800'
                                    : inquiry.status === 'payment_received'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inquiry.status === 'in_production'
                                        ? 'bg-purple-100 text-purple-800'
                                        : inquiry.status === 'completed'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                              {inquiry.status === 'in_production'
                                ? 'In Production'
                                : inquiry.status === 'completed'
                                  ? 'Completed'
                                  : inquiry.status === 'payment_received'
                                    ? 'Payment received'
                                    : inquiry.status.charAt(0).toUpperCase() +
                                      inquiry.status.slice(1).replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        {inquiry.files && inquiry.files.length > 0 && (
                          <div className="border-t border-gray-100 pt-4">
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-700">Attached files</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {inquiry.files.map((file, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex max-w-full break-all rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                                      title={file}
                                    >
                                      📎 {file}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex shrink-0 flex-wrap gap-2">
                                {inquiry.status === 'quoted' && (
                                  <Link
                                    to={inquiryQuotationPdfPath(inquiry.id) || `/inquiry/${inquiry.id}`}
                                    className="text-sm font-medium text-green-600 hover:text-green-800"
                                  >
                                    View quote
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No inquiries found.</p>
                    <p className="text-sm text-gray-400 mt-2">Your inquiries will appear here once you submit them.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subadmins' && roleUtils.isAdmin(user) && (
              <div className="p-4 sm:p-6 min-w-0">
                <SubAdminManagement />
              </div>
            )}

            {activeTab === 'nomenclature' && (user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') && (
              <div className="p-4 sm:p-6 min-w-0">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">ID Nomenclature</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure how inquiry, quotation, and order IDs should be generated. These settings help maintain
                    a consistent naming pattern for your operations team.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {nomenclatureCards.map((card) => (
                      <div key={card.key} className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white shadow-sm min-w-0">
                        <div className="mb-3 min-w-0">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900">{card.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{card.helper}</p>
                        </div>

                        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 min-w-0">
                          <p className="text-xs font-medium text-blue-700">Preview</p>
                          <p className="text-sm font-semibold text-blue-900 font-mono break-all mt-0.5">
                            {formatPreview(card.key)}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                            <input
                              type="text"
                              value={nomenclatureConfig[`${card.key}Prefix`] || ''}
                              onChange={(e) => handleNomenclatureChange(`${card.key}Prefix`, e.target.value.toUpperCase())}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500 uppercase"
                              maxLength={6}
                              placeholder="E.g. INQ"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Number</label>
                            <input
                              type="number"
                              min="0"
                              value={nomenclatureConfig[`${card.key}StartNumber`] ?? 0}
                              onChange={(e) => handleNomenclatureChange(`${card.key}StartNumber`, e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Next generated {card.key} ID will begin from this number
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-xl p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={nomenclatureConfig.separator}
                        onChange={(e) => handleNomenclatureChange('separator', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="-"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Character used between prefix and running number (leave blank for none)
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Append running year</p>
                        <p className="text-xs text-gray-500">
                          Adds <span className="font-semibold">-2025</span> style suffix for easy tracking
                        </p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={nomenclatureConfig.includeYearSuffix}
                          onChange={(e) => handleNomenclatureChange('includeYearSuffix', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 relative"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                      <p className="font-semibold mb-1">How it works?</p>
                      <p>
                        Each time a new inquiry, quotation, or order is created, the prefix + separator + padded number +
                        optional year suffix is combined to generate the respective ID.
                      </p>
                    </div> */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetNomenclature}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Reset to Default
                      </button>
                      <button
                        onClick={handleSaveNomenclature}
                        disabled={nomenclatureSaving}
                        className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
                      >
                        {nomenclatureSaving ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Nomenclature'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
