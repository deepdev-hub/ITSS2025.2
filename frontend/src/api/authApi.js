import { apiClient, unwrap } from './client';

export const authApi = {
  register: (payload) => unwrap(apiClient.post('/api/auth/register', payload)),
  login: (payload) => unwrap(apiClient.post('/api/auth/login', payload)),
  me: () => unwrap(apiClient.get('/api/auth/me')),
  updateProfile: (payload) => unwrap(apiClient.put('/api/auth/profile', payload)),
  changePassword: (payload) => unwrap(apiClient.put('/api/auth/change-password', payload)),
  getIncidentTypes: () => unwrap(apiClient.get('/api/auth/lookups/incident-types')),
  getServiceTypes: () => unwrap(apiClient.get('/api/auth/lookups/service-types')),
};
