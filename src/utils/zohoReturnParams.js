const STORAGE_KEY = 'zohoReturnPayload';

function firstParam(searchParams, keys) {
  for (const key of keys) {
    const v = searchParams.get(key);
    if (v != null && String(v).trim() !== '') return v;
  }
  return null;
}

function buildFromSearchParams(searchParams) {
  if (!searchParams) return null;

  const status = firstParam(searchParams, [
    'status',
    'payment_status',
    'payment_link_status',
    'link_status',
  ]);
  const paymentLinkId = firstParam(searchParams, [
    'payment_link_id',
    'paymentLinkId',
    'paymentlink_id',
  ]);

  if (!status && !paymentLinkId) return null;

  return {
    payment_link_id: paymentLinkId,
    payment_id: firstParam(searchParams, ['payment_id', 'paymentId']),
    amount: firstParam(searchParams, ['amount']),
    status,
    payment_link_reference:
      firstParam(searchParams, ['payment_link_reference', 'reference_id', 'orderId']) ||
      undefined,
    signature: firstParam(searchParams, ['signature']),
  };
}

function allSearchParamSources() {
  const sources = [new URLSearchParams(window.location.search)];
  const hash = window.location.hash || '';
  if (hash.includes('=')) {
    const hashQuery = hash.startsWith('#') ? hash.slice(1) : hash;
    const qs = hashQuery.includes('?') ? hashQuery.split('?')[1] : hashQuery;
    if (qs) sources.push(new URLSearchParams(qs));
  }
  return sources;
}

/** Call on app load / after Zoho redirect — keeps params if React strips URL before sync runs. */
export function captureZohoReturnFromUrl() {
  try {
    for (const sp of allSearchParamSources()) {
      const fromUrl = buildFromSearchParams(sp);
      if (fromUrl) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
        if (process.env.NODE_ENV === 'development') {
          console.info('[Zoho] Captured return params from URL', fromUrl);
        }
        return fromUrl;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getZohoReturnPayload(searchParams) {
  captureZohoReturnFromUrl();

  if (searchParams) {
    const fromReact = buildFromSearchParams(searchParams);
    if (fromReact) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromReact));
      } catch {
        /* ignore */
      }
      return fromReact;
    }
  }

  for (const sp of allSearchParamSources()) {
    const fromUrl = buildFromSearchParams(sp);
    if (fromUrl) return fromUrl;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function hasZohoReturnPayload(searchParams) {
  return Boolean(getZohoReturnPayload(searchParams));
}

export function clearZohoReturnPayload() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
