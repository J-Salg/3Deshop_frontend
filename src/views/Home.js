import { productsApi } from '../api/products.js';
import { categoriesApi } from '../api/categories.js';
import ProductCard from '../components/ProductCard.js';
import Pagination from '../components/Pagination.js';

let state = { page: 0, size: 12, sortBy: 'id', sortDir: 'asc', categoryId: null, keyword: '' };

function toolbar(categories) {
  return `
    <div class="row section">
      <input id="search" class="input" placeholder="Search products..." value="${state.keyword || ''}" />
      <select id="category" class="input" style="max-width:220px">
        <option value="">All categories</option>
        ${categories.map(c => `<option value="${c.id}" ${state.categoryId == c.id ? 'selected':''}>${c.name}</option>`).join('')}
      </select>
      <select id="sort" class="input" style="max-width:220px">
        <option value="id.asc" ${state.sortBy==='id'&&state.sortDir==='asc'?'selected':''}>Recent</option>
        <option value="price.asc" ${state.sortBy==='price'&&state.sortDir==='asc'?'selected':''}>Price ↑</option>
        <option value="price.desc" ${state.sortBy==='price'&&state.sortDir==='desc'?'selected':''}>Price ↓</option>
      </select>
      <button id="apply" class="btn primary">Apply</button>
    </div>
  `;
}

async function fetchData() {
  if (state.keyword) {
    return productsApi.search({ keyword: state.keyword, page: state.page, size: state.size });
  }
  if (state.categoryId) {
    return productsApi.byCategory({
      categoryId: state.categoryId, page: state.page, size: state.size, sortBy: state.sortBy, sortDir: state.sortDir
    });
  }
  return productsApi.list({ page: state.page, size: state.size, sortBy: state.sortBy, sortDir: state.sortDir });
}

export default {
  async render() {
    const [categories, page] = await Promise.all([
      categoriesApi.list(),
      fetchData()
    ]);

    return `
      <section>
        ${toolbar(categories)}
        <div class="grid">
          ${page.content.map(ProductCard).join('')}
        </div>
        ${Pagination(page)}
      </section>
    `;
  },

  async afterRender() {
    const apply = document.getElementById('apply');
    const search = document.getElementById('search');
    const category = document.getElementById('category');
    const sort = document.getElementById('sort');

    const reload = async () => {
      const app = document.getElementById('app');
      app.innerHTML = await this.render();
      await this.afterRender();
    };

    apply?.addEventListener('click', async () => {
      state.page = 0;
      state.keyword = search.value.trim();
      state.categoryId = category.value || null;
      const [sortBy, sortDir] = sort.value.split('.');
      state.sortBy = sortBy; state.sortDir = sortDir;
      await reload();
    });

    document.querySelectorAll('.pagination .btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const p = Number(btn.dataset.page);
        if (!isNaN(p) && p >= 0) { state.page = p; await reload(); }
      });
    });
  }
};