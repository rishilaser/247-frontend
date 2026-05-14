import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import toast from 'react-hot-toast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ pdfUrl, token, filename = 'quotation.pdf' }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try downloading instead.');
    setLoading(false);
    toast.error('Failed to load PDF');
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(pdfUrl, {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-red-200">
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
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* PDF Viewer Controls */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
              disabled={scale <= 0.5}
            >
              −
            </button>
            <span className="text-sm text-gray-700 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(prev => Math.min(2.0, prev + 0.25))}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
              disabled={scale >= 2.0}
            >
              +
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Download
          </button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex justify-center bg-gray-200 p-4 overflow-auto" style={{ minHeight: '600px' }}>
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
          <Document
            file={{
              url: pdfUrl,
              httpHeaders: {
                'Authorization': `Bearer ${token}`
              }
            }}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
            error={
              <div className="p-8 text-center text-red-600">
                Failed to load PDF. Please try downloading instead.
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="border border-gray-300"
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;



