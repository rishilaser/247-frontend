/**
 * Parse Content-Disposition from fetch (requires CORS expose header).
 */
export function parseContentDisposition(header) {
  if (!header || typeof header !== 'string') return null;

  const utf8 = /filename\*=UTF-8''([^;\n]+)/i.exec(header);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return utf8[1].trim();
    }
  }

  const quoted = /filename="([^"]+)"/i.exec(header);
  if (quoted) return quoted[1];

  const unquoted = /filename=([^;\s]+)/i.exec(header);
  if (unquoted) return unquoted[1].replace(/^["']|["']$/g, '');

  return null;
}

/** Fix Windows/Chrome saving as ".zip_" instead of ".zip". */
export function normalizeZipDownloadFilename(name, fallback = 'files.zip') {
  let n = String(name || fallback).trim() || fallback;
  n = n.replace(/\.zip_+$/i, '.zip');
  if (!/\.zip$/i.test(n)) {
    const base = n.replace(/\.[^.]+$/, '').replace(/_+$/, '');
    n = `${base || 'files'}.zip`;
  }
  return n;
}
