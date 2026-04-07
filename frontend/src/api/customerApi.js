import { apiClient, unwrap } from './client';

export const customerApi = {
  listVehicles: () => unwrap(apiClient.get('/api/customers/vehicles')),
  getVehicle: (id) => unwrap(apiClient.get(`/api/customers/vehicles/${id}`)),
  createVehicle: (payload) => unwrap(apiClient.post('/api/customers/vehicles', payload)),
  updateVehicle: (id, payload) => unwrap(apiClient.put(`/api/customers/vehicles/${id}`, payload)),
  deleteVehicle: (id) => unwrap(apiClient.delete(`/api/customers/vehicles/${id}`)),
};
