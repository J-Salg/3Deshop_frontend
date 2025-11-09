import { http } from './client.js';

export const authApi = {
  login: (payload) => http.post('/api/auth/login', payload),
  register: (payload) => http.post('/api/auth/register', payload),
  refresh: (username) => http.post(`/api/auth/refresh?username=${encodeURIComponent(username)}`)
};