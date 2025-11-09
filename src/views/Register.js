import { authStore } from '../store/authStore.js';
import { showToast } from '../utils/toast.js';
import { renderNavbar } from '../components/Navbar.js';

export default {
  async render() {
    return `
      <h2>Register</h2>
      <form id="form" class="form">
        <input class="input" name="username" placeholder="Username" required />
        <input class="input" name="email" type="email" placeholder="Email" required />
        <input class="input" name="password" type="password" placeholder="Password" required />
        <input class="input" name="firstName" placeholder="First name" required />
        <input class="input" name="lastName" placeholder="Last name" required />
        <button class="btn primary" type="submit">Create account</button>
      </form>
    `;
  },
  async afterRender() {
    const form = document.getElementById('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await authStore.register({
          username: fd.get('username'),
          email: fd.get('email'),
          password: fd.get('password'),
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName')
        });
        renderNavbar();
        window.location.hash = '#/';
      } catch (e) {
        showToast(e.message || 'Registration error');
      }
    });
  }
};