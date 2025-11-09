import { http } from './client.js';

export const productsApi = {
  list: ({ page = 0, size = 12, sortBy = 'id', sortDir = 'asc' } = {}) =>
    http.get(`/api/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  byCategory: ({ categoryId, page = 0, size = 12, sortBy = 'id', sortDir = 'asc' }) =>
    http.get(`/api/products/category/${categoryId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  search: ({ keyword, page = 0, size = 12 }) =>
    http.get(`/api/products/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),
  byPriceRange: ({ minPrice, maxPrice, page = 0, size = 12 }) =>
    http.get(`/api/products/price-range?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&size=${size}`),
  get: (id) => http.get(`/api/products/${id}`),

  create: (payload) => http.post('/api/products', payload),
  update: (id, payload) => http.put(`/api/products/${id}`, payload),
  remove: (id) => http.delete(`/api/products/${id}`)
};