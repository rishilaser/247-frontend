/** Open quotation PDF popup on inquiry detail (not full /quotation page). */
export const inquiryQuotationPdfPath = (inquiryId) => {
  if (inquiryId == null) return null;
  const id =
    typeof inquiryId === 'object'
      ? inquiryId._id || inquiryId.id
      : inquiryId;
  if (!id || id === 'undefined' || id === 'null') return null;
  return `/inquiry/${id}?quotationPdf=1`;
};

export const resolveInquiryIdFromQuotation = (quotation) => {
  if (!quotation) return null;
  let inquiryId = quotation.inquiryId;
  if (!inquiryId && quotation.inquiry) {
    inquiryId = quotation.inquiry._id || quotation.inquiry.id;
  }
  if (inquiryId && typeof inquiryId === 'object') {
    inquiryId = inquiryId._id || inquiryId.id;
  }
  return inquiryId || null;
};

/** Prefer inquiry + PDF popup; fall back to /quotation/:id (redirects). */
export const quotationViewPath = (quotation) => {
  const inquiryId = resolveInquiryIdFromQuotation(quotation);
  const fromInquiry = inquiryQuotationPdfPath(inquiryId);
  if (fromInquiry) return fromInquiry;
  const qid = quotation?._id || quotation?.id;
  if (!qid || qid === 'undefined' || qid === 'null') return null;
  return `/quotation/${qid}`;
};
