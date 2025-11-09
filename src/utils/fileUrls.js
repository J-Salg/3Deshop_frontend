const API_BASE = import.meta.env.VITE_API_BASE_URL;

function isAbsolute(u) { return /^https?:\/\//i.test(u); }
function join(...parts) { return parts.join('/').replace(/\/{2,}/g, '/'); }

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (isAbsolute(imageUrl)) return imageUrl;
  if (imageUrl.startsWith('/')) return API_BASE + imageUrl;
  if (imageUrl.includes('/uploads/')) return API_BASE + '/' + imageUrl;
  return API_BASE + '/api/files/images/' + imageUrl;
}

export function resolveModelUrl(modelUrl) {
  if (!modelUrl) return null;
  if (isAbsolute(modelUrl)) return modelUrl;
  if (modelUrl.startsWith('/')) return API_BASE + modelUrl;
  if (modelUrl.includes('/uploads/')) return API_BASE + '/' + modelUrl;
  return API_BASE + '/api/files/models/' + modelUrl;
}