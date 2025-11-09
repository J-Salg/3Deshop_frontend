import { http } from './client.js';

export const categoriesApi = {
  list: () => http.get('/api/categories'),
  create: (payload) => http.post('/api/categories', payload),
  update: (id, payload) => http.put(`/api/categories/${id}`, payload),
  remove: (id) => http.delete(`/api/categories/${id}`)
};