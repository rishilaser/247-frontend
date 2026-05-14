import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        toast.error(`File size exceeds 5MB limit. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
        // Reset file input
        e.target.value = '';
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setPdfUrl(''); // Reset previous URL
    }
  };

  const uploadPdf = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await axios.post(`${baseURL}/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
        timeout: 300000, // 5 minutes timeout
      });

      if (response.data.success) {
        setPdfUrl(response.data.url);
        toast.success('PDF uploaded successfully!');
      } else {
        toast.error(response.data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response) {
        toast.error(error.response.data.error || 'Upload failed');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An error occurred during upload');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPdfUrl('');
    setUploadProgress(0);
    // Reset file input
    const fileInput = document.getElementById('pdf-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Upload PDF to Cloudinary
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Maximum file size: <span className="font-semibold">5MB</span>
          </p>

          <div className="space-y-6">
            {/* File Input Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
              <input
                id="pdf-file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="pdf-file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-16 h-16 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-lg font-medium text-gray-700 mb-2">
                  {file ? file.name : 'Click to select PDF file'}
                </span>
                <span className="text-sm text-gray-500">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF files only (Max 5MB)'}
                </span>
                {file && file.size > 5 * 1024 * 1024 && (
                  <span className="text-sm text-red-600 font-semibold mt-1">
                    ⚠️ File exceeds 5MB limit!
                  </span>
                )}
              </label>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={uploadPdf}
                disabled={!file || uploading || (file && file.size > 5 * 1024 * 1024)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  !file || uploading || (file && file.size > 5 * 1024 * 1024)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload PDF'}
              </button>

              {(file || pdfUrl) && !uploading && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Success Message and PDF URL */}
            {pdfUrl && (
              <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  ✅ PDF Uploaded Successfully!
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PDF URL:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pdfUrl}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pdfUrl);
                          toast.success('URL copied to clipboard!');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Open PDF in New Tab
                    </a>
                  </div>

                  {/* PDF Preview */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">
                      PDF Preview:
                    </h4>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <iframe
                        src={pdfUrl}
                        width="100%"
                        height="600px"
                        className="border-0"
                        title="PDF Preview"
                      ></iframe>
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

export default Upload;

