import { API_ORIGIN } from '../api/client';

export function getAvatarUrl(user) {
  if (!user || typeof user !== 'object') return '';
  return user.avatarUrl || user.avatar_url || '';
}

export function normalizeAvatarUrl(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export function normalizeUser(user) {
  if (!user || typeof user !== 'object') return user || null;

  const normalized = {
    ...user,
    avatarUrl: normalizeAvatarUrl(getAvatarUrl(user)),
  };

  delete normalized.avatar_url;
  return normalized;
}

export function resolveAvatarUrl(value) {
  const rawAvatar = normalizeAvatarUrl(value);
  if (!rawAvatar) return null;

  if (/^(https?:)?\/\//i.test(rawAvatar) || rawAvatar.startsWith('blob:') || rawAvatar.startsWith('data:')) {
    return rawAvatar;
  }

  try {
    return new URL(rawAvatar, API_ORIGIN || window.location.origin).toString();
  } catch {
    return null;
  }
}

export function addAvatarCacheKey(url, cacheKey) {
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

export function getAvatarUrlFromUploadResponse(response) {
  if (!response) return '';
  if (typeof response === 'string') return normalizeAvatarUrl(response);
  if (typeof response !== 'object') return '';

  return normalizeAvatarUrl(
    response.url
      || response.avatarUrl
      || response.avatar_url
      || response.fileUrl
      || response.path
      || '',
  );
}
