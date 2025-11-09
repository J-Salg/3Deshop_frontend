import { http } from './client.js';

export const usersApi = {
  me: () => http.get('/api/users/profile'),
  updateMe: (payload) => http.put('/api/users/profile', payload)
};