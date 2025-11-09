import { authApi } from '../api/auth.js';
import { showToast } from '../utils/toast.js';

const key = {
  token: 'auth.token',
  username: 'auth.username',
  role: 'auth.role',
  email: 'auth.email',
  id: 'auth.id'
};

function notifyAuthChanged() {
  window.dispatchEvent(new CustomEvent('auth:changed'));
}

export const authStore = {
  state: { token: null, username: null, role: null, email: null, id: null },

  initFromStorage() {
    this.state.token = localStorage.getItem(key.token);
    this.state.username = localStorage.getItem(key.username);
    this.state.role = localStorage.getItem(key.role);
    this.state.email = localStorage.getItem(key.email);
    const id = localStorage.getItem(key.id);
    this.state.id = id ? Number(id) : null;

    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('auth.')) notifyAuthChanged();
    });
  },

  token() { return this.state.token; },
  username() { return this.state.username; },
  role() { return this.state.role; },

  async login({ username, password }) {
    const res = await authApi.login({ username, password });
    this._saveAuth(res);
    showToast('Login successful');
    notifyAuthChanged();
    return res;
  },

  async register(payload) {
    const res = await authApi.register(payload);
    this._saveAuth(res);
    showToast('Registration successful');
    notifyAuthChanged();
    return res;
  },

  async refresh() {
    if (!this.state.username) throw new Error('No username');
    const res = await authApi.refresh(this.state.username);
    this._saveAuth(res);
    notifyAuthChanged();
  },

  logout() {
    this.state = { token: null, username: null, role: null, email: null, id: null };
    localStorage.removeItem(key.token);
    localStorage.removeItem(key.username);
    localStorage.removeItem(key.role);
    localStorage.removeItem(key.email);
    localStorage.removeItem(key.id);
    showToast('Logged out');
    notifyAuthChanged();
  },

  _saveAuth(auth) {
    this.state.token = auth.token;
    this.state.username = auth.username;
    this.state.role = auth.role;
    this.state.email = auth.email;
    this.state.id = auth.id;
    localStorage.setItem(key.token, auth.token);
    localStorage.setItem(key.username, auth.username);
    localStorage.setItem(key.role, auth.role);
    localStorage.setItem(key.email, auth.email);
    localStorage.setItem(key.id, String(auth.id));
  }
};
