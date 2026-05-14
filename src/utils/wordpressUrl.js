/**
 * WordPress marketing site URL (full-page redirect after sign out).
 * CRA inlines REACT_APP_* at build time; WORDPRESS_URL only works if tooling exposes it.
 */
export const DEFAULT_WORDPRESS_URL = 'https://247cutbend.in/';

export const getWordpressUrl = () => {
  const raw = process.env.REACT_APP_WORDPRESS_URL || process.env.WORDPRESS_URL;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed || DEFAULT_WORDPRESS_URL;
};
