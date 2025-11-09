import { usersApi } from '../api/users.js';
import { showToast } from '../utils/toast.js';

export default {
  async render() {
    const u = await usersApi.me();
    return `
      <h2>My profile</h2>
      <div class="section">
        <div class="kv"><span>Username</span><span>${u.username}</span></div>
        <div class="kv"><span>Email</span><span>${u.email}</span></div>
        <div class="kv"><span>Name</span><span>${u.firstName} ${u.lastName}</span></div>
        <div class="kv"><span>Role</span><span>${u.role}</span></div>
        <div class="kv"><span>Created</span><span>${new Date(u.createdAt).toLocaleString()}</span></div>
      </div>
      <h3>Update</h3>
      <form id="form" class="form">
        <input class="input" name="email" type="email" placeholder="Email" value="${u.email || ''}" />
        <input class="input" name="password" type="password" placeholder="New password (optional)" />
        <input class="input" name="firstName" placeholder="First name" value="${u.firstName || ''}" />
        <input class="input" name="lastName" placeholder="Last name" value="${u.lastName || ''}" />
        <button class="btn primary" type="submit">Save</button>
      </form>
    `;
  },
  async afterRender() {
    const form = document.getElementById('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      try {
        await usersApi.updateMe(payload);
        showToast('Profile updated');
      } catch (e2) {
        showToast(e2.message || 'Update error');
      }
    });
  }
};