import { adminOrdersApi } from '../../api/adminOrders.js';
import { adminLayout } from './Layout.js';
import { showToast } from '../../utils/toast.js';
import { formatUSD } from '../../utils/format.js';

const KNOWN_STATUSES = ['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
let order = null;

function view(o) {
  const items = o.items || o.orderItems || [];
  return `
  <h2>Order #${o.orderNumber || o.id}</h2>
    <div class="row gap">
      <div>Estado:
        <select id="order-status" class="input">
          ${KNOWN_STATUSES.map(s => `<option value="${s}" ${String(o.status).toUpperCase()===s?'selected':''}>${s}</option>`).join('')}
        </select>
        <button id="btn-save-status" class="btn">Save</button>
      </div>
      <div class="muted">Created: ${o.createdAt?.replace('T',' ') || '-'}</div>
    </div>

    <h3>Shipping</h3>
    <div class="kv section">
      <span>Address</span><span>${o.shippingAddress || '-'}</span>
      <span>City</span><span>${o.shippingCity || '-'}</span>
      <span>Postal Code</span><span>${o.shippingPostalCode || '-'}</span>
      <span>Country</span><span>${o.shippingCountry || '-'}</span>
      <span>Phone</span><span>${o.phoneNumber || '-'}</span>
      <span>Notes</span><span>${o.notes || '-'}</span>
    </div>

    <h3>Items</h3>
    <table class="table">
      <thead><tr><th>Product</th><th>Qty.</th><th>Price</th><th>Subtotal</th></tr></thead>
      <tbody>
        ${items.map(it => `
          <tr>
            <td>${it.productName || it.product?.name || '-'}</td>
            <td>${it.quantity}</td>
            <td>${formatUSD(Number(it.price ?? it.unitPrice ?? 0))}</td>
            <td>${formatUSD(Number(it.subtotal ?? (it.quantity * (it.price ?? it.unitPrice ?? 0))))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="row right">
      <strong>Total: ${formatUSD(Number(o.totalPrice ?? 0))}</strong>
    </div>

    <div class="row">
      <a href="#/admin/orders" class="btn">Back</a>
    </div>
  `;
}

export default {
  async render(orderId) {
    order = await adminOrdersApi.get(orderId);
    return adminLayout(view(order), 'orders');
  },

  async afterRender(orderId) {
    document.getElementById('btn-save-status')?.addEventListener('click', async () => {
      const status = document.getElementById('order-status').value;
      await adminOrdersApi.updateStatus(orderId, status);
      showToast('Status updated');
      window.location.hash = '#/admin/orders';
    });
  }
};