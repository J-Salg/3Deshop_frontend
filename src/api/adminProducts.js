import { http } from './client.js';

export const adminProductsApi = {
  list: ({ page = 0, size = 12, sortBy = 'id', sortDir = 'desc' } = {}) =>
    http.get(`/api/admin/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  get: (id) => http.get(`/api/admin/products/${id}`),
  update: (id, payload) => http.put(`/api/admin/products/${id}`, payload),
  toggleActive: (id, active) => http.patch(`/api/admin/products/${id}/active`, { active })
};
