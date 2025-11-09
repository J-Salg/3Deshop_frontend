import Home from './views/Home.js';
import ProductDetail from './views/ProductDetail.js';
import Login from './views/Login.js';
import Register from './views/Register.js';
import Cart from './views/Cart.js';
import Orders from './views/Orders.js';
import OrderDetail from './views/OrderDetail.js';
import Profile from './views/Profile.js';
import NotFound from './views/NotFound.js';
import ServerError from './views/ServerError.js';

import { authStore } from './store/authStore.js';
import { renderNavbar } from './components/Navbar.js';
import { isBackendDown, pingBackend } from './api/client.js';

import AdminProducts from './views/admin/ProductsAdmin.js';
import AdminProductForm from './views/admin/ProductForm.js';
import AdminCategories from './views/admin/CategoriesAdmin.js';
import OrdersAdmin from './views/admin/OrdersAdmin.js';
import OrderDetailAdmin from './views/admin/OrderDetailAdmin.js';
import UsersAdmin from './views/admin/UsersAdmin.js';

const routes = [
  { path: /^#\/?$/, view: Home },
  { path: /^#\/product\/(\d+)$/, view: ProductDetail },

  { path: /^#\/login$/, view: Login },
  { path: /^#\/register$/, view: Register },

  { path: /^#\/cart$/, view: Cart, auth: true },
  { path: /^#\/orders$/, view: Orders, auth: true },
  { path: /^#\/orders\/(\d+)$/, view: OrderDetail, auth: true },
  { path: /^#\/profile$/, view: Profile, auth: true },

  { path: /^#\/admin$/, view: AdminProducts, admin: true },
  { path: /^#\/admin\/products$/, view: AdminProducts, admin: true },
  { path: /^#\/admin\/products\/new$/, view: AdminProductForm, admin: true },
  { path: /^#\/admin\/products\/(\d+)\/edit$/, view: AdminProductForm, admin: true },
  { path: /^#\/admin\/categories$/, view: AdminCategories, admin: true },
  { path: /^#\/admin\/orders$/, view: OrdersAdmin, admin: true },
  { path: /^#\/admin\/orders\/(\d+)$/, view: OrderDetailAdmin, admin: true },
  { path: /^#\/admin\/users$/, view: UsersAdmin, admin: true }
];

export function navigate(hash) {
  window.location.hash = hash;
}

let pingTimer = null;
function ensureBackendPing() {
  if (pingTimer) return;
  pingTimer = setInterval(async () => {
    const ok = await pingBackend();
    if (ok) {
      clearInterval(pingTimer);
      pingTimer = null;
      renderNavbar();
      router();
    }
  }, 3500);
}

export async function router() {
  const app = document.getElementById('app');
  const hash = window.location.hash || '#/';

  if (isBackendDown()) {
    app.innerHTML = await ServerError.render('Server not available. Please try again in a few seconds.');
    renderNavbar();
    ensureBackendPing();
    return;
  }

  for (const r of routes) {
    const m = hash.match(r.path);
    if (m) {
      if (r.auth && !authStore.token()) {
        window.location.hash = '#/login';
        renderNavbar();
        return;
      }

      if (r.admin && authStore.role() !== 'ROLE_ADMIN') {
        window.location.hash = '#/';
        renderNavbar();
        return;
      }

      const View = r.view;
      try {
        app.innerHTML = await View.render(...m.slice(1));
        if (View.afterRender) await View.afterRender(...m.slice(1));
      } catch (e) {
        console.error(e);
        app.innerHTML = await ServerError.render(e.message || 'Error loading view');
      }

      if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
      renderNavbar();
      return;
    }
  }

  app.innerHTML = await NotFound.render();
  renderNavbar();
}

renderNavbar();
