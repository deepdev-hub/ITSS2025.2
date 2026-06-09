import { API_BASE_URL, API_ORIGIN } from '../api/client';

function getAssetBaseUrl() {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }
  if (import.meta.env.DEV) {
    return window.location.origin;
  }
  return API_ORIGIN || window.location.origin;
}

export function getRequestImageUrl(request) {
  if (!request || typeof request !== 'object') return '';
  return request.imageUrl || '';
}

export function normalizeRequestImageUrl(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export function resolveRequestImageUrl(value) {
  const raw = normalizeRequestImageUrl(value);
  if (!raw) return null;

  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('blob:') || raw.startsWith('data:')) {
    return raw;
  }

  try {
    return new URL(raw, getAssetBaseUrl()).toString();
  } catch {
    return null;
  }
}

export function addRequestImageCacheKey(url, cacheKey) {
  if (!url || !cacheKey || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set('v', String(cacheKey));
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

export function getRequestImageUrlFromUploadResponse(response) {
  if (!response) return '';
  if (typeof response === 'string') return normalizeRequestImageUrl(response);
  if (typeof response !== 'object') return '';

  return normalizeRequestImageUrl(
    response.url
      || response.imageUrl
      || response.image_url
      || response.fileUrl
      || response.path
      || '',
  );
}