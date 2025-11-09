import { http, API_BASE } from './client.js';

function normalizeUrl(res, kind, fileNameField = 'fileName', uriField = 'fileDownloadUri') {
  if (res?.[uriField]) return res[uriField];
  const name = res?.[fileNameField];
  if (name) return `${API_BASE}/api/files/${kind}/${encodeURIComponent(name)}`;
  return null;
}

export const filesApi = {
  async uploadImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await http.postForm('/api/files/images', fd);
    return normalizeUrl(res, 'images');
  },
  async uploadModel(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await http.postForm('/api/files/models', fd);
    return normalizeUrl(res, 'models');
  }
};