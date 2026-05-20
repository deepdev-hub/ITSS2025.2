import axios from 'axios';

export const STORAGE_KEY = 'vbas.auth';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_ORIGIN = /^https?:\/\//i.test(API_BASE_URL)
  ? API_BASE_URL
  : (import.meta.env.DEV ? 'http://127.0.0.1:8080' : window.location.origin);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const { token } = JSON.parse(saved);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function unwrap(promise) {
  const response = await promise;
  return response.data.data;
}

export function getApiError(error) {
  return (
    error?.response?.data?.message
    || error?.response?.data?.error
    || error?.response?.data?.data
    || error?.message
    || 'Unexpected error'
  );
}
