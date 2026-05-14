import React, { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Simple PDF Viewer Component for Hostinger VPS
 * Uses iframe for PDF viewing (works without extra dependencies)
 * 
 * Usage:
 * <PDFViewerSimple 
 *   pdfUrl="/api/quotation/123/pdf" 
 *   token={userToken}
 *   filename="quotation.pdf"
 * />
 */
const PDFViewerSimple = ({ pdfUrl, token, filename = 'quotation.pdf' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create authenticated URL with token
  const authenticatedUrl = token 
    ? `${pdfUrl}${pdfUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
    : pdfUrl;

  const handleDownload = async () => {
    try {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const downloadUrl = `${apiBaseUrl}${pdfUrl.replace('/api', '')}${pdfUrl.includes('?') ? '&' : '?'}download=true`;
      
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Controls */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{filename}</h3>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="w-full" style={{ height: '80vh', minHeight: '600px' }}>
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download PDF Instead
            </button>
          </div>
        ) : (
          <iframe
            src={authenticatedUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('Failed to load PDF');
              setLoading(false);
            }}
          >
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              </div>
            )}
            <p className="text-center text-gray-600 mt-4">
              Your browser does not support PDF viewing. 
              <button onClick={handleDownload} className="text-blue-600 hover:underline ml-1">
                Download PDF
              </button>
            </p>
          </iframe>
        )}
      </div>
    </div>
  );
};

export default PDFViewerSimple;



