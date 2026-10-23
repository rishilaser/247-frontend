// File types customers may attach to an inquiry.
// Keep in sync with the backend list in utils/inquiryFileTypes.js (the server enforces it).
export const INQUIRY_FILE_EXTENSIONS = {
  drawings: ['pdf', 'dwg', 'dxf', 'dwf', 'dgn'],
  cad: ['step', 'stp', 'igs', 'iges', 'stl', 'sat', 'x_t', 'x_b', 'sldprt', 'sldasm', 'slddrw',
    'ipt', 'iam', 'idw', 'prt', 'asm', 'catpart', 'catproduct', '3dm', 'obj', 'ifc', 'skp'],
  documents: ['xlsx', 'xls', 'csv', 'doc', 'docx', 'txt', 'rtf'],
  archives: ['zip', 'rar', '7z'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'svg', 'heic', 'heif']
};

const ALLOWED = new Set(Object.values(INQUIRY_FILE_EXTENSIONS).flat());

export const INQUIRY_ACCEPT_ATTR = [...ALLOWED].map((ext) => `.${ext}`).join(',');

export const isAllowedInquiryFile = (fileName = '') => {
  const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
  return ALLOWED.has(ext);
};
