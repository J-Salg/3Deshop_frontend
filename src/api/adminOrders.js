import { http } from './client.js';

export const adminOrdersApi = {
  list: ({ page = 0, size = 20 } = {}) =>
    http.get(`/api/admin/orders?page=${page}&size=${size}`),

  listByStatus: ({ status, page = 0, size = 20 }) =>
    http.get(`/api/admin/orders/status/${encodeURIComponent(status)}?page=${page}&size=${size}`),

  get: (orderId) => http.get(`/api/admin/orders/${orderId}`),

  updateStatus: (orderId, status) =>
    http.patch(`/api/admin/orders/${orderId}/status`, { status })
};