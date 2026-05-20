import { apiClient, unwrap } from './client';

export const companyApi = {
  getMyCompany: () => unwrap(apiClient.get('/api/companies/me')),
  updateMyCompany: (payload) => unwrap(apiClient.put('/api/companies/me', payload)),
  getRequests: () => unwrap(apiClient.get('/api/companies/requests')),
  getRequestDetail: (id) => unwrap(apiClient.get(`/api/companies/requests/${id}`)),
  createAssignment: (requestId, payload) => unwrap(apiClient.post(`/api/companies/requests/${requestId}/assignments`, payload)),
  createQuote: (requestId, payload) => unwrap(apiClient.post(`/api/companies/requests/${requestId}/quotes`, payload)),
  sendQuote: (quoteId) => unwrap(apiClient.put(`/api/companies/quotes/${quoteId}/send`)),
  getStaff: () => unwrap(apiClient.get('/api/companies/staff')),
  getStaffProfile: (id) => unwrap(apiClient.get(`/api/companies/staff/${id}/profile`)),
  createStaff: (payload) => unwrap(apiClient.post('/api/companies/staff', payload)),
  updateStaff: (id, payload) => unwrap(apiClient.put(`/api/companies/staff/${id}`, payload)),
  deleteStaff: (id) => unwrap(apiClient.delete(`/api/companies/staff/${id}`)),
  getVehicles: () => unwrap(apiClient.get('/api/companies/vehicles')),
  createVehicle: (payload) => unwrap(apiClient.post('/api/companies/vehicles', payload)),
  updateVehicle: (id, payload) => unwrap(apiClient.put(`/api/companies/vehicles/${id}`, payload)),
  deleteVehicle: (id) => unwrap(apiClient.delete(`/api/companies/vehicles/${id}`)),
  getReviews: () => unwrap(apiClient.get('/api/companies/reviews')),
  getDashboard: () => unwrap(apiClient.get('/api/companies/dashboard')),
  getStaffDashboard: () => unwrap(apiClient.get('/api/companies/staff/me/dashboard')),
  getMyAssignments: () => unwrap(apiClient.get('/api/companies/staff/me/assignments')),
  updateMyLocation: (payload) => unwrap(apiClient.put('/api/companies/staff/me/location', payload)),

  //Accept or Reject Request
  acceptAssignment: (assignmentId) => unwrap(apiClient.put(`/api/requests/assignments/${assignmentId}/accept`)),
  rejectAssignment: (assignmentId) => unwrap(apiClient.put(`/api/requests/assignments/${assignmentId}/reject`)),
};
