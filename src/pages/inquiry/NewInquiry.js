import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { inquiryAPI, handleApiError, handleApiSuccess } from '../../services/api';
import toast from 'react-hot-toast';
import PDFFileTable from '../../components/PDFFileTable';
import UserInfoDisplay from '../../components/UserInfoDisplay';
import axios from 'axios';

// Remove /api from end of URL if present to avoid double /api/api
const getBaseURL = () => {
  const url = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  return url.replace(/\/api$/, '');
};

const API_URL = getBaseURL();

const NewInquiry = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    material: '',
    thickness: '',
    grade: '',
    remark: '',
    files: []
  });
  const [pdfFiles, setPdfFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [materialData, setMaterialData] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Define fetchMaterialData before useEffect to avoid hoisting issues
  const fetchMaterialData = useCallback(async () => {
    try {
      // Set timeout for materials API (5 seconds)
      const response = await axios.get(`${API_URL}/api/admin/materials`, {
        timeout: 5000
      });
      
      if (response.data.success && response.data.materialData) {
        const activeMaterials = response.data.materialData.filter(m => m.status === 'Active');
        
        if (activeMaterials.length > 0) {
          setMaterialData(activeMaterials);
        } else {
          // Don't show error if no active materials - just set empty array
          setMaterialData([]);
          // Only show warning in development
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ No active materials found');
          }
        }
      } else {
        setMaterialData([]);
        // Don't show error - just set empty array
      }
    } catch (error) {
      // Only log in development, don't show error to user
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching material data:', error);
      }
      // Set empty array silently - form will still work with default values
      setMaterialData([]);
      // Don't show error toast - it's not critical for form functionality
    }
  }, [API_URL]);

  // Fetch material data from admin on component mount
  useEffect(() => {
    fetchMaterialData();
  }, [fetchMaterialData]);

  // Auto-refresh material data when page becomes visible (user switches back to tab/window)
  useEffect(() => {
    let timeoutId;
    let isRefreshing = false;

    const handleVisibilityChange = () => {
      if (!document.hidden && !isRefreshing) {
        isRefreshing = true;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          fetchMaterialData();
          isRefreshing = false;
        }, 500);
      }
    };

    const handleFocus = () => {
      if (!isRefreshing) {
        isRefreshing = true;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          fetchMaterialData();
          isRefreshing = false;
        }, 500);
      }
    };

    // Listen for storage events (when material data is updated in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'materialDataUpdated') {
        fetchMaterialData();
      }
    };

    // Listen for custom events (when material data is updated in same tab)
    const handleMaterialDataUpdate = () => {
      fetchMaterialData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('materialDataUpdated', handleMaterialDataUpdate);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('materialDataUpdated', handleMaterialDataUpdate);
    };
  }, [fetchMaterialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      
      const validFiles = files.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        const isValidType = ['dwg', 'dxf', 'zip', 'pdf', 'xlsx', 'xls'].includes(extension);
        
        // Validate ALL file types - 5MB limit for all files
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds 5MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
          return false;
        }
        
        return isValidType;
      });
      
      if (validFiles.length !== files.length) {
        const invalidCount = files.length - validFiles.length;
        if (invalidCount > 0) {
          toast.error(`${invalidCount} file(s) rejected. Only files up to 5MB are allowed (DWG, DXF, ZIP, PDF, XLSX, XLS)`);
        }
      }
      
      if (validFiles.length === 0) {
        toast.error('No valid files dropped');
        return;
      }
      
      // Check total file limit (100 files)
      const MAX_FILES = 100;
      const currentFileCount = pdfFiles.length;
      const newFileCount = validFiles.length;
      const totalFiles = currentFileCount + newFileCount;
      
      if (totalFiles > MAX_FILES) {
        const allowedFiles = MAX_FILES - currentFileCount;
        if (allowedFiles <= 0) {
          toast.error(`Maximum ${MAX_FILES} files allowed. You already have ${currentFileCount} files.`);
          return;
        }
        toast.error(`Maximum ${MAX_FILES} files allowed. You can add ${allowedFiles} more file(s). Currently have ${currentFileCount} files.`);
        // Only process allowed files - keep first N files
        const filesToProcess = validFiles.slice(0, allowedFiles);
        validFiles.length = 0;
        validFiles.push(...filesToProcess);
      }
      // Process ALL files for the table - use admin's material data
      if (materialData.length === 0) {
        toast.error('⚠️ No materials available! Please ask admin to add materials first.');
        return;
      }
      
      const defaultMaterial = materialData[0];
      
      const processedFiles = validFiles.map((file, index) => ({
        id: `file_${Date.now()}_${index}`,
        name: file.name,
        partRef: file.name,
        material: defaultMaterial.material,
        thickness: defaultMaterial.thickness,
        grade: defaultMaterial.grade || '',
        remarks: '', // Empty by default - user must fill
        quantity: 1,
        createdAt: new Date().toISOString(),
        file: file,
        fileType: file.name.split('.').pop().toLowerCase()
      }));
      
      setPdfFiles(prev => {
        const newFiles = [...prev, ...processedFiles];
        // Move toast outside setState to avoid render phase update
        setTimeout(() => {
          toast.success(`${validFiles.length} file(s) uploaded successfully`);
        }, 0);
        return newFiles;
      });
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      const isValidType = ['dwg', 'dxf', 'zip', 'pdf', 'xlsx', 'xls'].includes(extension);
      
      // Validate ALL file types - 5MB limit for all files
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 5MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return false;
      }
      
      return isValidType;
    });
    
    if (validFiles.length !== files.length) {
      const invalidCount = files.length - validFiles.length;
      if (invalidCount > 0) {
        toast.error(`${invalidCount} file(s) rejected. Only files up to 5MB are allowed (DWG, DXF, ZIP, PDF, XLSX, XLS)`);
      }
    }
    
    if (validFiles.length === 0) {
      toast.error('No valid files selected');
      return;
    }
    
    // Check total file limit (100 files)
    const MAX_FILES = 100;
    const currentFileCount = pdfFiles.length;
    const newFileCount = validFiles.length;
    const totalFiles = currentFileCount + newFileCount;
    
    if (totalFiles > MAX_FILES) {
      const allowedFiles = MAX_FILES - currentFileCount;
      if (allowedFiles <= 0) {
        toast.error(`Maximum ${MAX_FILES} files allowed. You already have ${currentFileCount} files.`);
        return;
      }
      toast.error(`Maximum ${MAX_FILES} files allowed. You can add ${allowedFiles} more file(s). Currently have ${currentFileCount} files.`);
      // Only process allowed files - keep first N files
      const filesToProcess = validFiles.slice(0, allowedFiles);
      validFiles.length = 0;
      validFiles.push(...filesToProcess);
    }
    
    // Process ALL files for the table (not just PDFs) - use admin's material data
    if (materialData.length === 0) {
      toast.error('⚠️ No materials available! Please ask admin to add materials first.');
      return;
    }
    
    const defaultMaterial = materialData[0];
    
    const processedFiles = validFiles.map((file, index) => ({
      id: `file_${Date.now()}_${index}`,
      name: file.name,
      partRef: file.name,
      material: defaultMaterial.material,
      thickness: defaultMaterial.thickness,
      grade: defaultMaterial.grade || '',
      remarks: '', // Empty by default - user must fill
      quantity: 1,
      createdAt: new Date().toISOString(),
      file: file,
      fileType: file.name.split('.').pop().toLowerCase()
    }));
    
    setPdfFiles(prev => {
      const newFiles = [...prev, ...processedFiles];
      // Move toast outside setState to avoid render phase update
      setTimeout(() => {
        toast.success(`${validFiles.length} file(s) uploaded successfully`);
      }, 0);
      return newFiles;
    });
  };

  const removeFile = (index) => {
    setFormData({
      ...formData,
      files: formData.files.filter((_, i) => i !== index)
    });
  };

  const handleUpdatePdfFile = (fileId, updatedData) => {
    setPdfFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, ...updatedData, updatedAt: new Date().toISOString() }
          : file
      )
    );
    toast.success('File updated successfully');
  };

  const handleDeletePdfFile = (fileId) => {
    setPdfFiles(prev => prev.filter(file => file.id !== fileId));
    toast.success('File deleted successfully');
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const MAX_FILES = 100;
    
    if (pdfFiles.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }
    
    if (pdfFiles.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed. You have ${pdfFiles.length} files. Please remove ${pdfFiles.length - MAX_FILES} file(s).`);
      return;
    }
    
    // Validate that all files have remarks and quantity
    const filesWithoutRemarks = pdfFiles.filter(file => !file.remarks || file.remarks.trim() === '');
    const filesWithoutQuantity = pdfFiles.filter(file => !file.quantity || file.quantity < 1);
    
    if (filesWithoutRemarks.length > 0) {
      toast.error(`Please add remarks for all files. ${filesWithoutRemarks.length} file(s) missing remarks.`);
      return;
    }
    
    if (filesWithoutQuantity.length > 0) {
      toast.error(`Please add valid quantity for all files. ${filesWithoutQuantity.length} file(s) have invalid quantity.`);
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);

    try {
      // Use files from the table for submission
      const allFiles = pdfFiles.map(file => file.file);
      const submissionData = {
        ...formData,
        files: allFiles,
        fileMetadata: pdfFiles // Include file metadata separately
      };
      
      const result = await inquiryAPI.createInquiry(submissionData, (progress) => {
        setUploadProgress(progress);
      });
      const response = handleApiSuccess(result);
      
      toast.success(response.message || 'Inquiry submitted successfully!');
      
      // Trigger refresh event for InquiryList and Dashboard
      window.dispatchEvent(new CustomEvent('inquiryCreated'));
      window.dispatchEvent(new CustomEvent('dataRefresh', { detail: { type: 'inquiry' } }));
      
      // Use replace for faster redirect (no history entry)
      navigate('/inquiries', { replace: true });
    } catch (error) {
      const errorResponse = handleApiError(error);
      toast.error(errorResponse.error || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [pdfFiles, formData, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header is provided by Layout component (InternalHeader) */}
      
      <div className="py-4">
        <div className="flex gap-4">
          {/* Left Sidebar - Hidden */}
          {/* <div className="w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 sticky top-4">
            <div className="space-y-3">
            </div>
          </div> */}

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 pr-6 sm:pr-8 lg:pr-10 xl:pr-16 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              {/* File Upload Section - Full Width */}
              <div className="bg-white rounded-lg shadow p-2">
                <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-8 text-center min-h-[300px] flex flex-col justify-center">
                  <div
                    className={`flex flex-col items-center justify-center h-full ${dragActive ? 'bg-green-100' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="text-6xl mb-1 text-green-400"></div>
                    <p className="text-xl font-medium text-gray-700 mb-1">
                      Drag files to upload or
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Maximum file size: <span className="text-green-600">5MB</span> (all file types)
                    </p>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Maximum files: <span className="text-green-600">100</span> files per inquiry (optional)
                    </p>
                    <label className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors duration-200 shadow-lg cursor-pointer">
                    Upload Drawing
                      <input
                        type="file"
                        multiple
                        accept=".dwg,.dxf,.zip,.pdf,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-4">
                      Allowed extensions: dwg, dxf, zip, pdf, xlsx, xls (max 5MB each)
                    </p>
                    {pdfFiles.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2 font-medium">
                        Files uploaded: <span className={pdfFiles.length >= 100 ? 'text-green-600' : 'text-gray-600'}>{pdfFiles.length}/100</span>
                      </p>
                    )}
                  </div>
                </div>
                
              </div>
            </div>

            {/* PDF Files Table - Full Width - Always reserve space */}
            <div className="mt-4 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              {pdfFiles.length > 0 ? (
                <PDFFileTable 
                  files={pdfFiles}
                  onUpdateFile={handleUpdatePdfFile}
                  onDeleteFile={handleDeletePdfFile}
                  showCreatedColumn={false}
                  materialData={materialData}
                />
              ) : null}
            </div>

            {/* User Information Display - After PDF Files Table */}
            <div className="mt-4 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              <UserInfoDisplay />
            </div>

            {/* Material and Thickness Input */}
            <div className="mt-8 bg-white rounded-lg shadow p-3 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Material, Thickness, Grade, Required Quantity, for each file. With Remark.
                  </label>
                  <textarea
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter material specifications, thickness, grade, quantity, and any remarks for each file..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex flex-col items-end gap-2">
                  {loading && uploadProgress > 0 && (
                    <div className="w-64 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading || pdfFiles.length === 0 || pdfFiles.length > 100}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Submitting...') : 'Submit Inquiry'}
                  </button>
                  {pdfFiles.length > 100 && (
                    <p className="text-sm text-red-600 mt-1">
                      Maximum 100 files allowed. Please remove {pdfFiles.length - 100} file(s).
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Information Panels - Moved to bottom after Submit Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mr-6 sm:mr-8 lg:mr-10 xl:mr-16">
              {/* Available Manufacturing Processes */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Available Manufacturing Processes
                </h3>
                <div className="space-y-2">
                  {[
                    'Laser Cutting',
                    'CNC Bending',
                    'CNC Turning',
                    'Laser Engraving',
                    'Chamfer',
                    'Threading',
                    'Surface Finishing'
                  ].map((process) => (
                    <div key={process} className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-sm text-gray-700">{process}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Policy */}
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Content Policy Agreement
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  By uploading your file, you agree and acknowledge and ratify the technical drawings are respecting K.
                </p>
                <div className="space-y-2">
                  {[
                    'Illegal, false or offensive parts',
                    'Weapons or military parts',
                    'Export controlled parts',
                    'Intellectual property infringement'
                  ].map((item) => (
                    <div key={item} className="flex items-center text-sm text-red-600">
                      <span className="mr-2">✗</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewInquiry;
