import React, { createContext, useContext, useState, useEffect } from 'react';

const QuotationContext = createContext();

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};

export const QuotationProvider = ({ children }) => {
  // Store Cloudinary URLs by quotation ID: { quotationId: { url, filename, timestamp } }
  const [cloudinaryUrls, setCloudinaryUrls] = useState(() => {
    // Load from localStorage on initialization
    try {
      const stored = localStorage.getItem('quotation_cloudinary_urls');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading Cloudinary URLs from localStorage:', error);
      return {};
    }
  });

  // Persist to localStorage whenever cloudinaryUrls changes
  useEffect(() => {
    try {
      localStorage.setItem('quotation_cloudinary_urls', JSON.stringify(cloudinaryUrls));
    } catch (error) {
      console.error('Error saving Cloudinary URLs to localStorage:', error);
    }
  }, [cloudinaryUrls]);

  // Save Cloudinary URL for a quotation
  const saveCloudinaryUrl = (quotationId, cloudinaryUrl, filename = null) => {
    if (!quotationId || !cloudinaryUrl) {
      console.warn('Cannot save Cloudinary URL: missing quotationId or cloudinaryUrl');
      return;
    }

    setCloudinaryUrls(prev => ({
      ...prev,
      [quotationId]: {
        url: cloudinaryUrl,
        filename: filename || `quotation_${quotationId}.pdf`,
        timestamp: new Date().toISOString()
      }
    }));

    console.log('✅ Cloudinary URL saved to context:', {
      quotationId,
      cloudinaryUrl,
      filename
    });
  };

  // Save Cloudinary URL from upload response
  const saveFromUploadResponse = (response) => {
    if (!response?.data?.success) {
      console.warn('Invalid upload response:', response);
      return;
    }

    const quotation = response.data.quotation;
    const quotationId = quotation?._id || quotation?.id;
    
    // Try multiple sources for Cloudinary URL
    const cloudinaryUrl = 
      response.data.cloudinaryUrl || 
      quotation?.quotationPdfCloudinaryUrl || 
      (quotation?.quotationPdf && quotation.quotationPdf.startsWith('http') ? quotation.quotationPdf : null);

    if (quotationId && cloudinaryUrl) {
      saveCloudinaryUrl(
        quotationId,
        cloudinaryUrl,
        quotation?.quotationPdfFilename || `quotation_${quotation.quotationNumber || quotationId}.pdf`
      );
    } else {
      console.warn('Missing quotationId or Cloudinary URL in response:', {
        quotationId,
        cloudinaryUrl,
        response: response.data
      });
    }
  };

  // Get Cloudinary URL for a quotation
  const getCloudinaryUrl = (quotationId) => {
    return cloudinaryUrls[quotationId]?.url || null;
  };

  // Get full Cloudinary data for a quotation
  const getCloudinaryData = (quotationId) => {
    return cloudinaryUrls[quotationId] || null;
  };

  // Clear Cloudinary URL for a quotation
  const clearCloudinaryUrl = (quotationId) => {
    setCloudinaryUrls(prev => {
      const updated = { ...prev };
      delete updated[quotationId];
      return updated;
    });
  };

  // Clear all Cloudinary URLs
  const clearAllCloudinaryUrls = () => {
    setCloudinaryUrls({});
    localStorage.removeItem('quotation_cloudinary_urls');
  };

  const value = {
    cloudinaryUrls,
    saveCloudinaryUrl,
    saveFromUploadResponse,
    getCloudinaryUrl,
    getCloudinaryData,
    clearCloudinaryUrl,
    clearAllCloudinaryUrls
  };

  return (
    <QuotationContext.Provider value={value}>
      {children}
    </QuotationContext.Provider>
  );
};

