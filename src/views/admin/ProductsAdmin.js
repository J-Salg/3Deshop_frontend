import { productsApi } from '../../api/products.js';
import { categoriesApi } from '../../api/categories.js';
import { formatUSD } from '../../utils/format.js';
import { adminLayout } from './Layout.js';
import { showToast } from '../../utils/toast.js';

let state = { page: 0, size: 12, sortBy: 'id', sortDir: 'desc' };
let pageData = null;
let categoryIdByName = {};

function table(rows) {
  return `
    <div class="row between">
      <h2>Products</h2>
      <div>
        <a href="#/admin/products/new" class="btn primary">New</a>
      </div>
    </div>
    <table class="table">
      <thead><tr>
        <th>ID</th><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Active</th><th class="right">Actions</th>
      </tr></thead>
      <tbody>
        ${rows.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${formatUSD(p.price)}</td>
            <td>${p.stock}</td>
            <td>${p.categoryName ? `${p.categoryName} (#${categoryIdByName[p.categoryName] ?? '?'})` : '-'}</td>
            <td>${p.active ? 'Yes' : 'No'}</td>
            <td class="right">
              <a href="#/admin/products/${p.id}/edit" class="btn">Edit</a>
              <button class="btn danger" data-del="${p.id}">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="row right">
      <button id="pg-prev" class="btn" ${pageData?.first?'disabled':''}>Previous</button>
      <span class="muted" style="padding:0 .75rem">Page ${(pageData?.pageNumber ?? state.page) + 1} / ${pageData?.totalPages || 1}</span>
      <button id="pg-next" class="btn" ${pageData?.last?'disabled':''}>Next</button>
    </div>
  `;
}

async function ensureCategoriesMap() {
  if (Object.keys(categoryIdByName).length === 0) {
    const cats = await categoriesApi.list();
    categoryIdByName = Object.fromEntries(cats.map(c => [c.name, c.id]));
  }
}

async function reload(toHash = true) {
  await ensureCategoriesMap();
  pageData = await productsApi.list({ page: state.page, size: state.size, sortBy: state.sortBy, sortDir: state.sortDir });
  if (toHash) window.location.hash = '#/admin/products';
}

export default {
  async render() {
    await ensureCategoriesMap();
    pageData = await productsApi.list({ page: state.page, size: state.size, sortBy: state.sortBy, sortDir: state.sortDir });
    const rows = pageData?.content || [];
    return adminLayout(table(rows), 'products');
  },

  async afterRender() {
    document.getElementById('pg-prev')?.addEventListener('click', async () => {
      if (!pageData?.first && state.page > 0) { state.page--; await reload(); }
    });
    document.getElementById('pg-next')?.addEventListener('click', async () => {
      if (!pageData?.last) { state.page++; await reload(); }
    });

    document.querySelectorAll('[data-del]')?.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-del'));
        if (!confirm(`Delete product ${id}?`)) return;
        await productsApi.remove(id);
        showToast('Product deleted');
        await reload();
      });
    });
  }
};