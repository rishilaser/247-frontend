import React, { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Cloudinary PDF Viewer Component
 * Uses Cloudinary iframe for direct PDF viewing from Cloudinary
 * 
 * Usage:
 * <CloudinaryPDFViewer 
 *   cloudinaryUrl="https://res.cloudinary.com/..."
 *   filename="quotation.pdf"
 *   onClose={() => setShowViewer(false)}
 * />
 */
const CloudinaryPDFViewer = ({ cloudinaryUrl, filename = 'quotation.pdf', onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cloudinary PDF viewer URL - use direct URL for iframe viewing
  // Cloudinary PDFs can be viewed directly in iframes
  // For download, we'll use fl_attachment parameter separately
  const viewerUrl = cloudinaryUrl;

  const handleDownload = () => {
    if (!cloudinaryUrl) {
      toast.error('PDF URL not available');
      return;
    }

    try {
      let downloadUrl = cloudinaryUrl;
      
      // For Cloudinary URLs, add fl_attachment parameter to force download
      // For blob URLs, use them directly
      if (cloudinaryUrl.startsWith('http') && !cloudinaryUrl.startsWith('blob:')) {
        downloadUrl = cloudinaryUrl.includes('?') 
          ? `${cloudinaryUrl}&fl_attachment` 
          : `${cloudinaryUrl}?fl_attachment`;
      }
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (!cloudinaryUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Not Available</h3>
            <p className="text-gray-600 text-center mb-4">PDF URL is not available for this quotation.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">{filename}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              title="Download PDF"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 relative bg-gray-50">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF from Cloudinary...</p>
              </div>
            </div>
          )}
          
          {error ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
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
              src={viewerUrl}
              className="w-full h-full border-0"
              title="PDF Viewer"
              onLoad={() => {
                setLoading(false);
                // Check if PDF loaded successfully
                setTimeout(() => {
                  try {
                    const iframe = document.querySelector('iframe[title="PDF Viewer"]');
                    if (iframe && iframe.contentWindow) {
                      // PDF should load in iframe
                      console.log('PDF iframe loaded');
                    }
                  } catch (e) {
                    // Cross-origin restrictions - this is normal
                    console.log('PDF loaded (cross-origin check skipped)');
                  }
                }, 1000);
              }}
              onError={() => {
                setError('Failed to load PDF. Please try downloading instead.');
                setLoading(false);
              }}
              style={{ minHeight: '600px' }}
            >
              <div className="flex flex-col items-center justify-center h-full p-8">
                <p className="text-gray-600 mb-4">Your browser does not support PDF viewing in iframe.</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
              </div>
            </iframe>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudinaryPDFViewer;

