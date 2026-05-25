/** Draft quotations are internal until admin sends them to the customer. */

export function isQuotationVisibleToCustomer(status) {
  const s = String(status || '').trim().toLowerCase();
  return Boolean(s) && s !== 'draft';
}

export function customerCanSeeQuotation(quotation, isAdmin) {
  if (isAdmin) return Boolean(quotation);
  return Boolean(quotation && isQuotationVisibleToCustomer(quotation.status));
}

/** Admin can publish draft quotation to customer (not only email). */
export function canSendQuotationToCustomer(status) {
  const s = String(status || '').trim().toLowerCase();
  return s === 'draft' || s === 'uploaded' || s === 'created';
}
