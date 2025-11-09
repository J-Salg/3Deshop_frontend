import { authStore } from '../store/authStore.js';

export const API_BASE = import.meta.env.VITE_API_BASE_URL;

let backendDown = false;
let lastErrorAt = 0;

function setBackendStatus(down) {
  if (backendDown !== down) {
    backendDown = down;
    window.dispatchEvent(new CustomEvent('backend:status', { detail: { down } }));
  }
}

export function isBackendDown() { return backendDown; }

export async function pingBackend() {
  try {
    const resp = await fetch(API_BASE + '/api/products?page=0&size=1', { method: 'GET' });
    const ok = !!resp && resp.ok;
    setBackendStatus(!ok);
    return ok;
  } catch {
    setBackendStatus(true);
    return false;
  }
}

async function parseJsonSafe(resp) {
  const text = await resp.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

async function doFetch(input, init = {}, retry = true) {
  const token = authStore.token();
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

  const baseHeaders = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const jsonHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };
  const headers = { ...jsonHeaders, ...(init.headers || {}), ...baseHeaders };

  let resp;
  try {
    resp = await fetch(API_BASE + input, { ...init, headers });
  } catch (e) {
    lastErrorAt = Date.now();
    setBackendStatus(true);
    throw new Error('Error: Server unavailable');
  }

  if (resp.status === 401 && retry && authStore.username()) {
    try {
      await authStore.refresh();
      return doFetch(input, init, false);
    } catch {
      authStore.logout();
    }
  }

  const data = await parseJsonSafe(resp);

  if (!resp.ok) {
    if ([502, 503, 504].includes(resp.status)) {
      lastErrorAt = Date.now();
      setBackendStatus(true);
    }
    const message = data?.message || data?.error || `HTTP ${resp.status}`;
    throw new Error(message);
  }

  if (backendDown) setBackendStatus(false);

  if (data && typeof data === 'object' && 'success' in data) {
    if (data.success) return data.data;
    throw new Error(data.message || 'Operación fallida');
  }

  return data;
}

export const http = {
  get: (url) => doFetch(url, { method: 'GET' }),
  post: (url, body) => doFetch(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => doFetch(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (url, body) => doFetch(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url) => doFetch(url, { method: 'DELETE' }),
  postForm: (url, formData) => doFetch(url, { method: 'POST', body: formData })
};