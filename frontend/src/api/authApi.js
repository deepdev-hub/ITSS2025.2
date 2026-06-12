import { apiClient, unwrap } from './client';

const SESSION_CHECK_TIMEOUT_MS = 5000;

export const authApi = {
  register: (payload) => unwrap(apiClient.post('/api/auth/register', payload)),
  login: (payload) => unwrap(apiClient.post('/api/auth/login', payload)),
  me: () => unwrap(apiClient.get('/api/auth/me', { timeout: SESSION_CHECK_TIMEOUT_MS })),
  updateProfile: (payload) => unwrap(apiClient.put('/api/auth/profile', payload)),
  changePassword: (payload) => unwrap(apiClient.put('/api/auth/change-password', payload)),
  forgotPassword: (email) => apiClient
    .post('/api/auth/forgot-password', null, { params: { email: email.trim() } })
    .then((response) => response.data),
  resetPassword: ({ token, newPassword }) => apiClient
    .post('/api/auth/reset-password', null, {
      params: { token: token.trim(), newPassword },
    })
    .then((response) => response.data),
  getIncidentTypes: () => unwrap(apiClient.get('/api/auth/lookups/incident-types')),
  getServiceTypes: () => unwrap(apiClient.get('/api/auth/lookups/service-types')),
  uploadAvatar: (formData) => unwrap(apiClient.post('/api/auth/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })),
};
