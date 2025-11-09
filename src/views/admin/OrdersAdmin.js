import { adminOrdersApi } from '../../api/adminOrders.js';
import { adminLayout } from './Layout.js';
import { showToast } from '../../utils/toast.js';
import { formatUSD } from '../../utils/format.js';

const KNOWN_STATUSES = ['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

let state = { page: 0, size: 20, status: 'ALL', sortBy: 'createdAt', sortDir: 'desc' };
let pageData = null;
let loading = false;

function header() {
  return `
    <div class="row between">
  <h2>Orders</h2>
      <div class="row">
        <label class="row" style="gap:.5rem">
          <span>Status</span>
          <select id="flt-status" class="input">
            <option value="ALL" ${state.status==='ALL'?'selected':''}>All</option>
            ${KNOWN_STATUSES.map(s => `<option value="${s}" ${state.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </label>
        <label class="row" style="gap:.5rem">
          <span>Sort</span>
          <select id="sort-field" class="input">
            <option value="createdAt" ${state.sortBy==='createdAt'?'selected':''}>Date</option>
            <option value="id" ${state.sortBy==='id'?'selected':''}>ID</option>
            <option value="orderNumber" ${state.sortBy==='orderNumber'?'selected':''}>Number</option>
            <option value="total" ${state.sortBy==='total'?'selected':''}>Total</option>
            <option value="status" ${state.sortBy==='status'?'selected':''}>Status</option>
          </select>
          <select id="sort-dir" class="input" style="max-width:120px">
            <option value="asc" ${state.sortDir==='asc'?'selected':''}>Asc</option>
            <option value="desc" ${state.sortDir==='desc'?'selected':''}>Desc</option>
          </select>
        </label>
      </div>
    </div>
  `;
}

function table(rows) {
  return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th><th>Number</th><th>User (ID)</th><th>Items</th><th>Total</th><th>Status</th><th>Created</th><th>Shipping</th><th class="right">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${o.orderNumber || '-'}</td>
            <td>${(o.user?.username || o.username || '-') + (o.user?.id ? ` (#${o.user.id})` : (o.userId?` (#${o.userId})`:''))}</td>
            <td>${o.itemCount ?? (o.items?.length ?? 0)}</td>
            <td>${formatUSD(Number(o.totalPrice ?? 0))}</td>
            <td>
              <select class="input small" data-status="${o.id}">
                ${KNOWN_STATUSES.map(s => `<option value="${s}" ${String(o.status).toUpperCase()===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </td>
            <td>${o.createdAt?.replace('T',' ') || '-'}</td>
            <td>
              <div class="muted" style="max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${(o.shippingAddress || '-')}, ${(o.shippingCity || '-')}
              </div>
              <div class="muted" style="font-size:.85em">
                CP: ${o.shippingPostalCode || '-'} · ${o.shippingCountry || '-'}
              </div>
            </td>
            <td class="right">
              <a href="#/admin/orders/${o.id}" class="btn">View</a>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="row right">
  <button id="pg-prev" class="btn" ${pageData?.first?'disabled':''}>Prev</button>
  <span class="muted" style="padding:0 .75rem">Page ${(pageData?.pageNumber ?? state.page) + 1} / ${pageData?.totalPages || 1}</span>
  <button id="pg-next" class="btn" ${pageData?.last?'disabled':''}>Next</button>
    </div>
  `;
}

async function load() {
  pageData = await (
    state.status !== 'ALL'
      ? adminOrdersApi.listByStatus({ status: state.status, page: state.page, size: state.size })
      : adminOrdersApi.list({ page: state.page, size: state.size })
  ).catch(() => ({ content: [], pageNumber:0, totalPages:1, first:true, last:true }));
}

function sortedRows(rows) {
  const field = state.sortBy;
  const dir = state.sortDir === 'desc' ? -1 : 1;
  const getVal = (o) => {
    switch (field) {
      case 'id': return Number(o.id) || 0;
      case 'orderNumber': return String(o.orderNumber || '');
  case 'total': return Number(o.totalPrice ?? 0);
      case 'status': return String(o.status || '');
      case 'createdAt':
      default: {
        const d = o.createdAt || o.orderDate || o.created || o.date;
        return d ? new Date(d).getTime() : 0;
      }
    }
  };
  return [...rows].sort((a, b) => {
    const va = getVal(a), vb = getVal(b);
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va).localeCompare(String(vb)) * dir;
  });
}

export default {
  async render() {
    loading = true; renderSkeleton(); await load(); loading = false;
    const rows = sortedRows(pageData?.content || []);
    const html = `${header()}${table(rows)}`;
    return adminLayout(html, 'orders');
  },

  async afterRender() {
    const reload = async () => {
      const app = document.getElementById('app');
      app.innerHTML = await this.render();
      await this.afterRender();
    };

    document.querySelectorAll('[data-status]')?.forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = Number(sel.getAttribute('data-status'));
        const status = e.target.value;
        await adminOrdersApi.updateStatus(id, status);
  showToast(`Order ${id} -> ${status}`);
      });
    });

    document.getElementById('flt-status')?.addEventListener('change', async (e) => {
      state.status = e.target.value;
      state.page = 0;
      await reload();
    });

    document.getElementById('pg-prev')?.addEventListener('click', async () => {
  if (!pageData?.first && state.page > 0) { state.page--; await reload(); }
    });
    document.getElementById('pg-next')?.addEventListener('click', async () => {
  if (!pageData?.last) { state.page++; await reload(); }
    });

    document.getElementById('sort-field')?.addEventListener('change', async (e) => {
      state.sortBy = e.target.value;
      await reload();
    });
    document.getElementById('sort-dir')?.addEventListener('change', async (e) => {
      state.sortDir = e.target.value;
      await reload();
    });
  }
};

function renderSkeleton() {
  const app = document.getElementById('app');
  if (!app) return;
  const skeletonRows = Array.from({ length: 7 }).map(() => `
    <tr>
      <td><div class="skeleton text" style="width:40px"></div></td>
      <td><div class="skeleton text" style="width:120px"></div></td>
      <td><div class="skeleton text" style="width:140px"></div></td>
      <td><div class="skeleton text" style="width:60px"></div></td>
      <td><div class="skeleton text" style="width:70px"></div></td>
      <td><div class="skeleton text" style="width:90px"></div></td>
      <td><div class="skeleton text" style="width:120px"></div></td>
      <td><div class="skeleton text" style="width:200px"></div></td>
      <td class="right"><div class="skeleton text" style="width:80px"></div></td>
    </tr>
  `).join('');
  app.innerHTML = adminLayout(`
    ${header()}
    <table class="table">
      <thead>
        <tr>
          <th>ID</th><th>Number</th><th>User (ID)</th><th>Items</th><th>Total</th><th>Status</th><th>Created</th><th>Shipping</th><th class="right">Actions</th>
        </tr>
      </thead>
      <tbody>${skeletonRows}</tbody>
    </table>
  `, 'orders');
}