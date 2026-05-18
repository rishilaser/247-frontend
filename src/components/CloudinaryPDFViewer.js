import React, { useState } from 'react';
import toast from 'react-hot-toast';
import QuotationPdfOverlay from './QuotationPdfOverlay';

const CloudinaryPDFViewer = ({ cloudinaryUrl, filename = 'quotation.pdf', onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDownload = () => {
    if (!cloudinaryUrl) {
      toast.error('PDF URL not available');
      return;
    }

    try {
      let downloadUrl = cloudinaryUrl;

      if (cloudinaryUrl.startsWith('http') && !cloudinaryUrl.startsWith('blob:')) {
        downloadUrl = cloudinaryUrl.includes('?')
          ? `${cloudinaryUrl}&fl_attachment`
          : `${cloudinaryUrl}?fl_attachment`;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF download started');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download PDF');
    }
  };

  if (!cloudinaryUrl) {
    return (
      <QuotationPdfOverlay title="PDF not available" onClose={onClose}>
        <div className="flex h-full flex-col items-center justify-center p-8">
          <svg className="mb-4 h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-center text-gray-600">PDF URL is not available for this quotation.</p>
        </div>
      </QuotationPdfOverlay>
    );
  }

  const downloadButton = (
    <button
      type="button"
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      title="Download PDF"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span className="hidden sm:inline">Download</span>
    </button>
  );

  return (
    <QuotationPdfOverlay title={filename} onClose={onClose} actions={downloadButton}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-gray-600">Loading PDF...</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="flex h-full flex-col items-center justify-center p-8">
          <p className="mb-4 font-medium text-red-600">{error}</p>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Download PDF instead
          </button>
        </div>
      ) : (
        <iframe
          src={cloudinaryUrl}
          className="h-full w-full border-0"
          title={filename}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Failed to load PDF. Please try downloading instead.');
            setLoading(false);
          }}
        />
      )}
    </QuotationPdfOverlay>
  );
};

export default CloudinaryPDFViewer;
