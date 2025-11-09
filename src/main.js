import { renderNavbar } from './components/Navbar.js';
import { router, navigate } from './router.js';
import { authStore } from './store/authStore.js';

function mount() {
  renderNavbar();
  router();
}

authStore.initFromStorage();

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (a) {
    e.preventDefault();
    navigate(a.getAttribute('href'));
  }
});

window.addEventListener('hashchange', router);
window.addEventListener('load', mount);