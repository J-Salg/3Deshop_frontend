import { http } from './client.js';

export const cartApi = {
  get: () => http.get('/api/cart'),
  add: (payload) => http.post('/api/cart/items', payload),
  update: (itemId, payload) => http.put(`/api/cart/items/${itemId}`, payload),
  remove: (itemId) => http.delete(`/api/cart/items/${itemId}`),
  clear: () => http.delete('/api/cart/clear')
};