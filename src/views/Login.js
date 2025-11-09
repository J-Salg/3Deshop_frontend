import { authStore } from '../store/authStore.js';
import { showToast } from '../utils/toast.js';
import { renderNavbar } from '../components/Navbar.js';

export default {
  async render() {
    return `
      <h2>Login</h2>
      <form id="form" class="form">
        <input class="input" name="username" placeholder="Username" required />
        <input class="input" name="password" type="password" placeholder="Password" required />
        <button class="btn primary" type="submit">Sign in</button>
        <div class="muted">Don't have an account? <a href="#/register" data-link>Register</a></div>
      </form>
    `;
  },
  async afterRender() {
    const form = document.getElementById('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await authStore.login({ username: fd.get('username'), password: fd.get('password') });
        renderNavbar();
        window.location.hash = '#/';
      } catch (e) {
        showToast(e.message || 'Login error');
      }
    });
  }
};