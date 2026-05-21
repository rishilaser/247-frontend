import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { inquiryAPI, quotationAPI, orderAPI, paymentAPI } from '../../services/api';
import { getZohoReturnPayload, hasZohoReturnPayload } from '../../utils/zohoReturnParams';
import {
  parseContentDisposition,
  normalizeZipDownloadFilename,
} from '../../utils/downloadFilename';
import QuotationForm from '../../components/QuotationForm';
import QuotationPdfModal from '../../components/QuotationPdfModal';
import { useAuth } from '../../contexts/AuthContext';
import { useQuotation } from '../../contexts/QuotationContext';
import axios from 'axios';

const InquiryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { saveFromUploadResponse } = useQuotation();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingParts, setEditingParts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [materialData, setMaterialData] = useState([]);
  const [acceptingQuote, setAcceptingQuote] = useState(false);
  const [showQuotationPdf, setShowQuotationPdf] = useState(false);

  // Get base URL for material data
  const getBaseURL = () => {
    const url = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return url.replace(/\/api$/, '');
  };

  const API_URL = getBaseURL();

  // Fetch material data for edit mode
  useEffect(() => {
    if (isEditing) {
      fetchMaterialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const fetchMaterialData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/materials`);
      if (response.data.success && response.data.materialData) {
        const activeMaterials = response.data.materialData.filter(m => m.status === 'Active');
        setMaterialData(activeMaterials);
      }
    } catch (error) {
      console.error('Error fetching material data:', error);
    }
  };

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
    const timeline = [
      {
        event: 'Inquiry Created',
        date: new Date(inquiryData.createdAt).toLocaleString(),
        status: 'completed',
        color: 'green'
      }
    ];

    if (['quoted', 'accepted', 'payment_received'].includes(inquiryData.status) || inquiryData.status === 'order_created') {
      timeline.push({
        event: 'Under Review',
        description: 'Being processed by our team',
        status: 'completed',
        color: 'blue'
      });

      timeline.push({
        event: 'Quotation Ready',
        description: 'Price and delivery details available',
        status: 'completed',
        color: 'green'
      });
    }

    if (
      inquiryData.status === 'payment_received' ||
      inquiryData.quotationPayment?.gatewayPaid
    ) {
      timeline.push({
        event: 'Payment received',
        description: 'Your payment has been received',
        status: 'completed',
        color: 'emerald'
      });
    }

    if (inquiryData.status === 'order_created') {
      timeline.push({
        event: 'Order Created',
        description: 'Order has been placed',
        status: 'completed',
        color: 'purple'
      });
    }

    return timeline;
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
          deliveryAddress: inquiryData.deliveryAddress || {
            street: 'N/A',
            city: 'N/A',
            country: 'N/A'
          },
          specifications: inquiryData.parts || [],
          files: inquiryData.files || [],
          specialInstructions: inquiryData.specialInstructions || 'No special instructions',
          timeline: generateTimeline(inquiryData)
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
        toast.success('Quotation saved. Send it from the Quotations tab to email the customer.');
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
        
        toast.success('Quotation uploaded. Send it from the Quotations tab to email the customer.');
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
      setEditingParts(inquiry.specifications.map(spec => ({ ...spec })));
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
        parts: editingParts.map(part => ({
          partRef: part.partRef || part.fileName || 'N/A',
          material: part.material,
          thickness: part.thickness,
          grade: part.grade || '',
          quantity: part.quantity,
          remarks: part.remarks || part.remark || ''
        }))
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

  // Helper function to get thicknesses for a specific material
  const getThicknessesForMaterial = (material) => {
    if (!material || materialData.length === 0) {
      return materialData.length > 0
        ? [...new Set(materialData.map(m => m.thickness))].sort((a, b) => parseFloat(a) - parseFloat(b))
        : ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '4.0', '5.0'];
    }
    return materialData
      .filter(m => m.material === material)
      .map(m => m.thickness)
      .filter((thickness, index, self) => self.indexOf(thickness) === index)
      .sort((a, b) => parseFloat(a) - parseFloat(b));
  };
  
  // Helper function to get grades for a specific material and thickness combination
  const getGradesForMaterialAndThickness = (material, thickness) => {
    if (!material || !thickness || materialData.length === 0) {
      return [];
    }
    return materialData
      .filter(m => m.material === material && m.thickness === thickness && m.grade && m.grade.trim() !== '')
      .map(m => m.grade)
      .filter((grade, index, self) => self.indexOf(grade) === index);
  };

  const handlePartFieldChange = (index, field, value) => {
    const updatedParts = [...editingParts];
    const currentPart = updatedParts[index];
    
    // When material changes, auto-set first available thickness and grade
    if (field === 'material') {
      const thicknesses = getThicknessesForMaterial(value);
      let newThickness = '';
      let newGrade = '';
      
      if (thicknesses.length > 0) {
        // Auto-set first available thickness
        newThickness = thicknesses[0];
        
        // Auto-set first available grade for the new material and thickness
        const grades = getGradesForMaterialAndThickness(value, newThickness);
        if (grades.length > 0) {
          newGrade = grades[0];
        }
      }
      
      updatedParts[index] = {
        ...currentPart,
        [field]: value,
        thickness: newThickness,
        grade: newGrade
      };
    }
    // When thickness changes, auto-set first available grade
    else if (field === 'thickness') {
      const grades = getGradesForMaterialAndThickness(currentPart.material, value);
      let newGrade = '';
      
      if (grades.length > 0) {
        // Auto-set first available grade
        newGrade = grades[0];
      }
      
      updatedParts[index] = {
        ...currentPart,
        [field]: value,
        grade: newGrade
      };
    }
    // For other fields, just update the field
    else {
      updatedParts[index] = {
        ...currentPart,
        [field]: value
      };
    }
    
    setEditingParts(updatedParts);
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

  const hasQuotationSubmitted = Boolean(
    inquiry?.quotationId ||
    inquiry?.status === 'quoted' ||
    (normalizedQuotationStatus && normalizedQuotationStatus !== '')
  );

  const isAdminUser =
    user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin';

  const canShowQuoteButton =
    isAdminUser &&
    !hasQuotationSubmitted &&
    ['pending', 'reviewed'].includes(inquiry?.status);

  const canShowQuotedBadge =
    hasQuotationSubmitted && !isGatewayPaid && !isEditing;

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

          {/* Inquiry Header */}
          <div className="mb-6 rounded-lg bg-white p-4 shadow sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
              <div className="min-w-0 w-full lg:flex-1">
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
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-shrink-0 lg:flex-row lg:flex-wrap lg:justify-end lg:gap-2">
                {/* Download Drawing (All Files as ZIP) - Show for Admin, Back Office, and Sub Admin users */}
                {(user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') && inquiry?.files && inquiry.files.length > 0 && (
                  <button 
                    onClick={handleDownloadAllFiles}
                    className="inline-flex w-full items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 lg:w-auto"
                    title="Download all files as ZIP"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Drawing
                  </button>
                )}

                {/* Quote — only before a quotation exists for this inquiry */}
                {canShowQuoteButton && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuotationModal(true);
                    }}
                    className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 lg:w-auto"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Quote
                  </button>
                )}
                
                {/* Download Technical Specifications as CSV - Show for Admin, Back Office, and Sub Admin users */}
                {(user?.role === 'admin' || user?.role === 'backoffice' || user?.role === 'subadmin') && (
                  <button 
                    onClick={handleDownloadExcel}
                    className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 lg:w-auto"
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
                    className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 lg:w-auto"
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
                      className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex w-full items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
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
                    className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
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
                    className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
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
                    className="inline-flex w-full items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 lg:w-auto"
                    title="View quotation PDF"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Quoted
                  </button>
                )}

                {isGatewayPaid && !isEditing && (
                  <span className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white lg:w-auto">
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
                              <p className="truncate text-sm font-semibold text-gray-900" title={partLabel}>
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
                    !isEditing && (inquiry.specifications || []).length > 0
                      ? 'hidden min-w-0 max-w-full overflow-x-auto rounded-lg border border-gray-200 md:block'
                      : 'min-w-0 max-w-full overflow-x-auto rounded-lg border border-gray-200'
                  }
                >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center">
                        PART REF
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center">
                        MATERIAL
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      <div className="flex items-center">
                        THICKNESS
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      <div className="flex items-center">
                        GRADE
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      <div className="flex items-center">
                        REMARK
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]">
                      <div className="flex items-center">
                        QUANTITY
                        <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isEditing && editingParts.length > 0 ? (
                    editingParts.map((spec, index) => {
                      const availableMaterials = materialData.length > 0 
                        ? [...new Set(materialData.map(m => m.material))]
                        : ['Zintec', 'Mild Steel', 'Stainless Steel', 'Aluminum'];
                      
                      // Get filtered options based on current selections
                      const selectedMaterial = spec.material;
                      const selectedThickness = spec.thickness;
                      const filteredThicknesses = getThicknessesForMaterial(selectedMaterial);
                      const filteredGrades = getGradesForMaterialAndThickness(selectedMaterial, selectedThickness);
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                            <div className="flex min-w-0 max-w-[18rem] items-center sm:max-w-[22rem]">
                              <svg className="mr-2 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span
                                title={spec.partRef || spec.fileName || 'N/A'}
                                className="min-w-0 flex-1 cursor-help truncate"
                              >
                                {spec.partRef || spec.fileName || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={spec.material || ''}
                              onChange={(e) => handlePartFieldChange(index, 'material', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                              required
                            >
                              <option value="">Select Material</option>
                              {availableMaterials.map(mat => (
                                <option key={mat} value={mat}>{mat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={spec.thickness || ''}
                              onChange={(e) => handlePartFieldChange(index, 'thickness', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                              required
                              disabled={!selectedMaterial}
                            >
                              {filteredThicknesses.map(thick => (
                                <option key={thick} value={thick}>{thick} mm</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={spec.grade || ''}
                              onChange={(e) => handlePartFieldChange(index, 'grade', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                              disabled={!selectedMaterial || !selectedThickness}
                            >
                              {filteredGrades.map(grade => (
                                <option key={grade} value={grade}>{grade}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={spec.remarks || spec.remark || ''}
                              onChange={(e) => handlePartFieldChange(index, 'remarks', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                              placeholder="Remarks"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              min="1"
                              value={spec.quantity || 1}
                              onChange={(e) => handlePartFieldChange(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                              required
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : inquiry.specifications && inquiry.specifications.length > 0 ? (
                    inquiry.specifications.map((spec, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                          <div className="flex min-w-0 max-w-[18rem] items-center sm:max-w-[22rem]">
                            <svg className="mr-2 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span
                              title={spec.partRef || spec.fileName || 'N/A'}
                              className="min-w-0 flex-1 cursor-help truncate"
                            >
                              {spec.partRef || spec.fileName || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 font-medium">{spec.material || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{spec.thickness || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{spec.grade || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{spec.remarks || spec.remark || 'No remarks'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{spec.quantity || 'N/A'}</td>
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

              {/* Special Instructions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-4">
                  {inquiry.timeline.map((event, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          event.color === 'green' ? 'bg-green-500' : 
                          event.color === 'blue' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{event.event}</p>
                        {event.description && (
                          <p className="text-xs text-gray-600">{event.description}</p>
                        )}
                        <p className="text-xs text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))}
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
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-900">{inquiry.deliveryAddress.street}</span>
                  </div>
                  <p className="text-sm text-gray-700 ml-8">{inquiry.deliveryAddress.city}</p>
                  <p className="text-sm text-gray-700 ml-8">{inquiry.deliveryAddress.country}</p>
                </div>
              </div>

              {/* Timeline */}
              
            </div>
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
    </div>
  );
};

export default InquiryDetail;
