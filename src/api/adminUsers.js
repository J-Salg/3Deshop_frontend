import { http } from './client.js';

export const adminUsersApi = {
  list: ({ page = 0, size = 20 } = {}) =>
    http.get(`/api/admin/users?page=${page}&size=${size}`),

  get: (id) => http.get(`/api/admin/users/${id}`),

  update: (id, payload) => http.patch(`/api/admin/users/${id}`, payload),

  remove: (id) => http.delete(`/api/admin/users/${id}`)
};