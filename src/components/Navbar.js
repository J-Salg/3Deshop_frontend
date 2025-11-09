import { authStore } from '../store/authStore.js';
import { isBackendDown } from '../api/client.js';

let subscribed = false;

export function renderNavbar() {
  const root = document.getElementById('navbar');
  if (!root) return;

  const role = authStore.role();
  const backendDown = isBackendDown();

  root.innerHTML = `
    <nav class="navbar">
      <div class="navbar-content">
        <a href="#/" class="brand">3DE-SHOP</a>
        <div class="nav-links">
          <a href="#/" class="btn link">Home</a>
          ${role === 'ROLE_ADMIN' ? `<a href="#/admin" class="btn link">Admin</a>` : ``}
        </div>
        <div class="nav-right">
          ${backendDown ? `
            <span class="muted">Server unreachable</span>
          ` : `
            <a href="#/cart" class="btn">Cart</a>
            ${authStore.token() ? `
              <a href="#/orders" class="btn">My orders</a>
              <a href="#/profile" class="btn">${authStore.username() || 'Profile'}</a>
              <button id="btn-logout" class="btn">Logout</button>
            ` : `
              <a href="#/login" class="btn">Login</a>
              <a href="#/register" class="btn">Register</a>
            `}
          `}
        </div>
      </div>
    </nav>
  `;

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    authStore.logout();
    window.location.hash = '#/';
  });

  if (!subscribed) {
    window.addEventListener('auth:changed', renderNavbar);
    window.addEventListener('hashchange', renderNavbar);
    window.addEventListener('backend:status', renderNavbar);
    subscribed = true;
  }
}
