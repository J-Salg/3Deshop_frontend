import { http } from './client.js';

export const ordersApi = {
  checkout: (payload) => http.post('/api/orders/checkout', payload),
  listMine: ({ page = 0, size = 10 } = {}) => http.get(`/api/orders?page=${page}&size=${size}`),
  get: (orderId) => http.get(`/api/orders/${orderId}`),
  getByNumber: (orderNumber) => http.get(`/api/orders/number/${orderNumber}`),
  cancel: (orderId) => http.patch(`/api/orders/${orderId}/cancel`)
};