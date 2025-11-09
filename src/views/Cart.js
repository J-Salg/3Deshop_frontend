import { cartApi } from '../api/cart.js';
import { ordersApi } from '../api/orders.js';
import { formatUSD } from '../utils/format.js';
import { showToast } from '../utils/toast.js';

function renderTable(cart) {
  return `
    <table class="table">
      <thead>
        <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Subtotal</th><th></th></tr>
      </thead>
      <tbody>
        ${cart.items.map(i => `
          <tr data-id="${i.id}">
            <td>${i.product?.name || '-'}</td>
            <td>
              <input type="number" min="1" value="${i.quantity}" class="input qty" style="max-width:90px"/>
              <button class="btn btn-update">Update</button>
            </td>
            <td>${formatUSD(i.price)}</td>
            <td>${formatUSD(i.subtotal)}</td>
            <td><button class="btn danger btn-remove">Remove</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="row" style="justify-content: space-between; margin-top:12px">
      <div>Total items: <b>${cart.totalItems}</b> | Total: <b>${formatUSD(cart.totalPrice || 0)}</b></div>
      <div>
        <button id="btn-clear" class="btn">Empty</button>
        <button id="btn-checkout" class="btn primary">Checkout</button>
      </div>
    </div>
    <form id="form-checkout" class="form section" style="display:none">
      <h3>Shipping details</h3>
      <input class="input" name="shippingAddress" placeholder="Address" required/>
      <input class="input" name="shippingCity" placeholder="City" required/>
      <input class="input" name="shippingPostalCode" placeholder="Postal code" required/>
      <input class="input" name="shippingCountry" placeholder="Country" required/>
      <input class="input" name="phoneNumber" placeholder="Phone (optional)"/>
      <textarea class="input" name="notes" placeholder="Notes (optional)"></textarea>
      <button class="btn primary" type="submit">Confirm order</button>
    </form>
  `;
}

export default {
  async render() {
    const cart = await cartApi.get();
    if (!cart.items?.length) {
      return `<div class="center"><h2>Cart is empty</h2><a class="btn" href="#/" data-link>Continue shopping</a></div>`;
    }
    return renderTable(cart);
  },

  async afterRender() {
    const refresh = async () => {
      const app = document.getElementById('app');
      app.innerHTML = await this.render();
      await this.afterRender();
    };

    document.querySelectorAll('.btn-update').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const tr = e.target.closest('tr');
        const id = Number(tr.dataset.id);
        const qty = Number(tr.querySelector('.qty').value);
        await cartApi.update(id, { quantity: Math.max(1, qty) });
  showToast('Updated');
        await refresh();
      });
    });

    document.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const tr = e.target.closest('tr');
        const id = Number(tr.dataset.id);
        await cartApi.remove(id);
  showToast('Removed');
        await refresh();
      });
    });

    document.getElementById('btn-clear')?.addEventListener('click', async () => {
      await cartApi.clear();
      await refresh();
    });

    const btnCheckout = document.getElementById('btn-checkout');
    const form = document.getElementById('form-checkout');
    btnCheckout?.addEventListener('click', () => {
  form.style.display = form.style.display === 'none' ? 'grid' : 'none';
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      try {
        const order = await ordersApi.checkout(payload);
        showToast('Order created');
        window.location.hash = `#/orders/${order.id}`;
      } catch (e2) {
        showToast(e2.message || 'Checkout error');
      }
    });
  }
};