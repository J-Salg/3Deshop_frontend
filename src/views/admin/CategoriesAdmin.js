import { categoriesApi } from '../../api/categories.js';
import { adminLayout } from './Layout.js';
import { showToast } from '../../utils/toast.js';

let list = [];

function view() {
  return `
    <h2>Categories</h2>
    <form id="newCat" class="row">
      <input name="name" class="input" placeholder="Name" required/>
      <input name="description" class="input" placeholder="Description"/>
      <button class="btn primary">Add</button>
    </form>
    <table class="table">
      <thead><tr><th>ID</th><th>Name</th><th>Description</th><th class="right">Actions</th></tr></thead>
      <tbody>
        ${list.map(c => `
          <tr>
            <td>${c.id}</td>
            <td><input class="input" data-name="${c.id}" value="${c.name}"/></td>
            <td><input class="input" data-desc="${c.id}" value="${c.description || ''}"/></td>
            <td class="right">
              <button class="btn" data-save="${c.id}">Save</button>
              <button class="btn danger" data-del="${c.id}">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function reload() {
  list = await categoriesApi.list();
  document.querySelector('main.content').innerHTML = view();
}

export default {
  async render() {
    list = await categoriesApi.list();
    return adminLayout(view(), 'categories');
  },

  async afterRender() {
    document.getElementById('newCat')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
  await categoriesApi.create({ name: f.name.value.trim(), description: f.description.value.trim() });
  showToast('Category created');
      f.reset();
      await reload();
    });

    document.querySelectorAll('[data-save]')?.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-save'));
        const name = document.querySelector(`[data-name="${id}"]`).value.trim();
        const description = document.querySelector(`[data-desc="${id}"]`).value.trim();
  await categoriesApi.update(id, { name, description });
  showToast('Category updated');
        await reload();
      });
    });

    document.querySelectorAll('[data-del]')?.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-del'));
  if (!confirm(`Delete category ${id}?`)) return;
  await categoriesApi.remove(id);
  showToast('Category deleted');
        await reload();
      });
    });
  }
};