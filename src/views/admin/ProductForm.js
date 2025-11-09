import { productsApi } from '../../api/products.js';
import { categoriesApi } from '../../api/categories.js';
import { filesApi } from '../../api/files.js';
import { adminLayout } from './Layout.js';
import { showToast } from '../../utils/toast.js';

let model = null;
let cats = [];

function form(p) {
  return `
    <h2>${p?.id ? 'Edit' : 'New'} product</h2>
    <form id="frm" class="stack">
      <div class="grid2">
        <label>Name<input name="name" class="input" required value="${p?.name || ''}"/></label>
        <label>Price<input name="price" type="number" class="input" required step="0.01" value="${p?.price ?? ''}"/></label>
      </div>
      <div class="grid2">
        <label>Stock<input name="stock" type="number" class="input" required min="0" value="${p?.stock ?? 0}"/></label>
        <label>Category
          <select name="categoryId" class="input" required>
            ${cats.map(c => `<option value="${c.id}" ${p?.category?.id===c.id?'selected':''}>${c.name}</option>`).join('')}
          </select>
        </label>
      </div>
      <label>Description<textarea name="description" class="input" rows="4">${p?.description || ''}</textarea></label>
      <div class="grid2">
        <label>Image<input id="image" type="file" accept="image/*" class="input"/></label>
        <label>3D model<input id="model" type="file" accept=".glb,.gltf" class="input"/></label>
      </div>
      <div class="grid2">
        <label>Image URL<input name="imageUrl" class="input" value="${p?.imageUrl || ''}"/></label>
        <label>Model URL<input name="modelUrl" class="input" value="${p?.modelUrl || ''}"/></label>
      </div>
      <label><input type="checkbox" name="active" ${p?.active!==false?'checked':''}/> Active</label>
      <div class="row">
        <button class="btn primary" type="submit">Save</button>
        <a class="btn" href="#/admin/products">Back</a>
      </div>
    </form>
  `;
}

export default {
  async render(id) {
    cats = await categoriesApi.list();
    model = id ? await productsApi.get(id) : { active: true };
    return adminLayout(form(model), 'products');
  },

  async afterRender(id) {
    const frm = document.getElementById('frm');

    document.getElementById('image')?.addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const url = await filesApi.uploadImage(f);
      frm.imageUrl.value = url || '';
  showToast('Image uploaded');
    });

    document.getElementById('model')?.addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const url = await filesApi.uploadModel(f);
      frm.modelUrl.value = url || '';
  showToast('Model uploaded');
    });

    frm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: frm.name.value.trim(),
        description: frm.description.value.trim(),
        price: Number(frm.price.value),
        stock: Number(frm.stock.value),
        categoryId: Number(frm.categoryId.value),
        active: frm.active.checked,
        imageUrl: frm.imageUrl.value.trim() || null,
        modelUrl: frm.modelUrl.value.trim() || null
      };
      if (id) {
        await productsApi.update(Number(id), payload);
        showToast('Product updated');
      } else {
        await productsApi.create(payload);
        showToast('Product created');
      }
      window.location.hash = '#/admin/products';
    });
  }
};