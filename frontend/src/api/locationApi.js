import { apiClient, unwrap } from './client';

export const locationApi = {
  reverseGeocode: (lat, lng) =>
    unwrap(apiClient.get('/api/location/reverse-geocode', { params: { lat, lng } })),
};