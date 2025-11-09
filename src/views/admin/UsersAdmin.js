import { adminUsersApi } from '../../api/adminUsers.js';
import { adminLayout } from './Layout.js';
import { showToast } from '../../utils/toast.js';

let state = { page: 0, size: 20 };
let pageData = null;

function view(rows) {
  return `
    <h2>Users</h2>
    <table class="table">
      <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Enabled</th><th class="right">Actions</th></tr></thead>
      <tbody>
        ${rows.map(u => `
          <tr>
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.email || '-'}</td>
            <td>
              <select class="input small" data-role="${u.id}">
                <option value="ROLE_USER" ${u.role==='ROLE_USER'?'selected':''}>ROLE_USER</option>
                <option value="ROLE_ADMIN" ${u.role==='ROLE_ADMIN'?'selected':''}>ROLE_ADMIN</option>
              </select>
            </td>
            <td>
              <input type="checkbox" data-enabled="${u.id}" ${u.enabled!==false?'checked':''}/>
            </td>
            <td class="right">
              <button class="btn" data-save="${u.id}">Save</button>
              <button class="btn danger" data-del="${u.id}">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="row right">
      <button id="pg-prev" class="btn" ${pageData?.page===0?'disabled':''}>Prev</button>
      <span class="muted" style="padding:0 .75rem">Page ${pageData ? pageData.page + 1 : 1} / ${pageData?.totalPages || 1}</span>
      <button id="pg-next" class="btn" ${pageData && pageData.page < (pageData.totalPages - 1) ? '' : 'disabled'}>Next</button>
    </div>
  `;
}

async function load() {
  pageData = await adminUsersApi.list({ page: state.page, size: state.size });
}

export default {
  async render() {
    await load();
    const rows = pageData?.content || [];
    return adminLayout(view(rows), 'users');
  },

  async afterRender() {
    document.querySelectorAll('[data-save]')?.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-save'));
        const role = document.querySelector(`[data-role="${id}"]`).value;
        const enabled = document.querySelector(`[data-enabled="${id}"]`).checked;
  await adminUsersApi.update(id, { role, enabled });
  showToast('User updated');
        window.location.hash = '#/admin/users';
      });
    });

    document.querySelectorAll('[data-del]')?.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-del'));
  if (!confirm(`Delete user ${id}?`)) return;
  await adminUsersApi.remove(id);
  showToast('User deleted');
        window.location.hash = '#/admin/users';
      });
    });

    document.getElementById('pg-prev')?.addEventListener('click', async () => {
      if (state.page > 0) { state.page--; window.location.hash = '#/admin/users'; }
    });
    document.getElementById('pg-next')?.addEventListener('click', async () => {
      if (pageData && state.page < pageData.totalPages - 1) { state.page++; window.location.hash = '#/admin/users'; }
    });
  }
};