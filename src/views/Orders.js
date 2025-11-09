import { ordersApi } from '../api/orders.js';
import { formatUSD } from '../utils/format.js';

export default {
  async render() {
    const page = await ordersApi.listMine({ page: 0, size: 20 }).catch(() => null);
    const rows = page?.content || [];
    if (!rows.length) {
      return `<div class="center"><h2>You don't have orders</h2><a class="btn" href="#/" data-link>Go shopping</a></div>`;
    }
    return `
      <h2>My orders</h2>
      <table class="table">
        <thead><tr><th>No.</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${rows.map(o => `
            <tr>
              <td>${o.orderNumber || o.id}</td>
              <td>${o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
              <td>${o.itemCount ?? (o.items?.length ?? '-')}</td>
              <td>${formatUSD(Number(o.totalPrice ?? 0))}</td>
              <td>${o.status || '-'}</td>
              <td><a class="btn" href="#/orders/${o.id}" data-link>View</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
};