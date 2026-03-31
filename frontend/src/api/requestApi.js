import { apiClient, unwrap } from './client';

export const requestApi = {
  createRequest: (payload) => unwrap(apiClient.post('/api/requests', payload)),
  getMyRequests: () => unwrap(apiClient.get('/api/requests/my')),
  getRequestDetail: (id) => unwrap(apiClient.get(`/api/requests/${id}`)),
  cancelRequest: (id, payload) => unwrap(apiClient.put(`/api/requests/${id}/cancel`, payload)),
  updateStatus: (id, payload) => unwrap(apiClient.put(`/api/requests/${id}/status`, payload)),
  getHistory: (id) => unwrap(apiClient.get(`/api/requests/${id}/history`)),
  getMessages: (id) => unwrap(apiClient.get(`/api/requests/${id}/messages`)),
  sendMessage: (id, payload) => unwrap(apiClient.post(`/api/requests/${id}/messages`, payload)),
  getQuotes: (id) => unwrap(apiClient.get(`/api/requests/${id}/quotes`)),
  acceptQuote: (quoteId) => unwrap(apiClient.put(`/api/requests/quotes/${quoteId}/accept`)),
  rejectQuote: (quoteId) => unwrap(apiClient.put(`/api/requests/quotes/${quoteId}/reject`)),
  getPayments: (id) => unwrap(apiClient.get(`/api/requests/${id}/payments`)),
  createPayment: (id, payload) => unwrap(apiClient.post(`/api/requests/${id}/payments`, payload)),
  pay: (paymentId, payload) => unwrap(apiClient.put(`/api/requests/payments/${paymentId}/pay`, payload)),
  createReview: (id, payload) => unwrap(apiClient.post(`/api/requests/${id}/reviews`, payload)),
};
