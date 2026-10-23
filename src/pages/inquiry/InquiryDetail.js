import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { inquiryAPI, quotationAPI, orderAPI, paymentAPI } from '../../services/api';
import { getZohoReturnPayload, hasZohoReturnPayload } from '../../utils/zohoReturnParams';
import { isQuotationVisibleToCustomer, canSendQuotationToCustomer } from '../../utils/quotationVisibility';
import ConfirmModal from '../../components/ConfirmModal';
import {
  parseContentDisposition,
  normalizeZipDownloadFilename,
} from '../../utils/downloadFilename';
import QuotationForm from '../../components/QuotationForm';
import QuotationPdfModal from '../../components/QuotationPdfModal';
import { useAuth } from '../../contexts/AuthContext';
import { useQuotation } from '../../contexts/QuotationContext';
import axios from 'axios';
import RejectInquiryModal from '../../components/RejectInquiryModal';
import ReshareQuotationModal from '../../components/ReshareQuotationModal';

const MATERIAL_OPTIONS = ['Mild Steel', 'Stainless Steel', 'Other'];
const GRADE_OPTIONS_BY_MATERIAL = {
  'Mild Steel': ['2062', 'Other'],
  'Stainless Steel': ['302', 'Other'],
};

const fieldInputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm';
const fieldSelectClass =
  'w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm';

const getGradeOptionsForMaterial = (material) => GRADE_OPTIONS_BY_MATERIAL[material] || [];

const normalizePartForEdit = (spec) => {
  const fileMaterial = spec.material || '';
  const isPresetMaterial = fileMaterial && MATERIAL_OPTIONS.includes(fileMaterial);
  const selectedMaterial = isPresetMaterial ? fileMaterial : (fileMaterial ? 'Other' : '');
  const gradeOptions = getGradeOptionsForMaterial(selectedMaterial);
  const fileGrade = spec.grade || '';
  const isKnownGrade = gradeOptions.includes(fileGrade);

  return {
    ...spec,
    material: selectedMaterial,
    customMaterial: selectedMaterial === 'Other' && fileMaterial !== 'Other' ? fileMaterial : '',
    thickness: spec.thickness ?? '',
    grade: selectedMaterial === 'Other' ? (fileGrade || 'Other') : (isKnownGrade ? fileGrade : (fileGrade ? 'Other' : '')),
    customGrade: selectedMaterial === 'Other'
      ? (fileGrade && fileGrade !== 'Other' ? fileGrade : '')
      : (!isKnownGrade && fileGrade && fileGrade !== 'Other' ? fileGrade : ''),
    remarks: spec.remarks || spec.remark || '',
    quantity: spec.quantity ?? 0,
  };
};

const resolvePartValuesForSave = (part) => {
  const material = part.material === 'Other'
    ? (part.customMaterial || '').trim() || 'Other'
    : part.material;
  const grade = part.material === 'Other' || part.grade === 'Other'
    ? (part.customGrade || '').trim() || 'Other'
    : part.grade;
  return { material, grade };
};

const isEmptyAddress = (addr) => {
  if (!addr) return true;
  const street = (addr.street || '').trim();
  return !street || street === 'N/A' || street === 'Not provided';
};

const resolveDeliveryAddress = (inquiryDelivery, customer) => {
  if (!isEmptyAddress(inquiryDelivery)) {
    return inquiryDelivery;
  }
  const userAddr = customer?.address;
  if (userAddr && typeof userAddr === 'object' && !isEmptyAddress(userAddr)) {
    return {
      street: userAddr.street || '',
      city: userAddr.city || '',
      state: userAddr.state || '',
      zipCode: userAddr.zipCode || '',
      country: userAddr.country || customer?.country || ''
    };
  }
  return {
    street: 'N/A',
    city: 'N/A',
    state: 'N/A',
    zipCode: 'N/A',
    country: customer?.country || 'N/A'
  };
};

const TIMELINE_DOT_CLASS = {
  green: 'bg-green-500 ring-green-100',
  blue: 'bg-blue-500 ring-blue-100',
  purple: 'bg-purple-500 ring-purple-100',
  red: 'bg-red-500 ring-red-100',
  amber: 'bg-amber-500 ring-amber-100',
  emerald: 'bg-emerald-500 ring-emerald-100',
  gray: 'bg-gray-400 ring-gray-100'
};

const InquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { saveFromUploadResponse } = useQuotation();
  const [inquiry, setInquiry] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reshareOpen, setReshareOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingParts, setEditingParts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [acceptingQuote, setAcceptingQuote] = useState(false);
  const [showQuotationPdf, setShowQuotationPdf] = useState(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sendingQuotation, setSendingQuotation] = useState(false);

  const getBaseURL = () => {
    const url = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    return url.replace(/\/api$/, '');
  };

  const API_URL = getBaseURL();

  // Helper function to remove file extension from part name
  const removeFileExtension = (filename) => {
    if (!filename) return 'N/A';
    // Remove common file extensions (.dxf, .DXF, .dwg, .DWG, .pdf, .PDF, etc.)
    return filename.replace(/\.(dxf|dwg|pdf|step|stp|iges|igs|stl|xlsx|xls|zip|jpg|jpeg|png|tiff)$/i, '');
  };

  // Function to download Technical Specifications as Excel
  const handleDownloadExcel = () => {
    if (!inquiry) return;
    
    try {
      // Create CSV data (Excel-compatible) - ONLY Technical Specifications
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add inquiry header for reference
      csvContent += `INQUIRY: ${inquiry.inquiryNumber || inquiry.id}\n`;
      csvContent += `CREATED: ${inquiry.createdAt}\n`;
      csvContent += `CUSTOMER: ${inquiry.customer?.name || 'N/A'}\n\n`;
      
      // Add Technical Specifications Table Header
      csvContent += "TECHNICAL SPECIFICATIONS\n\n";
      csvContent += "Part Name,Material,Thickness,Grade,Quantity,Remarks\n";
      
      // Add parts data
      if (inquiry.specifications && inquiry.specifications.length > 0) {
        inquiry.specifications.forEach(part => {
          // Remove file extension from part name
          const rawPartName = part.partRef || part.partName || part.fileName || 'N/A';
          const partName = removeFileExtension(rawPartName);
          const material = part.material || 'N/A';
          const thickness = part.thickness || 'N/A';
          const grade = part.grade || 'N/A';
          const quantity = part.quantity || 'N/A';
          const remarks = part.remarks || 'No remarks';
          
          csvContent += `"${partName}","${material}","${thickness}","${grade}","${quantity}","${remarks}"\n`;
        });
      } else {
        csvContent += "No technical specifications available\n";
      }
      
      csvContent += "\n";
      csvContent += `\nTotal Parts: ${inquiry.specifications?.length || 0}\n`;
      csvContent += `\nNote: Download individual files separately from the Uploaded Files section\n`;
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Technical_Specifications_${inquiry.inquiryNumber || inquiry.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Technical Specifications downloaded successfully!');
    } catch (error) {
      console.error('Error downloading Excel:', error);
      toast.error('Failed to download Excel file');
    }
  };

  const generateTimeline = (inquiryData) => {
    const isStaff = ['admin', 'backoffice', 'subadmin'].includes(user?.role);
    const quotation = inquiryData.quotation || null;
    const quotationVisible = isQuotationVisibleToCustomer(String(quotation?.status || '').toLowerCase());
    const history = Array.isArray(inquiryData.history) ? inquiryData.history : [];
    const timeline = [
      { event: 'Inquiry Created', description: 'Inquiry submitted', at: inquiryData.createdAt, color: 'green' }
    ];

    if (inquiryData.status !== 'pending') {
      timeline.push({ event: 'Under Review', description: 'Being processed by our team', at: null, color: 'blue' });
    }

    history.forEach((entry) => {
      switch (entry.type) {
        case 'quotation_sent':
          timeline.push({ event: 'Quoted', description: 'Quotation shared', at: entry.at, color: 'blue' });
          break;
        case 'quotation_revised':
          timeline.push({
            event: 'Re-quoted',
            description: entry.message,
            at: entry.at,
            color: 'purple',
            fileUrl: isStaff ? entry.fileUrl : null,
            fileName: entry.fileName
          });
          break;
        case 'quotation_resent':
          timeline.push({ event: 'Quotation Re-sent', description: entry.message, at: entry.at, color: 'blue' });
          break;
        case 'rejected':
          timeline.push({ event: 'Rejected', description: entry.message, at: entry.at, color: 'red' });
          break;
        case 'payment_reminder':
          timeline.push({ event: 'Payment Reminder', description: entry.message, at: entry.at, color: 'amber' });
          break;
        default:
          break;
      }
    });

    // Inquiries quoted or rejected before the activity log existed
    if (quotationVisible && !history.some((entry) => entry.type === 'quotation_sent')) {
      timeline.push({ event: 'Quoted', description: 'Quotation shared', at: quotation.sentAt || null, color: 'blue' });
    }
    if (inquiryData.status === 'rejected' && !history.some((entry) => entry.type === 'rejected')) {
      timeline.push({ event: 'Rejected', description: inquiryData.rejectionReason, at: inquiryData.rejectedAt, color: 'red' });
    }
    if (quotation?.acceptedAt) {
      timeline.push({ event: 'Quotation Accepted', description: 'Quotation accepted', at: quotation.acceptedAt, color: 'green' });
    }

    const paid = inquiryData.status === 'payment_received' || inquiryData.quotationPayment?.gatewayPaid;
    if (paid) {
      timeline.push({
        event: 'Payment Received',
        description: 'Payment has been received',
        at: quotation?.payment_date || null,
        color: 'emerald'
      });
    }
    if (inquiryData.status === 'order_created') {
      timeline.push({ event: 'Order Created', description: 'Order has been placed', at: null, color: 'purple' });
    }

    // Dated steps are ordered by time; undated ones stay after the step before them
    let lastTime = 0;
    const ordered = timeline
      .map((item, index) => {
        const time = item.at ? new Date(item.at).getTime() : lastTime;
        lastTime = Math.max(lastTime, time);
        return { item, index, time };
      })
      .sort((a, b) => a.time - b.time || a.index - b.index)
      .map(({ item }) => ({ ...item, date: item.at ? new Date(item.at).toLocaleString() : '' }));

    // What happens next
    const quotationStatus = String(quotation?.status || '').toLowerCase();
    if (!['rejected', 'cancelled'].includes(inquiryData.status) && !paid) {
      if (!quotationVisible) {
        ordered.push({ event: 'Quotation', description: 'Quotation is being prepared', date: '', color: 'gray', upcoming: true });
      } else if (quotationStatus === 'sent') {
        ordered.push({ event: 'Awaiting Acceptance', description: 'Quotation to be reviewed and accepted', date: '', color: 'gray', upcoming: true });
      } else if (quotationStatus === 'accepted' || quotationStatus === 'order_created') {
        ordered.push({
          event: 'Awaiting Payment',
          description: `₹${Number(quotation.totalAmount || 0).toFixed(2)} to be paid to confirm the order`,
          date: '',
          color: 'gray',
          upcoming: true
        });
      }
    }

    return ordered;
  };

  const fetchInquiry = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      
      // Check if user is loaded
      if (!user) {
        console.log('User not loaded yet, waiting...');
        if (!silent) setLoading(false);
        return;
      }
      
      // Check if ID is valid
      if (!id || id === 'undefined' || id === 'null') {
        console.error('Invalid inquiry ID:', id);
        toast.error('Invalid inquiry ID');
        if (!silent) setLoading(false);
        return;
      }
      
      // Check if user has a valid token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please login to view inquiry details');
        window.location.href = '/login';
        if (!silent) setLoading(false);
        return;
      }
      
      // Use regular API - it now handles both customer and admin access
      // The backend route automatically checks permissions
      let response;
      try {
        response = await inquiryAPI.getInquiry(id);
      } catch (apiError) {
        // Ignore cancellation errors - they're expected when requests are cancelled
        if (apiError.name === 'CanceledError' || apiError.code === 'ERR_CANCELED') {
          // Silently return - this is expected behavior when a new request cancels the old one
          return;
        }
        
        // Only log real errors (not cancellations)
        if (process.env.NODE_ENV === 'development' && apiError.response) {
          console.error('API call failed:', apiError.message);
        }
        
        // Check for specific error types
        if (apiError.response?.status === 401) {
          // 401 is handled by axios interceptor - will logout automatically
          toast.error('Authentication failed. Please login again.');
          return;
        } else if (apiError.response?.status === 403) {
          // 403 = Access denied, but user is still authenticated
          toast.error('Access denied. You do not have permission to view this inquiry.');
          // Navigate back instead of logging out
          navigate('/inquiries');
          return;
        } else if (apiError.response?.status === 404) {
          toast.error('Inquiry not found.');
          navigate('/inquiries');
          return;
        } else if (apiError.response?.status === 500) {
          toast.error('Server error. Please try again later.');
          return;
        } else if (apiError.code === 'ERR_NETWORK') {
          toast.error('Network error. Please check if the backend server is running on port 5000.');
          return;
        } else {
          toast.error(`API Error: ${apiError.response?.data?.message || apiError.message}`);
          return;
        }
      }
      
      if (response.data.success) {
        const inquiryData = response.data.inquiry;
        const quotationWorkflowStatus =
          inquiryData.quotationPayment?.orderPaymentWorkflowStatus ||
          inquiryData.quotation?.orderPaymentWorkflowStatus ||
          null;
        const quotationPaymentStatus =
          inquiryData.quotationPayment?.payment_status ||
          inquiryData.quotation?.payment_status ||
          null;
        const derivedGatewayPaid =
          String(quotationWorkflowStatus || '').toLowerCase() === 'paid' &&
          String(quotationPaymentStatus || '').toLowerCase() === 'success';
        const quotationPaymentSnapshot = inquiryData.quotationPayment || {
          orderPaymentWorkflowStatus: quotationWorkflowStatus,
          payment_status: quotationPaymentStatus,
          gatewayPaid: derivedGatewayPaid
        };
        
        // Transform the data to match the component's expected format
        setInquiry({
          id: inquiryData.inquiryNumber,
          inquiryId: inquiryData._id,
          quotationId: inquiryData.quotation?._id || null,
          status: inquiryData.status,
          quotationStatus: inquiryData.quotation?.status || null,
          quotationPayment: quotationPaymentSnapshot,
          createdAt: new Date(inquiryData.createdAt).toLocaleString(),
          customer: {
            name: `${inquiryData.customer.firstName} ${inquiryData.customer.lastName}`,
            company: inquiryData.customer.companyName || 'N/A',
            contact: inquiryData.customer.phoneNumber || inquiryData.customer.phone || 'N/A',
            gst: inquiryData.customer.gstNumber || 'N/A',
            email: inquiryData.customer.email || 'N/A',
            phone: inquiryData.customer.phoneNumber || inquiryData.customer.phone || 'N/A'
          },
          deliveryAddress: resolveDeliveryAddress(inquiryData.deliveryAddress, inquiryData.customer),
          specifications: inquiryData.parts || [],
          files: inquiryData.files || [],
          specialInstructions: inquiryData.specialInstructions || 'No special instructions',
          timeline: generateTimeline(inquiryData),
          rejectionReason: inquiryData.rejectionReason || '',
          rejectedAt: inquiryData.rejectedAt || null,
          history: inquiryData.history || []
        });
      } else {
        console.log('API returned error:', response.data.message);
        toast.error(response.data.message || 'Failed to fetch inquiry details');
      }
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error stack:', error.stack);
      toast.error('Failed to fetch inquiry details');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchInquiry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  useEffect(() => {
    if (searchParams.get('quotationPdf') !== '1' || !inquiry?.quotationId) return;
    setShowQuotationPdf(true);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('quotationPdf');
        return next;
      },
      { replace: true }
    );
  }, [inquiry?.quotationId, searchParams, setSearchParams]);

  useEffect(() => {
    if (!user || user.role !== 'customer' || !id) return undefined;
    const reload = () => fetchInquiry({ silent: true });
    const onVis = () => {
      if (!document.hidden) reload();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', reload);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', reload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  useEffect(() => {
    if (!user || user.role !== 'customer' || !id) return undefined;
    if (inquiry?.status !== 'quoted') return undefined;
    let ticks = 0;
    const max = 36;
    const timer = window.setInterval(() => {
      ticks += 1;
      fetchInquiry({ silent: true });
      if (ticks >= max) window.clearInterval(timer);
    }, 5000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user, inquiry?.status]);

  useEffect(() => {
    if (!user || user.role !== 'customer' || !inquiry?.quotationId) return undefined;
    const isPaid =
      inquiry?.status === 'payment_received' || inquiry?.quotationPayment?.gatewayPaid;
    if (isPaid) return undefined;

    const workflow = String(inquiry?.quotationPayment?.orderPaymentWorkflowStatus || '').toLowerCase();
    const paymentPending =
      workflow === 'payment pending' ||
      String(inquiry?.quotationStatus || inquiry?.quotation?.status || '').toLowerCase() === 'order_created';
    if (!paymentPending) return undefined;
    if (!hasZohoReturnPayload()) return undefined;

    let ticks = 0;
    const maxTicks = 3;
    const pollMs = 12000;

    const syncAndRefresh = async () => {
      try {
        const zohoReturn = getZohoReturnPayload();
        if (!zohoReturn) return;
        const syncRes = await paymentAPI.syncZohoPaymentStatus(inquiry.quotationId, zohoReturn);
        if (syncRes?.data?.rateLimited) return;
        if (
          syncRes?.data?.updated ||
          syncRes?.data?.gatewayPaid ||
          syncRes?.data?.notificationsEnsured
        ) {
          queryClient.invalidateQueries('notifications');
        }
      } catch {
        // webhook may already handle updates; ignore sync errors
      }
      try {
        await fetchInquiry({ silent: true });
      } catch {
        // best effort background refresh
      }
    };

    syncAndRefresh();
    const poll = window.setInterval(() => {
      ticks += 1;
      if (ticks >= maxTicks) {
        window.clearInterval(poll);
        return;
      }
      syncAndRefresh();
    }, pollMs);

    return () => window.clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, inquiry?.quotationId, inquiry?.status, inquiry?.quotationPayment?.gatewayPaid, inquiry?.quotationPayment?.orderPaymentWorkflowStatus, inquiry?.quotationStatus, inquiry?.quotation?.status]);

  const handleCreateQuotation = async (inquiryId, files) => {
    try {
      console.log('=== CREATING QUOTATION ===');
      console.log('Files:', files);
      console.log('Has files:', files && files.length > 0);
      console.log('Inquiry specifications:', inquiry?.specifications);
      console.log('Specifications length:', inquiry?.specifications?.length);
      
      // Calculate total amount from inquiry parts
      const totalAmount = inquiry?.specifications?.reduce((total, part) => {
        return total + (part.quantity * (part.unitPrice || 0));
      }, 0) || 0;

      // Use FormData if files are provided
      const formData = new FormData();
      formData.append('inquiryId', inquiry?.inquiryId || inquiryId);
      formData.append('totalAmount', totalAmount);
      formData.append('parts', JSON.stringify(inquiry?.specifications || []));
      formData.append('terms', 'Standard manufacturing terms apply. Payment required before production begins.');
      formData.append('notes', '');
      formData.append('validUntil', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
      
      // Add file if provided
      if (files && files.length > 0) {
        console.log('Adding file to FormData:', files[0].name);
        formData.append('uploadedFile', files[0]); // Backend expects 'uploadedFile'
      }

      console.log('Creating quotation with FormData');
      console.log('Parts being sent:', inquiry?.specifications?.length, 'parts');
      
      // Call quotation API with FormData
      const response = await quotationAPI.createQuotation(formData);
      
      console.log('Quotation creation response:', response.data);
      
      if (response.data.success) {
        toast.success('Quotation saved. Click Send to publish it to the customer.');
        // Refresh inquiry data to show updated status
        await fetchInquiry();
      } else {
        throw new Error(response.data.message || 'Failed to create quotation');
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Failed to create quotation');
      throw error;
    }
  };

  const handleUploadQuotation = async (inquiryId, files) => {
    try {
      if (!files || files.length === 0) {
        throw new Error('Please upload a quotation PDF');
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (files[0].size > maxSize) {
        throw new Error(`File size exceeds 5MB limit. Your file is ${(files[0].size / 1024 / 1024).toFixed(2)}MB`);
      }

      console.log('📄 ===== FRONTEND: QUOTATION PDF UPLOAD START (InquiryDetail) =====');
      console.log('📁 File Details:');
      console.log('   - File Name:', files[0]?.name);
      console.log('   - File Type:', files[0]?.type);
      console.log('   - File Size:', files[0]?.size, 'bytes');
      console.log('   - File Size (MB):', (files[0]?.size / (1024 * 1024)).toFixed(2), 'MB');
      console.log('   - Last Modified:', new Date(files[0]?.lastModified).toLocaleString());
      console.log('📋 Inquiry Details:');
      console.log('   - Inquiry ID:', inquiry?.inquiryId || inquiryId);
      console.log('   - Specifications Count:', inquiry?.specifications?.length || 0);

      const formData = new FormData();
      const inquiryIdValue = inquiry?.inquiryId || inquiryId;
      formData.append('inquiryId', inquiryIdValue);
      formData.append('quotationPdf', files[0]);
      
      console.log('📤 FormData Contents:');
      console.log('   - inquiryId:', inquiryIdValue);
      console.log('   - quotationPdf:', files[0]?.name, `(${files[0]?.size} bytes)`);
      
      // Include parts data
      const parts = inquiry?.specifications || [];
      formData.append('parts', JSON.stringify(parts));
      
      console.log('   - Parts Count:', parts.length);
      console.log('   - Parts Data:', parts);
      
      // Calculate total amount
      const totalAmount = parts.reduce((total, part) => {
        return total + (part.quantity * (part.unitPrice || 0));
      }, 0) || 0;
      formData.append('totalAmount', totalAmount);
      
      console.log('   - Total Amount:', totalAmount);
      
      // Customer info
      const customerInfo = {
        name: inquiry?.customer?.name || 'N/A',
        company: inquiry?.customer?.company || 'N/A',
        email: inquiry?.customer?.email || 'N/A',
        phone: inquiry?.customer?.phone || 'N/A'
      };
      formData.append('customerInfo', JSON.stringify(customerInfo));
      console.log('   - Customer Info:', customerInfo);

      console.log('🚀 Sending request to backend...');
      
      // Call upload quotation API (FIXED: using quotationAPI instead of inquiryAPI)
      const response = await quotationAPI.uploadQuotation(formData);
      
      console.log('✅ ===== FRONTEND: QUOTATION PDF UPLOAD RESPONSE =====');
      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Data:', response.data);
      console.log('📥 Quotation ID:', response.data?.quotation?._id);
      console.log('📥 Quotation Number:', response.data?.quotation?.quotationNumber);
      
      if (response.data.success) {
        // Save Cloudinary URL to context to prevent loss
        saveFromUploadResponse(response);
        
        toast.success('Quotation uploaded. Click Send to publish it to the customer.');
        // Refresh inquiry data
        await fetchInquiry();
      } else {
        throw new Error(response.data.message || 'Failed to upload quotation');
      }
    } catch (error) {
      console.error('Error uploading quotation:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Failed to upload quotation');
      throw error;
    }
  };

  // Handle edit inquiry for customers
  const handleStartEdit = () => {
    if (inquiry?.specifications && inquiry.specifications.length > 0) {
      setEditingParts(inquiry.specifications.map((spec) => normalizePartForEdit(spec)));
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingParts([]);
  };

  const handleSaveEdit = async () => {
    if (!inquiry || !inquiry.inquiryId) {
      toast.error('Inquiry ID not found');
      return;
    }

    // Validate that all required fields are filled
    const invalidParts = editingParts.filter(part => 
      !part.material || !part.thickness || !part.quantity || part.quantity < 1
    );

    if (invalidParts.length > 0) {
      toast.error('Please fill all required fields (Material, Thickness, Quantity) for all parts');
      return;
    }

    try {
      setSaving(true);
      const response = await inquiryAPI.updateInquiry(inquiry.inquiryId, {
        parts: editingParts.map((part) => {
          const { material, grade } = resolvePartValuesForSave(part);
          return {
            partRef: part.partRef || part.fileName || 'N/A',
            material,
            thickness: part.thickness,
            grade: grade || '',
            quantity: part.quantity,
            remarks: part.remarks || part.remark || '',
          };
        }),
      });

      if (response.data.success) {
        toast.success('Inquiry updated successfully!');
        setIsEditing(false);
        setEditingParts([]);
        // Refresh inquiry data
        await fetchInquiry();
      } else {
        toast.error(response.data.message || 'Failed to update inquiry');
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast.error(error.response?.data?.message || 'Failed to update inquiry');
    } finally {
      setSaving(false);
    }
  };

  const handlePartFieldChange = (index, field, value) => {
    const updatedParts = [...editingParts];
    const currentPart = updatedParts[index];
    const processedValue = typeof value === 'string' ? value.trim() : value;

    if (field === 'material') {
      if (processedValue === 'Other') {
        updatedParts[index] = {
          ...currentPart,
          material: processedValue,
          customMaterial: currentPart.customMaterial || '',
          grade: 'Other',
          customGrade: currentPart.customGrade || '',
        };
      } else {
        const gradeOptions = getGradeOptionsForMaterial(processedValue);
        updatedParts[index] = {
          ...currentPart,
          material: processedValue,
          customMaterial: '',
          grade: gradeOptions.length > 0 ? gradeOptions[0] : '',
          customGrade: '',
        };
      }
    } else if (field === 'grade') {
      updatedParts[index] = {
        ...currentPart,
        grade: processedValue,
        customGrade: processedValue === 'Other' ? (currentPart.customGrade || '') : '',
      };
    } else {
      updatedParts[index] = {
        ...currentPart,
        [field]: processedValue,
      };
    }

    setEditingParts(updatedParts);
  };

  const renderFieldLabel = (label) => (
    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
  );

  const renderEditablePartFields = (index, spec) => {
    const selectedMaterial = spec.material;
    const filteredGrades = getGradeOptionsForMaterial(selectedMaterial);

    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          {renderFieldLabel('Material')}
          <select
            value={spec.material || ''}
            onChange={(e) => handlePartFieldChange(index, 'material', e.target.value)}
            className={fieldSelectClass}
          >
            <option value="">Select Material</option>
            {MATERIAL_OPTIONS.map((material) => (
              <option key={material} value={material}>{material}</option>
            ))}
          </select>
          {selectedMaterial === 'Other' && (
            <input
              type="text"
              value={spec.customMaterial || ''}
              onChange={(e) => handlePartFieldChange(index, 'customMaterial', e.target.value)}
              placeholder="Enter other material (optional)"
              className={`${fieldInputClass} mt-2`}
            />
          )}
        </div>

        <div>
          {renderFieldLabel('Thickness')}
          <input
            type="number"
            step="0.1"
            min="0"
            value={spec.thickness ?? ''}
            onChange={(e) => handlePartFieldChange(index, 'thickness', e.target.value)}
            placeholder="e.g. 1.5"
            className={fieldInputClass}
            disabled={!selectedMaterial}
          />
        </div>

        <div>
          {renderFieldLabel('Grade')}
          {selectedMaterial === 'Other' ? (
            <input
              type="text"
              value={spec.customGrade || ''}
              onChange={(e) => handlePartFieldChange(index, 'customGrade', e.target.value)}
              placeholder="Enter grade (optional)"
              className={fieldInputClass}
            />
          ) : (
            <>
              <select
                value={spec.grade || ''}
                onChange={(e) => handlePartFieldChange(index, 'grade', e.target.value)}
                className={fieldSelectClass}
                disabled={!selectedMaterial}
              >
                <option value="">Select Grade</option>
                {filteredGrades.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              {spec.grade === 'Other' && (
                <input
                  type="text"
                  value={spec.customGrade || ''}
                  onChange={(e) => handlePartFieldChange(index, 'customGrade', e.target.value)}
                  placeholder="Enter grade (optional)"
                  className={`${fieldInputClass} mt-2`}
                />
              )}
            </>
          )}
        </div>

        <div>
          {renderFieldLabel('Quantity')}
          <input
            type="number"
            min="0"
            value={spec.quantity ?? ''}
            onChange={(e) => handlePartFieldChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
            className={fieldInputClass}
          />
        </div>

        <div className="col-span-2">
          {renderFieldLabel('Remark')}
          <input
            type="text"
            value={spec.remarks || spec.remark || ''}
            onChange={(e) => handlePartFieldChange(index, 'remarks', e.target.value)}
            placeholder="Remarks"
            className={fieldInputClass}
          />
        </div>
      </div>
    );
  };

  // Handle Accept Quote button click
  const handleAcceptQuote = async () => {
    if (!inquiry || !inquiry.inquiryId) {
      toast.error('Inquiry ID not found');
      return;
    }

    setAcceptingQuote(true);
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await axios.get(`${apiBaseUrl}/quotation/${inquiry.inquiryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data.success || !response.data.quotation) {
        toast.error('Quotation not found for this inquiry');
        return;
      }

      const q = response.data.quotation;
      const quotationId = q._id;
      const totalAmount = Number(q.totalAmount) || 0;
      const quotationStatus = String(q.status || '').trim().toLowerCase();
      const workflowStatus = String(q.orderPaymentWorkflowStatus || '').trim().toLowerCase();

      // If order is already created and payment is pending, go straight to payment.
      if (quotationStatus === 'order_created' || workflowStatus === 'payment pending') {
        navigate(`/quotation/${quotationId}/payment`);
        return;
      }

      await quotationAPI.respondToQuotation(quotationId, { response: 'accepted' });

      const orderRes = await orderAPI.createOrder(quotationId, {
        paymentMethod: 'online',
        totalAmount,
      });

      if (!orderRes.data?.success) {
        toast.error(orderRes.data?.message || 'Could not create order for payment');
        return;
      }

      navigate(`/quotation/${quotationId}/payment`);
    } catch (error) {
      console.error('Error accepting quote / creating order:', error);
      if (error.response?.status === 404) {
        toast.error('Quotation not found. Please contact support.');
      } else if (error.response?.status === 409) {
        toast.error(error.response?.data?.message || 'Order already paid.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to proceed to payment.');
      }
    } finally {
      setAcceptingQuote(false);
    }
  };

  const handleFileDownload = async (file) => {
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to download files');
        return;
      }

      // Use the correct API base URL
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const fileKey = encodeURIComponent(file.originalName || file.fileName || file.name);
      const downloadUrl = `${apiBaseUrl}/inquiry/${id}/files/${fileKey}/download`;
      
      console.log('Download URL:', downloadUrl);
      console.log('File data:', file);
      console.log('Inquiry ID:', id);
      console.log('File name:', file.fileName || file.name);
      
      // First, test if the backend is accessible
      try {
        const healthResponse = await fetch(`${apiBaseUrl.replace('/api', '')}/api/health`);
        if (healthResponse.ok) {
          console.log('Backend is accessible');
        } else {
          console.log('Backend health check failed');
        }
      } catch (healthError) {
        console.log('Backend health check error:', healthError);
        toast.error('Backend server is not accessible. Please check if the server is running on port 5000.');
        return;
      }
      
      // Add authorization header by creating a fetch request first
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed:', response.status, errorText);
        throw new Error(`Download failed: ${response.status} ${errorText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('File download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download file: ${error.message}`);
    }
  };

  const handleDownloadAllFiles = async () => {
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to download files');
        return;
      }

      // Check if there are files to download
      if (!inquiry.files || inquiry.files.length === 0) {
        toast.error('No files available to download');
        return;
      }

      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const downloadUrl = `${apiBaseUrl}/inquiry/${id}/files/download-all`;
      
      console.log('Downloading all files as ZIP...');
      console.log('Download URL:', downloadUrl);
      console.log('Total files:', inquiry.files.length);

      toast.loading('Creating ZIP file...', { id: 'zip-download' });

      // Make the request
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ZIP download failed:', response.status, errorText);
        throw new Error(`Download failed: ${response.status}`);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const defaultZipName = `${inquiry.inquiryNumber || inquiry.id}_files.zip`;
      const filename = normalizeZipDownloadFilename(
        parseContentDisposition(contentDisposition) || defaultZipName,
        defaultZipName
      );

      const blob = await response.blob();
      const zipBlob =
        blob.type === 'application/zip' || blob.type === 'application/x-zip-compressed'
          ? blob
          : new Blob([await blob.arrayBuffer()], { type: 'application/zip' });
      const url = window.URL.createObjectURL(zipBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${inquiry.files.length} files downloaded as ZIP`, { id: 'zip-download' });
    } catch (error) {
      console.error('ZIP download error:', error);
      toast.error(`Failed to download files: ${error.message}`, { id: 'zip-download' });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'payment_received':
        return 'bg-emerald-100 text-emerald-800';
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
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Inquiry not found</h1>
            <Link 
              to='/dashboard'
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const techSpecsList =
    isEditing && editingParts.length > 0 ? editingParts : inquiry.specifications || [];

  const customerNameParts = (inquiry.customer?.name || '').trim().split(/\s+/).filter(Boolean);
  const quotationFormInquiry = {
    _id: inquiry.inquiryId,
    inquiryNumber: inquiry.id,
    parts: inquiry.specifications || [],
    customerData: {
      firstName: customerNameParts[0] || 'N/A',
      lastName: customerNameParts.slice(1).join(' ') || '',
      companyName: inquiry.customer?.company || 'N/A',
      email: inquiry.customer?.email || 'N/A',
      phoneNumber: inquiry.customer?.phone || inquiry.customer?.contact || 'N/A',
      gstNumber: inquiry.customer?.gst || 'N/A'
    }
  };
  const normalizedQuotationStatus = String(inquiry?.quotationStatus || '').trim().toLowerCase();
  const normalizedWorkflowStatus = String(inquiry?.quotationPayment?.orderPaymentWorkflowStatus || '').trim().toLowerCase();
  const isGatewayPaid =
    inquiry?.status === 'payment_received' || inquiry?.quotationPayment?.gatewayPaid;
  const isPaymentPending =
    !isGatewayPaid &&
    (normalizedQuotationStatus === 'order_created' ||
      normalizedWorkflowStatus === 'payment pending');
  const canShowAcceptQuoteButton =
    user?.role === 'customer' &&
    !isGatewayPaid &&
    !isEditing &&
    normalizedQuotationStatus === 'sent';
  const canShowPayNowButton =
    user?.role === 'customer' &&
    !isGatewayPaid &&
    !isEditing &&
    isPaymentPending &&
    normalizedQuotationStatus !== 'sent';

  const isAdminUser =
    user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin';

  const customerSeesQuotation =
    isAdminUser || isQuotationVisibleToCustomer(normalizedQuotationStatus);

  const hasQuotationSubmitted = isAdminUser
    ? Boolean(
        inquiry?.quotationId ||
        inquiry?.status === 'quoted' ||
        (normalizedQuotationStatus && normalizedQuotationStatus !== '')
      )
    : Boolean(inquiry?.quotationId && customerSeesQuotation);

  const canShowQuoteButton =
    isAdminUser &&
    !hasQuotationSubmitted &&
    ['pending', 'reviewed'].includes(inquiry?.status);

  const canShowSendQuotationButton =
    isAdminUser &&
    !isEditing &&
    Boolean(inquiry?.quotationId) &&
    canSendQuotationToCustomer(normalizedQuotationStatus);

  const handleSendQuotationToCustomer = async () => {
    const quotationId = inquiry?.quotationId;
    if (!quotationId || sendingQuotation) return;

    try {
      setSendingQuotation(true);
      const response = await quotationAPI.sendQuotation(quotationId);
      if (response.data.success) {
        toast.success('Quotation sent! The customer can now view and accept it.');
        setSendConfirmOpen(false);
        await fetchInquiry({ silent: true });
      } else {
        toast.error(response.data.message || 'Failed to send quotation');
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast.error(error.response?.data?.message || 'Failed to send quotation');
    } finally {
      setSendingQuotation(false);
    }
  };

  const canShowQuotedBadge =
    hasQuotationSubmitted &&
    !canShowSendQuotationButton &&
    (isAdminUser ? true : customerSeesQuotation) &&
    !isGatewayPaid &&
    !isEditing;

  let createdLabel = '';
  let createdTitle = '';
  if (inquiry.createdAt != null) {
    try {
      const d = new Date(inquiry.createdAt);
      if (!Number.isNaN(d.getTime())) {
        createdTitle = d.toLocaleString();
        createdLabel = d.toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      } else {
        createdLabel = String(inquiry.createdAt);
        createdTitle = createdLabel;
      }
    } catch {
      createdLabel = String(inquiry.createdAt);
      createdTitle = createdLabel;
    }
  }

  return (
    <div className="w-full min-w-0 bg-gray-50">
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="min-w-0 px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <Link
              to='/dashboard'
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {inquiry.status === 'rejected' && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-red-800">This inquiry was rejected</h2>
              {inquiry.rejectionReason && (
                <p className="mt-1 whitespace-pre-line text-sm text-red-700">{inquiry.rejectionReason}</p>
              )}
              {inquiry.rejectedAt && (
                <p className="mt-2 text-xs text-red-600">{new Date(inquiry.rejectedAt).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Details on the left, tracking pinned to the right from the top */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
          {/* Inquiry Header */}
          <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="min-w-0 w-full">
                <h1
                  className="min-w-0 max-w-full truncate text-2xl font-bold tabular-nums tracking-tight text-gray-900"
                  title={inquiry.id}
                >
                  {inquiry.id}
                </h1>
                <p
                  className="mt-1 truncate text-sm text-gray-500"
                  title={createdTitle || undefined}
                >
                  {createdLabel ? `Created ${createdLabel}` : ''}
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-2 border-t border-gray-100 pt-4 sm:flex sm:flex-wrap sm:items-center">
                {/* Download Drawing (All Files as ZIP) - Show for Admin, Back Office, and Sub Admin users */}
                {(user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') && inquiry?.files && inquiry.files.length > 0 && (
                  <button 
                    onClick={handleDownloadAllFiles}
                    className="inline-flex w-full items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 whitespace-nowrap sm:w-auto"
                    title="Download all files as ZIP"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Drawing
                  </button>
                )}

                {isAdminUser && !['rejected', 'cancelled', 'payment_received'].includes(inquiry.status) && (
                  <button
                    type="button"
                    onClick={() => setRejectOpen(true)}
                    className="inline-flex w-full items-center justify-center rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 whitespace-nowrap sm:w-auto"
                  >
                    Reject
                  </button>
                )}

                {/* Re-share — update (file/amount) and re-send a quotation that was already sent */}
                {isAdminUser && inquiry.quotationId && !isGatewayPaid &&
                  ['sent', 'accepted'].includes(normalizedQuotationStatus) &&
                  !['rejected', 'cancelled', 'payment_received'].includes(inquiry.status) && (
                  <button
                    type="button"
                    onClick={() => setReshareOpen(true)}
                    className="inline-flex w-full items-center justify-center rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 whitespace-nowrap sm:w-auto"
                  >
                    Update &amp; Re-share Quotation
                  </button>
                )}

                {/* Quote — only before a quotation exists for this inquiry */}
                {canShowQuoteButton && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuotationModal(true);
                    }}
                    className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 whitespace-nowrap sm:w-auto"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Quote
                  </button>
                )}

                {/* Send — publish draft quotation so customer can view it */}
                {canShowSendQuotationButton && (
                  <button
                    type="button"
                    onClick={() => setSendConfirmOpen(true)}
                    disabled={sendingQuotation}
                    className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap sm:w-auto"
                    title="Publish quotation to customer"
                  >
                    {sendingQuotation ? 'Sending...' : 'Send'}
                  </button>
                )}
                
                {/* Download Technical Specifications as CSV - Show for Admin, Back Office, and Sub Admin users */}
                {(user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') && (
                  <button 
                    onClick={handleDownloadExcel}
                    className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 whitespace-nowrap sm:w-auto"
                    title="Download Technical Specifications as CSV"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV file
                  </button>
                )}
                
                {/* Edit Inquiry Button - Show for customers when inquiry can be edited */}
                {user?.role === 'customer' && 
                 inquiry?.status && 
                 ['pending', 'reviewed', 'quoted'].includes(inquiry.status) && 
                 !isEditing && (
                  <button 
                    onClick={handleStartEdit}
                    className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 whitespace-nowrap sm:w-auto"
                    title="Edit inquiry details"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Inquiry
                  </button>
                )}

                {/* Save/Cancel buttons when editing */}
                {isEditing && (
                  <>
                    <button 
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap sm:w-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex w-full items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap sm:w-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </>
                )}

                {/* Accept Quote — only before customer accepts (quotation status: sent) */}
                {canShowAcceptQuoteButton && (
                  <button 
                    onClick={handleAcceptQuote}
                    disabled={acceptingQuote}
                    className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap sm:w-auto"
                    title="Accept quote and proceed to payment"
                  >
                    {acceptingQuote ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Accept Quote
                      </>
                    )}
                  </button>
                )}

                {/* Pay Now — accepted quote, payment not yet confirmed in Zoho */}
                {canShowPayNowButton && (
                  <button
                    onClick={handleAcceptQuote}
                    disabled={acceptingQuote}
                    className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap sm:w-auto"
                    title="Complete payment for this quotation"
                  >
                    {acceptingQuote ? 'Loading...' : 'Pay Now'}
                  </button>
                )}
                
                {/* Quoted — opens quotation PDF popup */}
                {canShowQuotedBadge && (
                  <button
                    type="button"
                    onClick={() => {
                      if (inquiry?.quotationId) {
                        setShowQuotationPdf(true);
                      } else {
                        toast.error('Quotation is not linked to this inquiry yet.');
                      }
                    }}
                    className="inline-flex w-full items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 whitespace-nowrap sm:w-auto"
                    title="View quotation PDF"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Quoted
                  </button>
                )}

                {isGatewayPaid && !isEditing && (
                  <span className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white whitespace-nowrap sm:w-auto">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Paid
                  </span>
                )}
                
              </div>
            </div>
          </div>

          {/* Technical Specifications - Full Width */}
          <div className="mb-6 min-w-0 rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Technical Specifications</h3>
            {techSpecsList.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No technical specifications available</p>
            ) : (
              <>
                {isEditing && editingParts.length > 0 && (
                  <div className="mb-4 space-y-3 md:hidden">
                    {editingParts.map((spec, index) => {
                      const partLabel = spec.partRef || spec.fileName || 'N/A';
                      return (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <div className="mb-3 flex gap-2 border-b border-gray-100 pb-3">
                            <svg
                              className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Part reference
                              </p>
                              <p className="break-all text-sm font-semibold text-gray-900" title={partLabel}>
                                {partLabel}
                              </p>
                            </div>
                          </div>
                          {renderEditablePartFields(index, spec)}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isEditing && (inquiry.specifications || []).length > 0 && (
                  <div className="mb-4 space-y-3 md:hidden">
                    {(inquiry.specifications || []).map((spec, index) => {
                      const partLabel = spec.partRef || spec.fileName || 'N/A';
                      return (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
                        >
                          <div className="flex gap-2">
                            <svg
                              className="mt-0.5 h-5 w-5 shrink-0 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Part reference
                              </p>
                              <p className="break-all text-sm font-semibold text-gray-900" title={partLabel}>
                                {partLabel}
                              </p>
                            </div>
                          </div>
                          <dl className="mt-3 grid grid-cols-1 gap-3 border-t border-gray-200 pt-3 text-sm sm:grid-cols-2">
                            <div>
                              <dt className="text-gray-500">Material</dt>
                              <dd className="font-medium text-gray-900">{spec.material || 'N/A'}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Thickness</dt>
                              <dd className="font-medium text-gray-900">{spec.thickness || 'N/A'}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Grade</dt>
                              <dd className="font-medium text-gray-900">{spec.grade || 'N/A'}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Quantity</dt>
                              <dd className="font-medium text-gray-900">{spec.quantity ?? 'N/A'}</dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="text-gray-500">Remark</dt>
                              <dd className="break-words font-medium text-gray-900">
                                {spec.remarks || spec.remark || 'No remarks'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div
                  className={
                    (inquiry.specifications || []).length > 0 && !isEditing
                      ? 'hidden min-w-0 overflow-hidden rounded-lg border border-gray-200 md:block'
                      : isEditing
                        ? 'hidden min-w-0 overflow-hidden rounded-lg border border-gray-200 md:block'
                        : 'min-w-0 overflow-hidden rounded-lg border border-gray-200'
                  }
                >
              <table className="w-full table-fixed divide-y divide-gray-200">
                <colgroup>
                  <col className="w-[24%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[18%]" />
                  <col className="w-[8%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Part Ref
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Material
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Thickness
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Grade
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Remark
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isEditing && editingParts.length > 0 ? (
                    editingParts.map((spec, index) => {
                      const selectedMaterial = spec.material;
                      const filteredGrades = getGradeOptionsForMaterial(selectedMaterial);

                      return (
                        <tr key={index} className="align-top hover:bg-gray-50">
                          <td className="px-3 py-4 text-sm font-medium text-gray-900">
                            <div className="flex min-w-0 items-start">
                              <svg className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span
                                title={spec.partRef || spec.fileName || 'N/A'}
                                className="min-w-0 flex-1 break-all whitespace-normal"
                              >
                                {spec.partRef || spec.fileName || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <select
                              value={spec.material || ''}
                              onChange={(e) => handlePartFieldChange(index, 'material', e.target.value)}
                              className={fieldSelectClass}
                            >
                              <option value="">Select Material</option>
                              {MATERIAL_OPTIONS.map((material) => (
                                <option key={material} value={material}>{material}</option>
                              ))}
                            </select>
                            {selectedMaterial === 'Other' && (
                              <input
                                type="text"
                                value={spec.customMaterial || ''}
                                onChange={(e) => handlePartFieldChange(index, 'customMaterial', e.target.value)}
                                placeholder="Other material (optional)"
                                className={`${fieldInputClass} mt-2`}
                              />
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={spec.thickness ?? ''}
                              onChange={(e) => handlePartFieldChange(index, 'thickness', e.target.value)}
                              placeholder="0"
                              className={fieldInputClass}
                              disabled={!selectedMaterial}
                            />
                          </td>
                          <td className="px-3 py-4">
                            {selectedMaterial === 'Other' ? (
                              <input
                                type="text"
                                value={spec.customGrade || ''}
                                onChange={(e) => handlePartFieldChange(index, 'customGrade', e.target.value)}
                                placeholder="Grade (optional)"
                                className={fieldInputClass}
                              />
                            ) : (
                              <>
                                <select
                                  value={spec.grade || ''}
                                  onChange={(e) => handlePartFieldChange(index, 'grade', e.target.value)}
                                  className={fieldSelectClass}
                                  disabled={!selectedMaterial}
                                >
                                  <option value="">Select Grade</option>
                                  {filteredGrades.map((grade) => (
                                    <option key={grade} value={grade}>{grade}</option>
                                  ))}
                                </select>
                                {spec.grade === 'Other' && (
                                  <input
                                    type="text"
                                    value={spec.customGrade || ''}
                                    onChange={(e) => handlePartFieldChange(index, 'customGrade', e.target.value)}
                                    placeholder="Grade (optional)"
                                    className={`${fieldInputClass} mt-2`}
                                  />
                                )}
                              </>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <input
                              type="text"
                              value={spec.remarks || spec.remark || ''}
                              onChange={(e) => handlePartFieldChange(index, 'remarks', e.target.value)}
                              className={fieldInputClass}
                              placeholder="Remarks"
                            />
                          </td>
                          <td className="px-3 py-4">
                            <input
                              type="number"
                              min="0"
                              value={spec.quantity ?? ''}
                              onChange={(e) => handlePartFieldChange(index, 'quantity', parseInt(e.target.value, 10) || 0)}
                              className={fieldInputClass}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : inquiry.specifications && inquiry.specifications.length > 0 ? (
                    inquiry.specifications.map((spec, index) => (
                      <tr key={index} className="align-top hover:bg-gray-50">
                        <td className="px-3 py-4 text-sm font-medium text-gray-900">
                          <div className="flex min-w-0 items-start">
                            <svg className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span
                              title={spec.partRef || spec.fileName || 'N/A'}
                              className="min-w-0 flex-1 break-all"
                            >
                              {spec.partRef || spec.fileName || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 break-words">{spec.material || 'N/A'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900">{spec.thickness || 'N/A'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900">{spec.grade || 'N/A'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900 break-words">{spec.remarks || spec.remark || 'No remarks'}</td>
                        <td className="px-3 py-4 text-sm text-gray-900">{spec.quantity ?? 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                        No technical specifications available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
                </div>
              </>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">

              {/* Uploaded Files */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
                  {/* Show Download All button only for customers (admin has "Download Drawing" at top) */}
                  {user?.role === 'customer' && inquiry.files && inquiry.files.length > 0 && (
                    <button
                      onClick={handleDownloadAllFiles}
                      className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors shadow-sm"
                      title="Download all files as ZIP"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download All ({inquiry.files.length})
                    </button>
                  )}
                </div>
                <div 
                  className="space-y-3 overflow-y-auto files-scroll-container"
                  style={{ 
                    maxHeight: '400px',
                    scrollbarWidth: 'none', /* Firefox */
                    msOverflowStyle: 'none' /* IE and Edge */
                  }}
                >
                  <style>{`
                    .files-scroll-container::-webkit-scrollbar {
                      display: none; /* Chrome, Safari, Opera */
                    }
                    .files-scroll-container {
                      -ms-overflow-style: none; /* IE and Edge */
                      scrollbar-width: none; /* Firefox */
                    }
                  `}</style>
                  {inquiry.files && inquiry.files.length > 0 ? (
                    inquiry.files.map((file, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs">
                              {file.fileType === '.zip' ? '📦' : 
                               file.fileType === '.xlsx' || file.fileType === '.xls' || file.fileType === '.xlsm' ? '📊' : 
                               file.fileType === '.pdf' ? '📄' : '📄'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p 
                            className="text-sm font-medium text-gray-900 truncate max-w-[200px]" 
                            title={file.originalName || file.name}
                          >
                            {(() => {
                              const fileName = file.originalName || file.name || 'N/A';
                              if (fileName.length > 30) {
                                return fileName.substring(0, 30) + '...';
                              }
                              return fileName;
                            })()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.fileType || file.type} • {(file.fileSize || file.size) ? `${Math.round((file.fileSize || file.size) / 1024)} KB` : 'Unknown size'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleFileDownload(file)}
                          className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title={`Download ${file.originalName || file.name}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">📄</div>
                      <p className="text-sm text-gray-500">No files uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Special Instructions</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{inquiry.specialInstructions}</p>
                </div>
              </div> */}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Company Name</p>
                      <p className="text-sm text-gray-900">{inquiry.customer.company}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Contact</p>
                      <p className="text-sm text-gray-900">{inquiry.customer.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-gray-500">GST</p>
                      <p className="text-sm text-gray-900">{inquiry.customer.gst}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 break-all">{inquiry.customer.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="text-sm text-gray-900 space-y-1">
                      <p>{inquiry.deliveryAddress.street}</p>
                      <p className="text-gray-700">
                        {[inquiry.deliveryAddress.city, inquiry.deliveryAddress.state, inquiry.deliveryAddress.zipCode]
                          .filter((part) => part && part !== 'N/A')
                          .join(', ')}
                      </p>
                      {inquiry.deliveryAddress.country && inquiry.deliveryAddress.country !== 'N/A' && (
                        <p className="text-gray-700">{inquiry.deliveryAddress.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Inquiry tracking */}
          <aside className="w-full lg:sticky lg:top-6 lg:w-80 lg:shrink-0 xl:w-96">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Inquiry Tracking</h3>
              <ol className="relative">
                {inquiry.timeline.map((event, index) => {
                  const next = inquiry.timeline[index + 1];
                  return (
                    <li key={index} className="relative flex gap-4 pb-6 last:pb-0">
                      {next && (
                        <span
                          className={`absolute left-[7px] top-5 h-full ${next.upcoming ? 'border-l-2 border-dashed border-gray-300' : 'w-0.5 bg-gray-200'}`}
                          aria-hidden
                        />
                      )}
                      <span
                        className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-white ring-2 ${
                          event.upcoming ? 'bg-white ring-gray-300' : TIMELINE_DOT_CLASS[event.color] || TIMELINE_DOT_CLASS.gray
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${event.upcoming ? 'text-gray-500' : 'text-gray-900'}`}>{event.event}</p>
                        {event.description && (
                          <p className="mt-0.5 whitespace-pre-line break-words text-xs text-gray-600">{event.description}</p>
                        )}
                        {(event.date || event.fileUrl) && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            {event.date}
                            {event.fileUrl && (
                              <>
                                {event.date ? ' · ' : ''}
                                <a href={event.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  Previous file{event.fileName ? ` (${event.fileName})` : ''}
                                </a>
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
          </div>
        </div>
      </div>

      {/* Quotation Form (existing Create Quotation flow) */}
      {showQuotationModal && (
        <QuotationForm
          inquiry={quotationFormInquiry}
          onClose={() => setShowQuotationModal(false)}
          onSuccess={(quotation) => {
            setShowQuotationModal(false);
            setInquiry((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'quoted',
                    quotationId: quotation?._id || prev.quotationId,
                    quotationStatus: quotation?.status || prev.quotationStatus || 'draft',
                  }
                : prev
            );
            fetchInquiry();
          }}
        />
      )}

      <QuotationPdfModal
        quotationId={inquiry?.quotationId}
        isOpen={showQuotationPdf}
        onClose={() => setShowQuotationPdf(false)}
      />

      <ConfirmModal
        isOpen={sendConfirmOpen}
        onClose={() => {
          if (!sendingQuotation) setSendConfirmOpen(false);
        }}
        onConfirm={handleSendQuotationToCustomer}
        title="Send quotation to customer?"
        message="The customer will be able to view, download, and accept this quotation in their account. They will also receive an email notification."
        confirmLabel="Send to customer"
        cancelLabel="Cancel"
        loading={sendingQuotation}
      />


      {reshareOpen && (
        <ReshareQuotationModal
          quotation={{ _id: inquiry.quotationId, customer: inquiry.customer?.name }}
          onClose={() => setReshareOpen(false)}
          onShared={() => fetchInquiry({ silent: true })}
        />
      )}

      {rejectOpen && (
        <RejectInquiryModal
          inquiry={{ _id: inquiry.inquiryId, inquiryNumber: inquiry.id, customer: inquiry.customer?.name }}
          onClose={() => setRejectOpen(false)}
          onRejected={() => fetchInquiry({ silent: true })}
        />
      )}
    </div>
  );
};

export default InquiryDetail;
