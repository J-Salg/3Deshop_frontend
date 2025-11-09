import { ordersApi } from '../api/orders.js';
import { formatUSD } from '../utils/format.js';
import { showToast } from '../utils/toast.js';

export default {
  async render(id) {
    const o = await ordersApi.get(id);
    return `
      <h2>Order ${o.orderNumber}</h2>
      <div class="section">
        <div class="kv"><span>Status</span><span>${o.status}</span></div>
        <div class="kv"><span>Total</span><span>${formatUSD(o.totalPrice)}</span></div>
        <div class="kv"><span>Shipping</span><span>${o.shippingAddress}, ${o.shippingCity}, ${o.shippingPostalCode}, ${o.shippingCountry}</span></div>
        <div class="kv"><span>Created</span><span>${new Date(o.createdAt).toLocaleString()}</span></div>
      </div>
      <table class="table">
        <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${o.items.map(i => `
            <tr><td>${i.productName}</td><td>${i.quantity}</td><td>${formatUSD(i.price)}</td><td>${formatUSD(i.subtotal)}</td></tr>
          `).join('')}
        </tbody>
      </table>
      ${o.status === 'PENDING' ? `<button id="btn-cancel" class="btn danger">Cancel</button>` : ``}
    `;
  },
  async afterRender(id) {
    const btn = document.getElementById('btn-cancel');
    btn?.addEventListener('click', async () => {
      await ordersApi.cancel(id);
      showToast('Order cancelled');
      window.location.reload();
    });
  }
};