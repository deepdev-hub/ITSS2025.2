import { apiClient, unwrap } from './client';

export const requestApi = {
  createRequest: (payload) => unwrap(apiClient.post('/api/requests', payload)),
  getMyRequests: () => unwrap(apiClient.get('/api/requests/my')),
  getRequestDetail: (id) => unwrap(apiClient.get(`/api/requests/${id}`)),
  getRequestTracking: (id) => unwrap(apiClient.get(`/api/requests/${id}/tracking`)),
  cancelRequest: (id, payload) => unwrap(apiClient.patch(`/api/requests/${id}/cancel`, payload)),
  updateStatus: (id, payload) => unwrap(apiClient.put(`/api/requests/${id}/status`, payload)),
  getHistory: (id) => unwrap(apiClient.get(`/api/requests/${id}/history`)),
  getMessages: (id) => unwrap(apiClient.get(`/api/requests/${id}/messages`)),
  sendMessage: (id, payload) => unwrap(apiClient.post(`/api/requests/${id}/messages`, payload)),
  getQuotes: (id) => unwrap(apiClient.get(`/api/requests/${id}/quotes`)),
  updateDealPrice: (id, payload) => unwrap(apiClient.patch(`/api/requests/${id}/deal-price`, payload)),
  acceptPrice: (id) => unwrap(apiClient.patch(`/api/requests/${id}/accept-price`)),
  rejectPrice: (id, payload) => unwrap(apiClient.patch(`/api/requests/${id}/reject-price`, payload)),
  acceptQuote: (quoteId) => unwrap(apiClient.put(`/api/requests/quotes/${quoteId}/accept`)),
  rejectQuote: (quoteId) => unwrap(apiClient.put(`/api/requests/quotes/${quoteId}/reject`)),
  getPayments: (id) => unwrap(apiClient.get(`/api/requests/${id}/payments`)),
  createPayment: (id, payload) => unwrap(apiClient.post(`/api/requests/${id}/payment`, payload)),
  pay: (paymentId, payload) => unwrap(apiClient.put(`/api/requests/payments/${paymentId}/pay`, payload)),
  createReview: (id, payload) => unwrap(apiClient.post(`/api/requests/${id}/reviews`, payload)),
  uploadRequestImage: (id, formData) => unwrap(apiClient.post(`/api/requests/${id}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })),
};
